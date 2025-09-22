// Lightweight GitHub URL validation for the upload modal
(() => {
  function isValid(url) {
    try {
      if (typeof url !== 'string') return false;
      url = url.trim();
      if (url.startsWith('git@github.com:')) return /git@github\.com:[\w.-]+\/[\w.-]+(\.git)?\/?$/.test(url);
      const u = new URL(url);
      if (!['github.com', 'www.github.com'].includes(u.hostname)) return false;
      const parts = u.pathname.replace(/^\//, '').replace(/\.git$/i, '').split('/').filter(Boolean);
      return parts.length >= 2 && /^[\w.-]+$/.test(parts[0]) && /^[\w.-]+$/.test(parts[1]);
    } catch { return false; }
  }

  window.__validateGitHubUrl = isValid;
})();


