import test from 'node:test';
import assert from 'node:assert';
import { calculateHealthScore } from '../src/services/healthScorer.js';
import { analyzeReadme } from '../src/services/readmeAnalyzer.js';
import { parseRepoUrl } from '../src/services/githubService.js';
import { scanSecurity } from '../src/services/securityScanner.js';
import { parseDependencies } from '../src/services/dependencyParser.js';

test('parseRepoUrl should parse various GitHub URL formats', () => {
  const t1 = parseRepoUrl('facebook/react');
  assert.strictEqual(t1.owner, 'facebook');
  assert.strictEqual(t1.repo, 'react');

  const t2 = parseRepoUrl('https://github.com/expressjs/express');
  assert.strictEqual(t2.owner, 'expressjs');
  assert.strictEqual(t2.repo, 'express');

  const t3 = parseRepoUrl('github.com/vercel/next.js.git/');
  assert.strictEqual(t3.owner, 'vercel');
  assert.strictEqual(t3.repo, 'next.js');
});

test('analyzeReadme should evaluate length, headers, and essential sections', () => {
  const sampleReadme = `
# Awesome Project
[![Build](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)

## Installation
\`\`\`bash
npm install awesome-project
\`\`\`

## Usage
\`\`\`javascript
import awesome from 'awesome-project';
awesome.run();
\`\`\`

## Features
- Blazing fast
- Secure

## Contributing
Please see CONTRIBUTING.md.

## License
MIT License
`;

  const analysis = analyzeReadme(sampleReadme);
  assert.strictEqual(analysis.present, true);
  assert.ok(['Good', 'Excellent'].includes(analysis.readabilityGrade));
  assert.ok(analysis.score >= 70);
  assert.ok(analysis.sections.installation);
  assert.ok(analysis.sections.usage);
});

test('scanSecurity should detect committed sensitive files', () => {
  const tree = [
    { path: 'src/index.js' },
    { path: '.env' },
    { path: '.gitignore' },
  ];
  const scan = scanSecurity(tree, []);
  assert.strictEqual(scan.hasGitignore, true);
  assert.ok(scan.exposedFiles.length > 0);
  assert.strictEqual(scan.exposedFiles[0].file, '.env');
  assert.strictEqual(scan.riskLevel, 'CRITICAL');
});

test('parseDependencies should parse package.json and flag lockfile status', () => {
  const pkgJson = JSON.stringify({
    name: 'test-app',
    dependencies: {
      react: '^18.0.0',
      lodash: '*',
    },
    devDependencies: {
      vite: '^5.0.0',
    },
  });

  const parsed = parseDependencies('package.json', pkgJson, [{ path: 'package-lock.json' }]);
  assert.strictEqual(parsed.ecosystem, 'Node.js / JavaScript');
  assert.strictEqual(parsed.directCount, 2);
  assert.strictEqual(parsed.devCount, 1);
  assert.strictEqual(parsed.hasLockfile, true);
  assert.strictEqual(parsed.unpinnedCount, 1);
});

test('calculateHealthScore should compute a composite score between 0 and 100', () => {
  const result = calculateHealthScore({
    repoInfo: {
      description: 'Test repository',
      topics: ['testing', 'nodejs'],
      license: { name: 'MIT' },
      archived: false,
    },
    communityProfile: {
      files: {
        contributing: true,
        code_of_conduct: true,
        issue_template: true,
      },
    },
    readmeAnalysis: { present: true, score: 90 },
    securityScan: { score: 95, riskLevel: 'LOW' },
    dependencyAnalysis: { healthScore: 90, ecosystem: 'Node.js' },
    issuesStats: { closeRate: 85, prMergeRate: 80, stalePercent: 5 },
    commitStats: { daysSinceLastCommit: 2, recentCommitCount: 15, hasReleases: true },
    treeStats: { hasCiCd: true, hasTests: true, hasLinters: true, totalFiles: 50 },
  });

  assert.ok(result.overallScore >= 85);
  assert.ok(['A+', 'A'].includes(result.grade));
  assert.strictEqual(result.gradeColor, 'emerald');
});
