/**
 * Utility functions to validate and parse GitHub repository URLs.
 * Supports https/ssh/git formats with optional .git and trailing slashes.
 */

const GITHUB_HOSTS = ['github.com', 'www.github.com'];

function normalizeUrl(input) {
  if (!input || typeof input !== 'string') return '';
  return input.trim();
}

function isValidGitHubUrl(input) {
  const url = normalizeUrl(input);
  if (url.startsWith('git@github.com:')) return /git@github\.com:[\w.-]+\/[\w.-]+(\.git)?\/?$/.test(url);
  try {
    const u = new URL(url);
    if (!GITHUB_HOSTS.includes(u.hostname)) return false;
    const parts = u.pathname.replace(/^\//, '').replace(/\.git$/i, '').split('/').filter(Boolean);
    return parts.length >= 2 && /^[\w.-]+$/.test(parts[0]) && /^[\w.-]+$/.test(parts[1]);
  } catch {
    return false;
  }
}

function parseGitHubRepo(input) {
  const url = normalizeUrl(input);
  if (!isValidGitHubUrl(url)) return null;

  if (url.startsWith('git@github.com:')) {
    const path = url.replace(/^git@github\.com:/, '').replace(/\.git$/i, '').replace(/\/+$/, '');
    const [owner, repo] = path.split('/');
    return { owner, repo };
  }

  const u = new URL(url);
  const parts = u.pathname.replace(/^\//, '').replace(/\.git$/i, '').split('/').filter(Boolean);
  return { owner: parts[0], repo: parts[1] };
}

module.exports = { isValidGitHubUrl, parseGitHubRepo };


