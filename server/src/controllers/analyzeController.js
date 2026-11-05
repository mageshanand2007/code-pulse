/**
 * Analyze Controller
 * Orchestrates repo fetching, metrics extraction, security scanning,
 * dependency parsing, health scoring, and AI recommendations.
 */

import {
  parseRepoUrl,
  fetchRepositoryData,
  getRateLimitStatus,
  processIssuesAndPrs,
  processTreeStats,
  processCommitStats,
} from '../services/githubService.js';
import { analyzeReadme } from '../services/readmeAnalyzer.js';
import { scanSecurity } from '../services/securityScanner.js';
import { parseDependencies } from '../services/dependencyParser.js';
import { calculateHealthScore } from '../services/healthScorer.js';
import { generateSuggestions } from '../services/groqService.js';
import { DEMO_PRESETS } from '../data/demoPresets.js';
import { memoryCache } from '../utils/cache.js';

export async function analyzeRepository(req, res, next) {
  const startTime = Date.now();
  try {
    const input = req.query.repo || req.body?.repo;
    const customGithubToken = req.headers['x-github-token'] || req.body?.githubToken;
    const customGroqKey = req.headers['x-groq-key'] || req.body?.groqKey;
    const forceFresh = req.query.fresh === 'true' || req.body?.fresh === true;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Missing repository parameter. Provide a repository URL or "owner/repo" format.',
      });
    }

    const { owner, repo } = parseRepoUrl(input);
    const repoIdentifier = `${owner.toLowerCase()}/${repo.toLowerCase()}`;

    // Check if it's a known demo preset and not forcing fresh live fetch
    if (!forceFresh && DEMO_PRESETS[repoIdentifier] && !customGithubToken) {
      const presetData = DEMO_PRESETS[repoIdentifier];
      return res.json({
        success: true,
        source: 'demo-preset',
        data: presetData,
        executionTimeMs: Date.now() - startTime,
      });
    }

    // If forcing fresh, invalidate cache
    if (forceFresh) {
      memoryCache.delete(`github:${repoIdentifier}`);
    }

    // 1. Fetch raw repository data from GitHub
    const repoData = await fetchRepositoryData(owner, repo, customGithubToken);

    // 2. Process metrics
    const treeStats = processTreeStats(repoData.treeFiles);
    const issuesStats = processIssuesAndPrs(repoData.issuesAndPrs, repoData.repoInfo);
    const commitStats = processCommitStats(repoData.recentCommits, repoData.repoInfo);

    // 3. Analyze README
    const readmeAnalysis = analyzeReadme(repoData.readmeContent);

    // 4. Scan Security Risks
    const securityScan = scanSecurity(repoData.treeFiles, repoData.recentCommits, repoData.communityProfile);

    // 5. Parse Dependencies
    const dependencyAnalysis = parseDependencies(
      repoData.manifestFile,
      repoData.manifestContent,
      repoData.treeFiles
    );

    // 6. Calculate Health Score
    const healthResult = calculateHealthScore({
      repoInfo: repoData.repoInfo,
      communityProfile: repoData.communityProfile,
      readmeAnalysis,
      securityScan,
      dependencyAnalysis,
      issuesStats,
      commitStats,
      treeStats,
    });

    // 7. Generate AI Suggestions (Groq API or heuristic fallback)
    const suggestions = await generateSuggestions({
      repoInfo: repoData.repoInfo,
      healthResult,
      readmeAnalysis,
      securityScan,
      dependencyAnalysis,
      issuesStats,
      apiKey: customGroqKey || process.env.GROQ_API_KEY,
    });

    const payload = {
      repoInfo: {
        name: repoData.repoInfo.name,
        full_name: repoData.repoInfo.full_name,
        owner: {
          login: repoData.repoInfo.owner?.login,
          avatar_url: repoData.repoInfo.owner?.avatar_url,
          html_url: repoData.repoInfo.owner?.html_url,
        },
        html_url: repoData.repoInfo.html_url,
        description: repoData.repoInfo.description,
        stargazers_count: repoData.repoInfo.stargazers_count,
        forks_count: repoData.repoInfo.forks_count,
        open_issues_count: repoData.repoInfo.open_issues_count,
        watchers_count: repoData.repoInfo.watchers_count,
        subscribers_count: repoData.repoInfo.subscribers_count,
        license: repoData.repoInfo.license,
        topics: repoData.repoInfo.topics || [],
        default_branch: repoData.repoInfo.default_branch,
        archived: repoData.repoInfo.archived,
        created_at: repoData.repoInfo.created_at,
        updated_at: repoData.repoInfo.updated_at,
        pushed_at: repoData.repoInfo.pushed_at,
        language: repoData.repoInfo.language,
        size: repoData.repoInfo.size,
      },
      healthResult,
      readmeAnalysis,
      securityScan,
      dependencyAnalysis,
      issuesStats,
      commitStats,
      commitActivity: repoData.commitActivity,
      contributors: repoData.contributors,
      treeStats,
      suggestions,
    };

    return res.json({
      success: true,
      source: repoData.fromCache ? 'cache' : 'github-live',
      data: payload,
      executionTimeMs: Date.now() - startTime,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRateLimit(req, res, next) {
  try {
    const customToken = req.headers['x-github-token'];
    const status = await getRateLimitStatus(customToken);
    res.json({ success: true, rateLimit: status });
  } catch (error) {
    next(error);
  }
}

export async function getPresets(req, res) {
  const presets = Object.keys(DEMO_PRESETS).map(key => {
    const item = DEMO_PRESETS[key];
    return {
      key,
      name: item.repoInfo.full_name,
      description: item.repoInfo.description,
      stars: item.repoInfo.stargazers_count,
      score: item.healthResult.overallScore,
      grade: item.healthResult.grade,
      avatar: item.repoInfo.owner?.avatar_url,
    };
  });
  res.json({ success: true, presets });
}

export async function clearCache(req, res) {
  memoryCache.clear();
  res.json({ success: true, message: 'In-memory cache cleared successfully.' });
}
