/**
 * Security Risk Scanner Service
 * Scans repository file paths, manifests, and commit history for exposed secrets,
 * missing security files, and potential risk indicators.
 */

// Regex patterns for sensitive file names
const SENSITIVE_FILE_PATTERNS = [
  { pattern: /^\.env(?:\..+)?$/i, severity: 'CRITICAL', description: 'Environment variable file (.env) committed' },
  { pattern: /(?:^|\/)(?:id_rsa|id_dsa|id_ecdsa|id_ed25519)(?:\.pub)?$/i, severity: 'CRITICAL', description: 'SSH Private/Public Key file committed' },
  { pattern: /\.(?:pem|key|pkcs12|pfx|p12|crt|cer)$/i, severity: 'HIGH', description: 'Cryptographic certificate/private key file' },
  { pattern: /(?:service[-_]account|credentials|client[-_]secret|secrets?)\.(?:json|ya?ml)$/i, severity: 'HIGH', description: 'Plaintext credentials or secret configuration file' },
  { pattern: /(?:^|\/)\.npmrc$/i, severity: 'MEDIUM', description: '.npmrc file committed (potential NPM auth tokens)' },
  { pattern: /(?:^|\/)\.pypirc$/i, severity: 'MEDIUM', description: '.pypirc file committed (potential PyPI auth tokens)' },
  { pattern: /(?:^|\/)(?:dump|backup)\.sql$/i, severity: 'HIGH', description: 'Database SQL dump file committed' },
];

// Patterns in commit messages that often indicate remediated leaks
const SUSPICIOUS_COMMIT_PATTERNS = [
  /(?:remove|delete|leak|exposed?|hide|fixed?)\s+(?:api[-_ ]?key|secret|token|password|cred)/i,
  /(?:revert|remove)\s+\.env/i,
];

export function scanSecurity(treeFiles = [], recentCommits = [], communityProfile = {}) {
  const issues = [];
  const findings = [];
  let score = 100;

  // 1. Scan tree files for sensitive filenames
  const exposedFiles = [];
  for (const file of treeFiles) {
    const filename = typeof file === 'string' ? file : (file.path || '');
    for (const rule of SENSITIVE_FILE_PATTERNS) {
      if (rule.pattern.test(filename)) {
        exposedFiles.push({
          file: filename,
          severity: rule.severity,
          description: rule.description,
        });
        if (rule.severity === 'CRITICAL') {
          score -= 35;
        } else if (rule.severity === 'HIGH') {
          score -= 20;
        } else {
          score -= 10;
        }
      }
    }
  }

  // 2. Check for .gitignore
  const hasGitignore = treeFiles.some((f) => {
    const p = typeof f === 'string' ? f : (f.path || '');
    return p === '.gitignore' || p.endsWith('/.gitignore');
  });

  if (!hasGitignore) {
    score -= 15;
    issues.push({
      type: 'MISSING_GITIGNORE',
      severity: 'HIGH',
      message: 'No .gitignore file detected. Unversioned secrets or node_modules may accidentally be pushed.',
    });
  } else {
    findings.push({
      type: 'GITIGNORE_PRESENT',
      severity: 'INFO',
      message: '.gitignore file is present.',
    });
  }

  // 3. Check for SECURITY.md
  const hasSecurityPolicy = Boolean(
    (communityProfile?.files?.security) ||
    treeFiles.some((f) => {
      const p = (typeof f === 'string' ? f : (f.path || '')).toLowerCase();
      return p === 'security.md' || p === '.github/security.md' || p === 'docs/security.md';
    })
  );

  if (!hasSecurityPolicy) {
    score -= 10;
    issues.push({
      type: 'MISSING_SECURITY_POLICY',
      severity: 'MEDIUM',
      message: 'No SECURITY.md file found. Researchers have no clear channel to report vulnerabilities.',
    });
  } else {
    findings.push({
      type: 'SECURITY_POLICY_PRESENT',
      severity: 'INFO',
      message: 'SECURITY.md policy is active.',
    });
  }

  // 4. Scan recent commit messages for secret redactions
  const suspiciousCommits = [];
  for (const commit of recentCommits) {
    const message = commit.commit?.message || commit.message || '';
    for (const pattern of SUSPICIOUS_COMMIT_PATTERNS) {
      if (pattern.test(message)) {
        suspiciousCommits.push({
          sha: (commit.sha || '').substring(0, 7),
          message: message.split('\n')[0],
          date: commit.commit?.author?.date || commit.date,
        });
        score -= 10;
        break;
      }
    }
  }

  // 5. Check for Dependabot / automated security scanning
  const hasDependabot = treeFiles.some((f) => {
    const p = (typeof f === 'string' ? f : (f.path || '')).toLowerCase();
    return p === '.github/dependabot.yml' || p === '.github/dependabot.yaml' || p.includes('renovate');
  });

  if (hasDependabot) {
    findings.push({
      type: 'DEPENDABOT_ENABLED',
      severity: 'INFO',
      message: 'Automated dependency vulnerability scanning (Dependabot/Renovate) is configured.',
    });
  } else {
    issues.push({
      type: 'NO_DEPENDABOT',
      severity: 'LOW',
      message: 'No Dependabot or Renovate configuration found in .github/.',
    });
  }

  // Bound score
  score = Math.max(0, Math.min(100, score));

  // Determine Overall Risk Level
  let riskLevel = 'LOW';
  if (exposedFiles.some(f => f.severity === 'CRITICAL') || score < 45) {
    riskLevel = 'CRITICAL';
  } else if (exposedFiles.length > 0 || score < 70) {
    riskLevel = 'HIGH';
  } else if (issues.length > 1 || score < 85) {
    riskLevel = 'MODERATE';
  }

  return {
    score,
    riskLevel,
    exposedFiles,
    suspiciousCommits,
    hasGitignore,
    hasSecurityPolicy,
    hasDependabot,
    issues,
    findings,
    recommendations: generateSecurityRecommendations(exposedFiles, hasGitignore, hasSecurityPolicy, hasDependabot),
  };
}

function generateSecurityRecommendations(exposedFiles, hasGitignore, hasSecurityPolicy, hasDependabot) {
  const recs = [];
  if (exposedFiles.length > 0) {
    recs.push(`Immediately rotate credentials and purge exposed files (${exposedFiles.map(f => f.file).join(', ')}) from Git history using git-filter-repo or BFG Repo-Cleaner.`);
  }
  if (!hasGitignore) {
    recs.push('Create a .gitignore file tailored for your project language/runtime to avoid leaking local configs.');
  }
  if (!hasSecurityPolicy) {
    recs.push('Add a SECURITY.md file explaining responsible disclosure practices and private contact email.');
  }
  if (!hasDependabot) {
    recs.push('Enable GitHub Dependabot by adding .github/dependabot.yml to automatically monitor and fix CVEs in dependencies.');
  }
  return recs;
}

export default scanSecurity;
