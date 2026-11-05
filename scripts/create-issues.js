/**
 * Create GitHub Issues Helper Script
 * Automates creating curated beginner-friendly "good first issue" entries
 * directly on your new GitHub repository.
 *
 * Usage:
 *   GITHUB_TOKEN=your_token node scripts/create-issues.js your-username/CodePulse
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Octokit } from '@octokit/rest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const repoArg = process.argv[2] || process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error('❌ Error: GITHUB_TOKEN environment variable is required.');
    console.error('Usage: GITHUB_TOKEN=ghp_xxx node scripts/create-issues.js <owner/repo>');
    process.exit(1);
  }

  if (!repoArg || !repoArg.includes('/')) {
    console.error('❌ Error: Target repository must be provided as "owner/repo"');
    console.error('Usage: GITHUB_TOKEN=ghp_xxx node scripts/create-issues.js <owner/repo>');
    process.exit(1);
  }

  const [owner, repo] = repoArg.split('/');
  const issuesFile = path.resolve(__dirname, '../.github/project_issues.json');

  if (!fs.existsSync(issuesFile)) {
    console.error(`❌ Issues definition file not found at: ${issuesFile}`);
    process.exit(1);
  }

  const issues = JSON.parse(fs.readFileSync(issuesFile, 'utf8'));
  const octokit = new Octokit({ auth: token });

  console.log(`🚀 Creating ${issues.length} beginner-friendly issues on ${owner}/${repo}...`);

  for (const issue of issues) {
    try {
      const res = await octokit.rest.issues.create({
        owner,
        repo,
        title: issue.title,
        body: issue.body,
        labels: issue.labels,
      });
      console.log(`✅ Created issue #${res.data.number}: ${issue.title}`);
    } catch (err) {
      console.error(`⚠️ Failed to create issue "${issue.title}":`, err.message);
    }
  }

  console.log('🎉 Done creating GitHub issues!');
}

main();
