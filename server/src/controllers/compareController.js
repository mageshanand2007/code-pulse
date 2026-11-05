/**
 * Compare Controller
 * Compares two repositories side-by-side across all 6 health pillars,
 * identifying the winner and key trade-offs.
 */

import { parseRepoUrl, fetchRepositoryData, processIssuesAndPrs, processTreeStats, processCommitStats } from '../services/githubService.js';
import { analyzeReadme } from '../services/readmeAnalyzer.js';
import { scanSecurity } from '../services/securityScanner.js';
import { parseDependencies } from '../services/dependencyParser.js';
import { calculateHealthScore } from '../services/healthScorer.js';
import { DEMO_PRESETS } from '../data/demoPresets.js';

export async function compareRepositories(req, res, next) {
  try {
    const { repo1, repo2 } = req.body;
    const customGithubToken = req.headers['x-github-token'] || req.body?.githubToken;

    if (!repo1 || !repo2) {
      return res.status(400).json({
        success: false,
        error: 'Both "repo1" and "repo2" parameters are required for comparison.',
      });
    }

    const [data1, data2] = await Promise.all([
      getOrAnalyzeRepo(repo1, customGithubToken),
      getOrAnalyzeRepo(repo2, customGithubToken),
    ]);

    // Build head-to-head comparison
    const comparison = buildComparisonMatrix(data1, data2);

    res.json({
      success: true,
      repo1: data1,
      repo2: data2,
      comparison,
    });
  } catch (error) {
    next(error);
  }
}

async function getOrAnalyzeRepo(input, customToken) {
  const { owner, repo } = parseRepoUrl(input);
  const key = `${owner.toLowerCase()}/${repo.toLowerCase()}`;

  if (DEMO_PRESETS[key] && !customToken) {
    return DEMO_PRESETS[key];
  }

  const raw = await fetchRepositoryData(owner, repo, customToken);
  const treeStats = processTreeStats(raw.treeFiles);
  const issuesStats = processIssuesAndPrs(raw.issuesAndPrs, raw.repoInfo);
  const commitStats = processCommitStats(raw.recentCommits, raw.repoInfo);
  const readmeAnalysis = analyzeReadme(raw.readmeContent);
  const securityScan = scanSecurity(raw.treeFiles, raw.recentCommits, raw.communityProfile);
  const dependencyAnalysis = parseDependencies(raw.manifestFile, raw.manifestContent, raw.treeFiles);

  const healthResult = calculateHealthScore({
    repoInfo: raw.repoInfo,
    communityProfile: raw.communityProfile,
    readmeAnalysis,
    securityScan,
    dependencyAnalysis,
    issuesStats,
    commitStats,
    treeStats,
  });

  return {
    repoInfo: {
      name: raw.repoInfo.name,
      full_name: raw.repoInfo.full_name,
      owner: {
        login: raw.repoInfo.owner?.login,
        avatar_url: raw.repoInfo.owner?.avatar_url,
      },
      html_url: raw.repoInfo.html_url,
      description: raw.repoInfo.description,
      stargazers_count: raw.repoInfo.stargazers_count,
      forks_count: raw.repoInfo.forks_count,
      open_issues_count: raw.repoInfo.open_issues_count,
      license: raw.repoInfo.license,
      language: raw.repoInfo.language,
    },
    healthResult,
    readmeAnalysis,
    securityScan,
    dependencyAnalysis,
    issuesStats,
    commitStats,
    treeStats,
    commitActivity: raw.commitActivity,
  };
}

function buildComparisonMatrix(d1, d2) {
  const s1 = d1.healthResult.overallScore;
  const s2 = d2.healthResult.overallScore;

  let overallWinner = 'TIE';
  if (s1 > s2) overallWinner = d1.repoInfo.full_name;
  else if (s2 > s1) overallWinner = d2.repoInfo.full_name;

  const p1 = d1.healthResult.pillars;
  const p2 = d2.healthResult.pillars;

  const pillarComparison = [
    {
      pillar: 'Documentation',
      score1: p1.documentation.score,
      score2: p2.documentation.score,
      winner: p1.documentation.score > p2.documentation.score ? d1.repoInfo.name : (p2.documentation.score > p1.documentation.score ? d2.repoInfo.name : 'Tie'),
    },
    {
      pillar: 'Maintenance',
      score1: p1.maintenance.score,
      score2: p2.maintenance.score,
      winner: p1.maintenance.score > p2.maintenance.score ? d1.repoInfo.name : (p2.maintenance.score > p1.maintenance.score ? d2.repoInfo.name : 'Tie'),
    },
    {
      pillar: 'Issues & PRs',
      score1: p1.issuesAndPrs.score,
      score2: p2.issuesAndPrs.score,
      winner: p1.issuesAndPrs.score > p2.issuesAndPrs.score ? d1.repoInfo.name : (p2.issuesAndPrs.score > p1.issuesAndPrs.score ? d2.repoInfo.name : 'Tie'),
    },
    {
      pillar: 'Code Quality',
      score1: p1.codeQuality.score,
      score2: p2.codeQuality.score,
      winner: p1.codeQuality.score > p2.codeQuality.score ? d1.repoInfo.name : (p2.codeQuality.score > p1.codeQuality.score ? d2.repoInfo.name : 'Tie'),
    },
    {
      pillar: 'Security',
      score1: p1.security.score,
      score2: p2.security.score,
      winner: p1.security.score > p2.security.score ? d1.repoInfo.name : (p2.security.score > p1.security.score ? d2.repoInfo.name : 'Tie'),
    },
    {
      pillar: 'Dependencies',
      score1: p1.dependencies.score,
      score2: p2.dependencies.score,
      winner: p1.dependencies.score > p2.dependencies.score ? d1.repoInfo.name : (p2.dependencies.score > p1.dependencies.score ? d2.repoInfo.name : 'Tie'),
    },
  ];

  return {
    overallWinner,
    scoreDiff: Math.abs(s1 - s2),
    pillarComparison,
  };
}

export default compareRepositories;
