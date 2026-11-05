/**
 * GitHub Service
 * Manages GitHub REST API requests, parsing repo URLs, fetching metadata,
 * issues, PRs, commit activity, file trees, and rate limits.
 */

import { Octokit } from '@octokit/rest';
import axios from 'axios';
import { memoryCache } from '../utils/cache.js';

/**
 * Normalizes input string/URL to { owner, repo }
 */
export function parseRepoUrl(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Please provide a valid GitHub repository URL or owner/repo identifier.');
  }

  let cleaned = input.trim();
  // Strip trailing slashes or .git
  cleaned = cleaned.replace(/\.git\/?$/, '').replace(/\/+$/, '');

  // Regex patterns
  // 1. https://github.com/owner/repo
  // 2. github.com/owner/repo
  // 3. owner/repo
  const match = cleaned.match(/(?:(?:https?:\/\/)?github\.com\/)?([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i);

  if (!match || !match[1] || !match[2]) {
    throw new Error('Invalid GitHub repository format. Expected format: "owner/repo" or "https://github.com/owner/repo"');
  }

  return {
    owner: match[1],
    repo: match[2],
  };
}

/**
 * Returns an Octokit instance with optional token
 */
export function getOctokit(customToken) {
  const token = customToken || process.env.GITHUB_TOKEN;
  return new Octokit({
    auth: token && token.trim() !== '' ? token.trim() : undefined,
    userAgent: 'CodePulse-Repo-Monitor/1.0',
  });
}

/**
 * Fetches current rate limit status
 */
export async function getRateLimitStatus(customToken) {
  const octokit = getOctokit(customToken);
  try {
    const { data } = await octokit.rest.rateLimit.get();
    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: new Date(data.rate.reset * 1000).toISOString(),
      used: data.rate.used,
      authenticated: Boolean(customToken || process.env.GITHUB_TOKEN),
    };
  } catch (error) {
    return {
      limit: 60,
      remaining: 60,
      reset: new Date(Date.now() + 3600000).toISOString(),
      used: 0,
      authenticated: false,
      error: error.message,
    };
  }
}

/**
 * Fetches all necessary repository data from GitHub REST API
 */
