const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GitHub OAuth redirect
router.get('/auth/github', (req, res) => {
  // Get user ID from the token query parameter
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Verify the token and get user ID
  supabase.auth.getUser(token).then(({ data: { user }, error: authError }) => {
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const userId = user.id;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent('http://localhost:3000/api/auth/github/callback')}&scope=repo,user&state=${userId}`;
    res.redirect(githubAuthUrl);
  }).catch(error => {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Token verification failed' });
  });
});

// GitHub OAuth callback
router.get('/auth/github/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code received' });
    }
    if (!state) {
      return res.status(400).json({ error: 'No state parameter received' });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description });
    }

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const userData = await userResponse.json();

    // Store GitHub token in user_profiles table
    // Use the state parameter which contains the user ID
    const userId = state;
    
    console.log('Attempting to store GitHub token for user:', userId);
    console.log('GitHub username:', userData.login);
    console.log('Token length:', tokenData.access_token?.length);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        github_username: userData.login,
        github_token: tokenData.access_token,
        github_repos: [],
        updated_at: new Date().toISOString()
      });
    
    console.log('Supabase response data:', data);
    console.log('Supabase response error:', error);

    if (error) {
      console.error('Error storing GitHub token:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        error: 'Failed to store GitHub token',
        details: error.message || 'Unknown error'
      });
    }

    // Redirect back to dashboard with success message
    res.redirect('http://localhost:3000?github_connected=true');
    
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ error: 'GitHub OAuth failed' });
  }
});

// Get user's GitHub repositories
router.get('/github/repos', async (req, res) => {
  try {
    // Get user's GitHub token from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('github_token, github_username')
      .eq('user_id', req.user?.id || '550e8400-e29b-41d4-a716-446655440000')
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'GitHub not connected' });
    }

    // Fetch repositories from GitHub API
    const reposResponse = await fetch('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${profile.github_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const repos = await reposResponse.json();

    res.json({ repos });
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Check GitHub connection status
router.get('/github/status', async (req, res) => {
  try {
    // Get user ID from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ connected: false, username: null });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token and get user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.json({ connected: false, username: null });
    }
    
    const userId = user.id;
    
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('github_username, github_token, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);
    
    const profile = profiles && profiles.length > 0 ? profiles[0] : null;

    if (error || !profile) {
      return res.json({ 
        connected: false, 
        username: null 
      });
    }

    res.json({ 
      connected: true, 
      username: profile.github_username 
    });
  } catch (error) {
    console.error('Error checking GitHub status:', error);
    res.status(500).json({ error: 'Failed to check GitHub status' });
  }
});

// Deploy project to GitHub repository
router.post('/github/deploy', async (req, res) => {
  try {
    const { repoUrl, projectFiles } = req.body;
    
    // Get user's GitHub token
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('github_token')
      .eq('user_id', req.user?.id || '550e8400-e29b-41d4-a716-446655440000')
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'GitHub not connected' });
    }

    // Parse repository URL to get owner/repo
    const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!repoMatch) {
      return res.status(400).json({ error: 'Invalid GitHub repository URL' });
    }

    const [, owner, repo] = repoMatch;

    // TODO: Implement GitHub deployment logic
    // This would involve:
    // 1. Creating commits with project files
    // 2. Pushing to the repository
    // 3. Updating the repository

    res.json({ 
      message: 'Deployment to GitHub repository initiated',
      repo: `${owner}/${repo}`,
      status: 'pending'
    });
  } catch (error) {
    console.error('GitHub deployment error:', error);
    res.status(500).json({ error: 'GitHub deployment failed' });
  }
});

module.exports = router;
