/**
 * Repository Health Scoring Engine
 * Computes a weighted 100-point composite health score across 6 key pillars:
 * 1. Documentation & Community (20%)
 * 2. Maintenance & Activity Cadence (20%)
 * 3. Issue & PR Velocity (18%)
 * 4. Code Quality & Architecture (16%)
 * 5. Security & Risk Posture (14%)
 * 6. Dependency Health (12%)
 */

export function calculateHealthScore({
  repoInfo,
  communityProfile,
  readmeAnalysis,
  securityScan,
  dependencyAnalysis,
  issuesStats,
  commitStats,
  treeStats,
}) {
  const pillars = {
    documentation: calculateDocScore(repoInfo, communityProfile, readmeAnalysis),
    maintenance: calculateMaintenanceScore(repoInfo, commitStats),
    issuesAndPrs: calculateIssuesPrScore(issuesStats),
    codeQuality: calculateCodeQualityScore(treeStats, repoInfo),
    security: calculateSecurityPillarScore(securityScan),
    dependencies: calculateDependencyPillarScore(dependencyAnalysis),
  };

  // Weighted overall composite score out of 100
  const compositeScore = Math.round(
    (pillars.documentation.score * 0.20) +
    (pillars.maintenance.score * 0.20) +
    (pillars.issuesAndPrs.score * 0.18) +
    (pillars.codeQuality.score * 0.16) +
    (pillars.security.score * 0.14) +
    (pillars.dependencies.score * 0.12)
  );

  const boundedScore = Math.max(0, Math.min(100, compositeScore));
  const gradeInfo = determineGrade(boundedScore);

  const strengths = [];
  const improvements = [];

  // Identify strengths & improvements
  if (pillars.documentation.score >= 80) strengths.push('Strong documentation with comprehensive README and community guidelines.');
  else improvements.push('Documentation lacks key sections (e.g., Installation, Contributing guide, or License).');

  if (pillars.maintenance.score >= 80) strengths.push('Active maintenance with regular commits and frequent activity.');
  else improvements.push('Maintenance cadence is slow or repository has had minimal recent commit activity.');

  if (pillars.issuesAndPrs.score >= 75) strengths.push('Healthy issue triage and strong PR merge turnaround rate.');
  else improvements.push('High volume of unresolved or stale issues/PRs.');

  if (pillars.codeQuality.score >= 75) strengths.push('Configured CI/CD workflows, automated testing, and linter standards.');
  else improvements.push('Missing automated CI/CD pipeline or automated test directory.');

  if (pillars.security.score >= 85) strengths.push('Clean security posture with zero exposed sensitive files and security policies in place.');
  else improvements.push('Potential security risks detected or missing SECURITY.md / .gitignore.');

  if (pillars.dependencies.score >= 80) strengths.push('Good dependency hygiene with verified lockfile and pinned versions.');
  else improvements.push('Loose dependency versioning, missing lockfile, or bloated dependency footprint.');

  return {
    overallScore: boundedScore,
    grade: gradeInfo.grade,
    gradeLabel: gradeInfo.label,
    gradeColor: gradeInfo.color,
    pillars,
    strengths,
    improvements,
  };
}