export async function fetchRepositoryData(owner, repo, customToken) {
  const cacheKey = `github:${owner.toLowerCase()}/${repo.toLowerCase()}`;
  const cached = memoryCache.get(cacheKey);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  const octokit = getOctokit(customToken);

  // 1. Fetch Repository Details
  let repoInfo;
  try {
    const { data } = await octokit.rest.repos.get({ owner, repo });
    repoInfo = data;
  } catch (error) {
    if (error.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" was not found or is private.`);
    }
    if (error.status === 403 && error.message.includes('rate limit')) {
      throw new Error('GitHub API rate limit exceeded. Add a GITHUB_TOKEN in settings or wait a few minutes.');
    }
    throw new Error(`Failed to fetch repository: ${error.message}`);
  }

  // 2. Fetch Community Profile
  let communityProfile = null;
  try {
    const { data } = await octokit.rest.repos.getCommunityProfileMetrics({ owner, repo });
    communityProfile = data;
  } catch {
    // Non-critical, community profile might 404 or be unavailable
    communityProfile = null;
  }

  // 3. Fetch Commits (recent 50)
  let recentCommits = [];
  try {
    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 50,
    });
    recentCommits = data;
  } catch (e) {
    console.warn(`Could not fetch commits for ${owner}/${repo}:`, e.message);
  }

  // 4. Fetch Issues and PRs
  let issuesAndPrs = [];
  try {
    const { data } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      per_page: 100,
      sort: 'updated',
    });
    issuesAndPrs = data;
  } catch (e) {
    console.warn(`Could not fetch issues for ${owner}/${repo}:`, e.message);
  }

  // 5. Fetch File Tree (Default Branch)
  let treeFiles = [];
  try {
    const branch = repoInfo.default_branch || 'main';
    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: '1',
    });
    treeFiles = data.tree || [];
  } catch (e) {
    console.warn(`Could not fetch recursive git tree for ${owner}/${repo}:`, e.message);
    // Fallback: list root contents
    try {
      const { data } = await octokit.rest.repos.getContent({ owner, repo, path: '' });
      if (Array.isArray(data)) {
        treeFiles = data.map(item => ({ path: item.name, type: item.type }));
      }
    } catch {}
  }

  // 6. Fetch README content
  let readmeContent = '';
  try {
    const { data } = await octokit.rest.repos.getReadme({ owner, repo });
    if (data.content) {
      readmeContent = Buffer.from(data.content, 'base64').toString('utf8');
    }
  } catch {
    readmeContent = '';
  }

  // 7. Detect & Fetch Package Manifest
  const manifestFile = detectManifestFile(treeFiles);
  let manifestContent = '';
  if (manifestFile) {
    try {
      const { data } = await octokit.rest.repos.getContent({ owner, repo, path: manifestFile });
      if (data.content) {
        manifestContent = Buffer.from(data.content, 'base64').toString('utf8');
      }
    } catch {}
  }

  // 8. Fetch Weekly Commit Activity stats (last 52 weeks or fallback from commits)
  let commitActivity = [];
  try {
    const { data } = await octokit.rest.repos.getCommitActivityStats({ owner, repo });
    if (Array.isArray(data) && data.length > 0) {
      commitActivity = data.slice(-12).map((week, idx) => ({
        week: `Week ${idx + 1}`,
        timestamp: week.week,
        commits: week.total,
        days: week.days,
      }));
    }
  } catch {}

  // If commitActivity is empty (e.g. GitHub statistics generating or rate limit), synthesize from recentCommits
  if (commitActivity.length === 0 && recentCommits.length > 0) {
    commitActivity = buildCommitActivityFromCommits(recentCommits);
  }

  // 9. Fetch Contributors (top 10)
  let contributors = [];
  try {
    const { data } = await octokit.rest.repos.listContributors({ owner, repo, per_page: 10 });
    contributors = (data || []).map(c => ({
      login: c.login,
      avatar_url: c.avatar_url,
      contributions: c.contributions,
      html_url: c.html_url,
    }));
  } catch {}

  const result = {
    repoInfo,
    communityProfile,
    recentCommits,
    issuesAndPrs,
    treeFiles,
    readmeContent,
    manifestFile,
    manifestContent,
    commitActivity,
    contributors,
    fetchedAt: new Date().toISOString(),
  };

  // Cache result for 15 minutes
  memoryCache.set(cacheKey, result);

  return result;
}

/**
 * Detects the first available package manifest from the tree
 */
function detectManifestFile(treeFiles = []) {
  const manifests = ['package.json', 'requirements.txt', 'Cargo.toml', 'go.mod', 'pom.xml'];
  for (const f of treeFiles) {
    const path = typeof f === 'string' ? f : (f.path || '');
    if (manifests.includes(path)) {
      return path;
    }
  }
  return null;
}

/**
 * Helper to build 8-week commit chart from recent commit dates
 */
function buildCommitActivityFromCommits(commits) {
  const weeks = [0, 0, 0, 0, 0, 0, 0, 0];
  const now = Date.now();
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

  for (const c of commits) {
    const dateStr = c.commit?.author?.date || c.commit?.committer?.date;
    if (!dateStr) continue;
    const time = new Date(dateStr).getTime();
    const diffWeeks = Math.floor((now - time) / ONE_WEEK);
    if (diffWeeks >= 0 && diffWeeks < 8) {
      weeks[7 - diffWeeks]++;
    }
  }

  return weeks.map((count, i) => ({
    week: `W${i + 1}`,
    commits: count,
  }));
}

/**
 * Processes issues and PR stats from the combined list
 */
