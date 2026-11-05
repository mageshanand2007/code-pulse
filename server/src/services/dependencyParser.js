/**
 * Dependency & Outdated Package Analysis Service
 * Inspects package manifests and lockfiles to evaluate dependency hygiene,
 * lockfile presence, version pinning, and potential bloat.
 */

export function parseDependencies(manifestType, manifestContent, treeFiles = []) {
  const result = {
    detected: false,
    ecosystem: 'Unknown',
    manifestFile: manifestType || null,
    totalDependencies: 0,
    directCount: 0,
    devCount: 0,
    dependencies: [],
    devDependencies: [],
    hasLockfile: false,
    lockfileName: null,
    unpinnedCount: 0,
    healthScore: 100,
    warnings: [],
    highlights: [],
  };

  if (!manifestContent) {
    // Check if any manifest file is visible in treeFiles
    const treeManifest = findManifestInTree(treeFiles);
    if (treeManifest) {
      result.manifestFile = treeManifest;
      result.detected = true;
      result.ecosystem = detectEcosystem(treeManifest);
    }
    checkLockfiles(result, treeFiles);
    return result;
  }

  result.detected = true;

  if (manifestType === 'package.json') {
    result.ecosystem = 'Node.js / JavaScript';
    parsePackageJson(result, manifestContent);
  } else if (manifestType === 'requirements.txt') {
    result.ecosystem = 'Python';
    parseRequirementsTxt(result, manifestContent);
  } else if (manifestType === 'Cargo.toml') {
    result.ecosystem = 'Rust';
    parseCargoToml(result, manifestContent);
  } else if (manifestType === 'go.mod') {
    result.ecosystem = 'Go';
    parseGoMod(result, manifestContent);
  }

  // Check lockfile presence
  checkLockfiles(result, treeFiles);

  // Compute dependency health score (0 - 100)
  computeDependencyScore(result);

  return result;
}

function parsePackageJson(result, content) {
  try {
    const pkg = typeof content === 'string' ? JSON.parse(content) : content;
    const deps = pkg.dependencies || {};
    const devDeps = pkg.devDependencies || {};

    result.directCount = Object.keys(deps).length;
    result.devCount = Object.keys(devDeps).length;
    result.totalDependencies = result.directCount + result.devCount;

    result.dependencies = Object.entries(deps).slice(0, 30).map(([name, version]) => {
      const isUnpinned = version === '*' || version === 'latest' || version.startsWith('>');
      if (isUnpinned) result.unpinnedCount++;
      return { name, version, isUnpinned };
    });

    result.devDependencies = Object.entries(devDeps).slice(0, 30).map(([name, version]) => ({
      name,
      version,
    }));

    if (pkg.engines?.node) {
      result.highlights.push(`Engine Node.js target: ${pkg.engines.node}`);
    }

    if (pkg.scripts) {
      result.highlights.push(`${Object.keys(pkg.scripts).length} npm scripts defined`);
    }
  } catch {
    result.warnings.push('Failed to parse package.json content as valid JSON.');
  }
}

function parseRequirementsTxt(result, content) {
  const lines = content.split('\n');
  const deps = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // e.g. flask==2.0.1 or requests>=2.25.0
    const match = trimmed.match(/^([a-zA-Z0-9_\-.]+)(?:([=><~^!]+)(.+))?$/);
    if (match) {
      const name = match[1];
      const op = match[2] || '';
      const version = match[3] || 'unpinned';
      const isUnpinned = !op || op === '>=';
      if (isUnpinned) result.unpinnedCount++;
      deps.push({ name, version: op ? `${op}${version}` : '*', isUnpinned });
    }
  }

  result.directCount = deps.length;
  result.totalDependencies = deps.length;
  result.dependencies = deps.slice(0, 30);
}

function parseCargoToml(result, content) {
  const lines = content.split('\n');
  let inDeps = false;
  let inDevDeps = false;
  const deps = [];
  const devDeps = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[')) {
      inDeps = trimmed === '[dependencies]';
      inDevDeps = trimmed === '[dev-dependencies]';
      continue;
    }

    if ((inDeps || inDevDeps) && trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const ver = parts[1].trim().replace(/["']/g, '');
        if (inDeps) deps.push({ name, version: ver });
        if (inDevDeps) devDeps.push({ name, version: ver });
      }
    }
  }

  result.directCount = deps.length;
  result.devCount = devDeps.length;
  result.totalDependencies = deps.length + devDeps.length;
  result.dependencies = deps.slice(0, 30);
  result.devDependencies = devDeps.slice(0, 30);
}

function parseGoMod(result, content) {
  const lines = content.split('\n');
  const deps = [];
  let inRequire = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('require (')) {
      inRequire = true;
      continue;
    }
    if (inRequire && trimmed === ')') {
      inRequire = false;
      continue;
    }

    if (inRequire && trimmed) {
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        deps.push({ name: parts[0], version: parts[1] });
      }
    } else if (trimmed.startsWith('require ')) {
      const parts = trimmed.replace('require ', '').split(/\s+/);
      if (parts.length >= 2) {
        deps.push({ name: parts[0], version: parts[1] });
      }
    }
  }

  result.directCount = deps.length;
  result.totalDependencies = deps.length;
  result.dependencies = deps.slice(0, 30);
}

function findManifestInTree(treeFiles = []) {
  const manifests = ['package.json', 'requirements.txt', 'Cargo.toml', 'go.mod', 'pom.xml'];
  for (const f of treeFiles) {
    const p = typeof f === 'string' ? f : (f.path || '');
    if (manifests.includes(p)) return p;
  }
  return null;
}

function detectEcosystem(manifestPath) {
  if (manifestPath.endsWith('package.json')) return 'Node.js / JavaScript';
  if (manifestPath.endsWith('requirements.txt')) return 'Python';
  if (manifestPath.endsWith('Cargo.toml')) return 'Rust';
  if (manifestPath.endsWith('go.mod')) return 'Go';
  if (manifestPath.endsWith('pom.xml')) return 'Java (Maven)';
  return 'Unknown';
}

function checkLockfiles(result, treeFiles = []) {
  const lockfiles = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'bun.lockb',
    'poetry.lock',
    'Pipfile.lock',
    'Cargo.lock',
    'go.sum',
  ];

  for (const f of treeFiles) {
    const p = typeof f === 'string' ? f : (f.path || '');
    for (const lock of lockfiles) {
      if (p === lock || p.endsWith(`/${lock}`)) {
        result.hasLockfile = true;
        result.lockfileName = lock;
        result.highlights.push(`Lockfile present: ${lock}`);
        return;
      }
    }
  }

  if (result.detected && result.totalDependencies > 0) {
    result.warnings.push('No lockfile found. Builds may not be deterministic across environments.');
  }
}

function computeDependencyScore(result) {
  let score = 100;

  if (!result.detected) {
    result.healthScore = 75; // neutral if no manifest detected (e.g. C/C++ or docs repo)
    return;
  }

  if (!result.hasLockfile && result.totalDependencies > 0) {
    score -= 25;
  }

  if (result.unpinnedCount > 5) {
    score -= 15;
    result.warnings.push(`${result.unpinnedCount} dependencies have unpinned or loose versions.`);
  } else if (result.unpinnedCount > 0) {
    score -= 5;
  }

  if (result.directCount > 70) {
    score -= 20;
    result.warnings.push(`Heavy dependency footprint: ${result.directCount} direct dependencies.`);
  } else if (result.directCount > 40) {
    score -= 10;
  }

  result.healthScore = Math.max(20, Math.min(100, score));
}

export default parseDependencies;
