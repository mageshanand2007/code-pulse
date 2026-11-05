/**
 * Groq AI Recommendations Service
 * Uses Groq API with Llama-3.3-70b / Llama-3.1-8b to generate actionable,
 * prioritized suggestions for improving the repository.
 * Includes a robust heuristic fallback engine when Groq API key is not configured.
 */

import Groq from 'groq-sdk';

export async function generateSuggestions({
  repoInfo,
  healthResult,
  readmeAnalysis,
  securityScan,
  dependencyAnalysis,
  issuesStats,
  apiKey = process.env.GROQ_API_KEY,
  model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
}) {
  // If no Groq API key, return rule-based intelligent suggestions
  if (!apiKey || apiKey.trim() === '') {
    return generateFallbackSuggestions({
      repoInfo,
      healthResult,
      readmeAnalysis,
      securityScan,
      dependencyAnalysis,
      issuesStats,
      reason: 'Rule-based engine active. Provide a GROQ_API_KEY in server/.env or in the dashboard settings to enable live LLM synthesis.',
    });
  }

  try {
    const groq = new Groq({ apiKey });

    const promptContext = {
      repository: repoInfo.full_name,
      description: repoInfo.description || 'No description provided',
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      license: repoInfo.license?.name || 'No license detected',
      healthScore: healthResult.overallScore,
      grade: healthResult.grade,
      pillars: {
        documentation: healthResult.pillars.documentation.score,
        maintenance: healthResult.pillars.maintenance.score,
        issuesAndPrs: healthResult.pillars.issuesAndPrs.score,
        codeQuality: healthResult.pillars.codeQuality.score,
        security: healthResult.pillars.security.score,
        dependencies: healthResult.pillars.dependencies.score,
      },
      missingReadmeSections: readmeAnalysis?.missingSections || [],
      securityIssues: securityScan?.issues?.map(i => i.message) || [],
      exposedFiles: securityScan?.exposedFiles || [],
      missingSecurityPolicy: !securityScan?.hasSecurityPolicy,
      missingDependabot: !securityScan?.hasDependabot,
      dependencyWarnings: dependencyAnalysis?.warnings || [],
      hasLockfile: dependencyAnalysis?.hasLockfile,
      issueCloseRate: issuesStats?.closeRate,
      prMergeRate: issuesStats?.prMergeRate,
      staleIssuesPercent: issuesStats?.stalePercent,
    };

    const completion = await groq.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: `You are an expert open-source maintainer, software architect, and DevSecOps specialist analyzing a GitHub repository.
Your task is to analyze the repository health metrics and generate high-impact, prioritized, actionable suggestions.
Respond ONLY with a valid JSON object matching this schema:
{
  "summary": "2-3 sentence executive assessment of the repository health and maturity.",
  "source": "groq-llama-3.3",
  "recommendations": [
    {
      "id": 1,
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "category": "Security" | "CI/CD" | "Documentation" | "Maintenance" | "Dependencies",
      "title": "Short punchy recommendation title",
      "description": "Clear explanation of why this matters for the project",
      "action": "Concrete step-by-step instructions to implement the fix",
      "codeSnippet": "Optional copy-pasteable code or config file snippet (e.g. YAML or Markdown) if applicable"
    }
  ]
}
Ensure there are 4 to 6 prioritized recommendations. Always return pure JSON with no markdown backticks surrounding the JSON.`,
        },
        {
          role: 'user',
          content: `Analyze this repository data and output actionable suggestions:\n${JSON.stringify(promptContext, null, 2)}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (responseContent) {
      const parsed = JSON.parse(responseContent);
      parsed.source = `Groq (${model})`;
      return parsed;
    }
  } catch (error) {
    console.warn('Groq API call failed, reverting to intelligent fallback engine:', error.message);
  }

  // Fallback if API call throws or returns empty
  return generateFallbackSuggestions({
    repoInfo,
    healthResult,
    readmeAnalysis,
    securityScan,
    dependencyAnalysis,
    issuesStats,
    reason: 'Groq API error or rate limit. Rule-based suggestions generated instead.',
  });
}

/**
 * Intelligent heuristic fallback engine that builds realistic, highly relevant
 * suggestions based on detected gaps in the repository.
 */
export function generateFallbackSuggestions({
  repoInfo,
  healthResult,
  readmeAnalysis,
  securityScan,
  dependencyAnalysis,
  issuesStats,
  reason,
}) {
  const recommendations = [];
  let id = 1;

  // 1. Security Checks
  if (securityScan?.exposedFiles && securityScan.exposedFiles.length > 0) {
    recommendations.push({
      id: id++,
      priority: 'HIGH',
      category: 'Security',
      title: 'Purge Exposed Sensitive Files from Git History',
      description: `Detected committed sensitive files: ${securityScan.exposedFiles.map(f => f.file).join(', ')}. These can expose API keys, database credentials, or private certificates.`,
      action: 'Rotate all compromised secrets immediately. Remove the files from git tracking and consider running git-filter-repo to clean commits.',
      codeSnippet: `# Remove from git tracking while keeping local file:\ngit rm --cached <sensitive-file>\necho "<sensitive-file>" >> .gitignore\ngit commit -m "security: remove sensitive file from tracking"`,
    });
  }

  if (!securityScan?.hasSecurityPolicy) {
    recommendations.push({
      id: id++,
      priority: 'MEDIUM',
      category: 'Security',
      title: 'Establish a SECURITY.md Vulnerability Disclosure Policy',
      description: 'Repositories without a security policy force security researchers to open public issues for zero-days, risking exploit exposure.',
      action: 'Create a SECURITY.md in the root or .github/ folder with contact information and triage timelines.',
      codeSnippet: `# Security Policy\n\n## Reporting a Vulnerability\nPlease do NOT report security vulnerabilities through public GitHub issues.\n\nSend an email to security@${repoInfo.name || 'yourdomain'}.com with details and reproduction steps.`,
    });
  }

  if (!securityScan?.hasDependabot) {
    recommendations.push({
      id: id++,
      priority: 'MEDIUM',
      category: 'Security',
      title: 'Enable Automated Dependency Scanning with Dependabot',
      description: 'Automatically discover vulnerabilities in third-party packages and receive automated pull requests with patched versions.',
      action: 'Create .github/dependabot.yml in the repository root.',
      codeSnippet: `version: 2\nupdates:\n  - package-ecosystem: "${dependencyAnalysis?.ecosystem?.includes('Python') ? 'pip' : 'npm'}"\n    directory: "/"\n    schedule:\n      interval: "weekly"`,
    });
  }

  // 2. CI/CD and Testing
  if (healthResult.pillars.codeQuality.score < 60) {
    recommendations.push({
      id: id++,
      priority: 'HIGH',
      category: 'CI/CD',
      title: 'Add Automated Continuous Integration (CI) Workflow',
      description: 'Automated CI catches regressions, runs tests, and enforces linting standards before pull requests are merged.',
      action: 'Add a GitHub Actions workflow in .github/workflows/ci.yml.',
      codeSnippet: `name: CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm test`,
    });
  }

  // 3. Documentation
  if (readmeAnalysis?.missingSections && readmeAnalysis.missingSections.length > 0) {
    const missing = readmeAnalysis.missingSections.slice(0, 3).join(', ');
    recommendations.push({
      id: id++,
      priority: 'MEDIUM',
      category: 'Documentation',
      title: `Expand README with ${missing}`,
      description: 'First-time users and potential contributors decide whether to use a repository within 30 seconds of landing on its README.',
      action: 'Add structured sections for Quickstart, Installation commands, and Usage examples with code blocks.',
      codeSnippet: `## Quick Start\n\n\`\`\`bash\n# 1. Clone repository\ngit clone https://github.com/${repoInfo.full_name}.git\n\n# 2. Install dependencies\nnpm install\n\n# 3. Start development server\nnpm run dev\n\`\`\``,
    });
  }

  if (!repoInfo.license) {
    recommendations.push({
      id: id++,
      priority: 'HIGH',
      category: 'Documentation',
      title: 'Add an Open-Source License (MIT or Apache-2.0)',
      description: 'Without an explicit LICENSE file, default copyright laws apply, meaning no one can legally use, modify, or distribute your code.',
      action: 'Add a LICENSE file in the repository root. The MIT License is recommended for maximum community adoption.',
      codeSnippet: `MIT License\n\nCopyright (c) ${new Date().getFullYear()} ${repoInfo.owner?.login || 'Maintainers'}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy...`,
    });
  }

  // 4. Dependencies
  if (dependencyAnalysis?.detected && !dependencyAnalysis?.hasLockfile && dependencyAnalysis.totalDependencies > 0) {
    recommendations.push({
      id: id++,
      priority: 'HIGH',
      category: 'Dependencies',
      title: 'Commit Lockfile for Deterministic Builds',
      description: 'Missing package-lock.json or lockfile causes builds to unpredictably pull newer transitive dependencies, leading to breaking changes across team environments.',
      action: 'Run your package manager install command and commit the resulting lockfile to Git.',
      codeSnippet: `npm install\ngit add package-lock.json\ngit commit -m "chore: commit package-lock.json for reproducible builds"`,
    });
  }

  // 5. Issues & Maintenance
  if (issuesStats && issuesStats.closeRate < 50 && issuesStats.totalIssues > 10) {
    recommendations.push({
      id: id++,
      priority: 'LOW',
      category: 'Maintenance',
      title: 'Triage Stale and Inactive Issues',
      description: `Only ${issuesStats.closeRate}% of issues have been closed. A growing backlog of unaddressed issues discourages new contributors.`,
      action: 'Adopt the GitHub Stale Action or schedule a recurring triage day to label, respond to, or close inactive issues.',
      codeSnippet: `name: "Close Stale Issues"\non:\n  schedule:\n    - cron: "0 0 * * *"\njobs:\n  stale:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/stale@v9\n        with:\n          days-before-stale: 60\n          days-before-close: 14`,
    });
  }

  return {
    summary: `Repository ${repoInfo.full_name} has an overall health rating of ${healthResult.overallScore}/100 (${healthResult.grade}). While the core codebase is active, implementing standard CI automation, security disclosures, and documentation enhancements will significantly elevate maintainability and community confidence.`,
    source: 'CodePulse Heuristic Engine (Offline / Fallback)',
    notice: reason,
    recommendations,
  };
}

export default generateSuggestions;