export function processIssuesAndPrs(rawList = [], repoInfo = {}) {
  let openIssues = 0;
  let closedIssues = 0;
  let openPrs = 0;
  let closedPrs = 0;
  let mergedPrs = 0;
  let staleCount = 0;

  const now = Date.now();
  const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;
  const resolutionTimes = [];

  for (const item of rawList) {
    const isPr = Boolean(item.pull_request);
    const isClosed = item.state === 'closed';
    const updatedAt = new Date(item.updated_at).getTime();
    const isStale = (now - updatedAt) > SIXTY_DAYS && !isClosed;

    if (isStale) staleCount++;

    if (isPr) {
      if (isClosed) {
        closedPrs++;
        if (item.pull_request?.merged_at || item.merged_at) {
          mergedPrs++;
        }
      } else {
        openPrs++;
      }
    } else {
      if (isClosed) {
        closedIssues++;
        if (item.closed_at) {
          const createdAt = new Date(item.created_at).getTime();
          const closedAt = new Date(item.closed_at).getTime();
          resolutionTimes.push(Math.max(0, (closedAt - createdAt) / (1000 * 60 * 60 * 24)));
        }
      } else {
        openIssues++;
      }
    }
  }

  // Calculate median resolution time in days
  resolutionTimes.sort((a, b) => a - b);
  const medianDays = resolutionTimes.length > 0
    ? Math.round(resolutionTimes[Math.floor(resolutionTimes.length / 2)] * 10) / 10
    : 3.5;

  const totalIssues = openIssues + closedIssues;
  const closeRate = totalIssues > 0 ? Math.round((closedIssues / totalIssues) * 100) : 100;

  const totalPrs = openPrs + closedPrs;
  const prMergeRate = totalPrs > 0 ? Math.round((mergedPrs / totalPrs) * 100) : 80;

  const stalePercent = totalIssues > 0 ? Math.round((staleCount / totalIssues) * 100) : 0;

  return {
    openIssues: repoInfo.open_issues_count ?? openIssues,
    closedIssues,
    totalIssues,
    closeRate,
    openPrs,
    closedPrs,
    mergedPrs,
    totalPrs,
    prMergeRate,
    medianResolutionDays: medianDays,
    staleCount,
    stalePercent,
  };
}

/**
 * Extracts tree statistics (CI/CD, tests, linters)
 */
export function processTreeStats(treeFiles = []) {
  let hasCiCd = false;
  let hasTests = false;
  let hasLinters = false;

  const linterFiles = ['.eslintrc', 'biome.json', '.prettierrc', 'prettier.config', 'ruff.toml', '.golangci.yml', '.flake8'];
  const testPatterns = [/\/tests?\//i, /\/__tests__\//i, /\/spec\//i, /\.test\.[a-z]+$/i, /\.spec\.[a-z]+$/i, /jest\.config/i, /vitest\.config/i, /pytest\.ini/i];

  for (const f of treeFiles) {
    const path = typeof f === 'string' ? f : (f.path || '');

    if (path.startsWith('.github/workflows') || path.includes('.travis.yml') || path.includes('.circleci')) {
      hasCiCd = true;
    }

    for (const pat of testPatterns) {
      if (pat.test(path)) {
        hasTests = true;
        break;
      }
    }

    for (const lf of linterFiles) {
      if (path.includes(lf)) {
        hasLinters = true;
        break;
      }
    }
  }

  return {
    totalFiles: treeFiles.length,
    hasCiCd,
    hasTests,
    hasLinters,
  };
}

/**
 * Extracts commit statistics
 */
export function processCommitStats(commits = [], repoInfo = {}) {
  let daysSinceLastCommit = 999;
  if (commits.length > 0) {
    const latestDate = commits[0].commit?.author?.date || commits[0].commit?.committer?.date;
    if (latestDate) {
      daysSinceLastCommit = Math.max(0, Math.round((Date.now() - new Date(latestDate).getTime()) / (1000 * 60 * 60 * 24)));
    }
  }

  const ONE_MONTH_AGO = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentCommitCount = commits.filter(c => {
    const d = c.commit?.author?.date || c.commit?.committer?.date;
    return d && new Date(d).getTime() > ONE_MONTH_AGO;
  }).length;

  return {
    daysSinceLastCommit,
    recentCommitCount,
    hasReleases: Boolean(repoInfo.has_releases),
    lastCommitDate: commits[0]?.commit?.author?.date || null,
  };
}

export default {
  parseRepoUrl,
  fetchRepositoryData,
  getRateLimitStatus,
  processIssuesAndPrs,
  processTreeStats,
  processCommitStats,
};
