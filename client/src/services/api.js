/**
 * CodePulse Frontend API Client
 */

const API_BASE = '/api';

function getStoredHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  const githubToken = localStorage.getItem('codepulse_github_token');
  const groqKey = localStorage.getItem('codepulse_groq_key');

  if (githubToken && githubToken.trim()) {
    headers['x-github-token'] = githubToken.trim();
  }
  if (groqKey && groqKey.trim()) {
    headers['x-groq-key'] = groqKey.trim();
  }
  return headers;
}

export async function analyzeRepository(repoInput, forceFresh = false) {
  const headers = getStoredHeaders();
  const url = `${API_BASE}/analyze?repo=${encodeURIComponent(repoInput)}${forceFresh ? '&fresh=true' : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to analyze repository');
  }

  return data;
}

export async function compareRepositories(repo1, repo2) {
  const headers = getStoredHeaders();
  const response = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ repo1, repo2 }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to compare repositories');
  }

  return data;
}

export async function fetchPresets() {
  const response = await fetch(`${API_BASE}/presets`);
  const data = await response.json();
  return data.presets || [];
}

export async function fetchRateLimit() {
  const headers = getStoredHeaders();
  const response = await fetch(`${API_BASE}/rate-limit`, { headers });
  const data = await response.json();
  return data.rateLimit || null;
}