function calculateDocScore(repoInfo, communityProfile, readmeAnalysis) {
  let score = 0;
  const breakdown = [];

  // README
  if (readmeAnalysis?.present) {
    const readmePts = Math.round((readmeAnalysis.score / 100) * 8);
    score += readmePts;
    breakdown.push({ label: 'README Quality', points: readmePts, max: 8 });
  } else {
    breakdown.push({ label: 'README Missing', points: 0, max: 8 });
  }

  // Description & Topics
  if (repoInfo.description) {
    score += 2;
    breakdown.push({ label: 'Repository Description', points: 2, max: 2 });
  }
  if (repoInfo.topics && repoInfo.topics.length > 0) {
    score += 2;
    breakdown.push({ label: 'Topic Tags Defined', points: 2, max: 2 });
  }

  // License
  if (repoInfo.license || communityProfile?.files?.license) {
    score += 3;
    breakdown.push({ label: 'Open Source License', points: 3, max: 3 });
  } else {
    breakdown.push({ label: 'Missing License', points: 0, max: 3 });
  }

  // Contributing
  if (communityProfile?.files?.contributing) {
    score += 2;
    breakdown.push({ label: 'CONTRIBUTING Guide', points: 2, max: 2 });
  }

  // Code of Conduct
  if (communityProfile?.files?.code_of_conduct) {
    score += 1.5;
    breakdown.push({ label: 'Code of Conduct', points: 1.5, max: 1.5 });
  }

  // Issue/PR templates
  if (communityProfile?.files?.issue_template || communityProfile?.files?.pull_request_template) {
    score += 1.5;
    breakdown.push({ label: 'Issue / PR Templates', points: 1.5, max: 1.5 });
  }

  const normalized = Math.min(100, Math.round((score / 20) * 100));
  return {
    rawPoints: score,
    maxPoints: 20,
    score: normalized,
    breakdown,
  };
}

function calculateMaintenanceScore(repoInfo, commitStats) {
  let score = 0;
  const breakdown = [];

  if (repoInfo.archived) {
    return {
      rawPoints: 0,
      maxPoints: 20,
      score: 10,
      breakdown: [{ label: 'Repository Archived', points: 0, max: 20 }],
    };
  }

  // Recency of last commit
  const daysSinceLastCommit = commitStats?.daysSinceLastCommit ?? 999;
  let recencyPts = 0;
  if (daysSinceLastCommit <= 7) recencyPts = 8;
  else if (daysSinceLastCommit <= 30) recencyPts = 6;
  else if (daysSinceLastCommit <= 90) recencyPts = 4;
  else if (daysSinceLastCommit <= 180) recencyPts = 2;
  score += recencyPts;
  breakdown.push({ label: 'Recent Commit Activity', points: recencyPts, max: 8 });

  // Commit volume in last period
  const recentCommitCount = commitStats?.recentCommitCount || 0;
  let volumePts = 0;
  if (recentCommitCount >= 20) volumePts = 6;
  else if (recentCommitCount >= 8) volumePts = 4;
  else if (recentCommitCount >= 2) volumePts = 2;
  score += volumePts;
  breakdown.push({ label: 'Commit Velocity (Last 4 Weeks)', points: volumePts, max: 6 });

  // Releases or tags presence
  if (repoInfo.has_releases || commitStats?.hasReleases) {
    score += 4;
    breakdown.push({ label: 'Formal Release Tags', points: 4, max: 4 });
  } else {
    score += 2;
    breakdown.push({ label: 'Direct Branch Workflow', points: 2, max: 4 });
  }

  // Active status
  score += 2;
  breakdown.push({ label: 'Active (Non-archived)', points: 2, max: 2 });

  const normalized = Math.min(100, Math.round((score / 20) * 100));
  return {
    rawPoints: score,
    maxPoints: 20,
    score: normalized,
    breakdown,
  };
}

function calculateIssuesPrScore(issuesStats) {
  let score = 0;
  const breakdown = [];

  if (!issuesStats || issuesStats.totalIssues === 0) {
    // If no issues, neutral good score
    return {
      rawPoints: 14,
      maxPoints: 18,
      score: 78,
      breakdown: [{ label: 'Low/No Issues Volume', points: 14, max: 18 }],
    };
  }

  // Close rate
  const closeRate = issuesStats.closeRate || 0;
  let closePts = 0;
  if (closeRate >= 80) closePts = 7;
  else if (closeRate >= 60) closePts = 5;
  else if (closeRate >= 40) closePts = 3;
  else closePts = 1;
  score += closePts;
  breakdown.push({ label: `Issue Close Rate (${closeRate}%)`, points: closePts, max: 7 });

  // PR merge rate
  const prMergeRate = issuesStats.prMergeRate || 50;
  let prPts = 0;
  if (prMergeRate >= 70) prPts = 6;
  else if (prMergeRate >= 50) prPts = 4;
  else if (prMergeRate >= 30) prPts = 2;
  score += prPts;
  breakdown.push({ label: `PR Merge Velocity (${prMergeRate}%)`, points: prPts, max: 6 });

  // Stale ratio
  const stalePercent = issuesStats.stalePercent || 0;
  let stalePts = 5;
  if (stalePercent > 50) stalePts = 1;
  else if (stalePercent > 30) stalePts = 2.5;
  else if (stalePercent > 15) stalePts = 4;
  score += stalePts;
  breakdown.push({ label: `Stale Issues Ratio (${stalePercent}%)`, points: stalePts, max: 5 });

  const normalized = Math.min(100, Math.round((score / 18) * 100));
  return {
    rawPoints: score,
    maxPoints: 18,
    score: normalized,
    breakdown,
  };
}

function calculateCodeQualityScore(treeStats, repoInfo) {
  let score = 0;
  const breakdown = [];

  // CI/CD pipelines
  if (treeStats?.hasCiCd) {
    score += 6;
    breakdown.push({ label: 'CI/CD Workflows Detected', points: 6, max: 6 });
  } else {
    breakdown.push({ label: 'Missing Automated CI/CD', points: 0, max: 6 });
  }

  // Automated Tests
  if (treeStats?.hasTests) {
    score += 5;
    breakdown.push({ label: 'Test Suite & Directory', points: 5, max: 5 });
  } else {
    breakdown.push({ label: 'Missing Tests Suite', points: 0, max: 5 });
  }

  // Linters / Formatters
  if (treeStats?.hasLinters) {
    score += 3;
    breakdown.push({ label: 'Code Linters / Formatters', points: 3, max: 3 });
  } else {
    breakdown.push({ label: 'Missing Linter Config', points: 0, max: 3 });
  }

  // Repository Structure
  if (treeStats?.totalFiles > 5) {
    score += 2;
    breakdown.push({ label: 'Structured Codebase', points: 2, max: 2 });
  }

  const normalized = Math.min(100, Math.round((score / 16) * 100));
  return {
    rawPoints: score,
    maxPoints: 16,
    score: normalized,
    breakdown,
  };
}

function calculateSecurityPillarScore(securityScan) {
  const score = securityScan?.score ?? 80;
  return {
    rawPoints: Math.round((score / 100) * 14),
    maxPoints: 14,
    score,
    breakdown: [
      { label: `Security Risk Level: ${securityScan?.riskLevel || 'LOW'}`, points: Math.round((score / 100) * 14), max: 14 }
    ],
  };
}

function calculateDependencyPillarScore(dependencyAnalysis) {
  const score = dependencyAnalysis?.healthScore ?? 75;
  return {
    rawPoints: Math.round((score / 100) * 12),
    maxPoints: 12,
    score,
    breakdown: [
      { label: `Ecosystem: ${dependencyAnalysis?.ecosystem || 'General'}`, points: Math.round((score / 100) * 12), max: 12 }
    ],
  };
}

function determineGrade(score) {
  if (score >= 90) return { grade: 'A+', label: 'Exceptional', color: 'emerald' };
  if (score >= 80) return { grade: 'A', label: 'Healthy & Maintained', color: 'cyan' };
  if (score >= 70) return { grade: 'B', label: 'Good Posture', color: 'indigo' };
  if (score >= 55) return { grade: 'C', label: 'Needs Attention', color: 'amber' };
  if (score >= 40) return { grade: 'D', label: 'At Risk', color: 'rose' };
  return { grade: 'F', label: 'Critical Neglect', color: 'rose' };
}

export default calculateHealthScore;
