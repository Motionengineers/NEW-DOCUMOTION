import { NextResponse } from 'next/server';
import { getCachedValue, setCachedValue } from '@/lib/cache';

export const dynamic = 'force-dynamic';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const CACHE_NAMESPACE = 'github';

/**
 * GET /api/github/user
 * 
 * Get GitHub user profile and repository information
 * 
 * Query params:
 * - username: GitHub username (required)
 * - includeRepos: Include repositories (default: false)
 * - repoLimit: Number of repos to include (default: 5)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const includeRepos = searchParams.get('includeRepos') === 'true';
    const repoLimit = Math.min(Number.parseInt(searchParams.get('repoLimit') || '5', 10), 20);
    
    if (!username) {
      return NextResponse.json(
        { success: false, error: 'GitHub username is required' },
        { status: 400 }
      );
    }
    
    const cacheKey = `user:${username}:${includeRepos ? `repos:${repoLimit}` : 'no-repos'}`;
    
    // Check cache
    const cached = getCachedValue(CACHE_NAMESPACE, cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
        source: 'cache',
      });
    }

    // Get GitHub user data
    const userData = await getGitHubUser(username, includeRepos, repoLimit);
    
    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Cache the result
    setCachedValue(CACHE_NAMESPACE, cacheKey, userData, CACHE_TTL_MS);
    
    return NextResponse.json({
      success: true,
      data: userData,
      cached: false,
      source: 'github',
    });
  } catch (error) {
    console.error('GET /api/github/user failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to fetch GitHub user data' },
      { status: 500 }
    );
  }
}

/**
 * Fetches GitHub user data using GitHub API
 * Free tier: 60 requests/hour (unauthenticated), 5,000/hour (authenticated)
 */
async function getGitHubUser(username, includeRepos = false, repoLimit = 5) {
  try {
    const token = process.env.GITHUB_TOKEN; // Optional, for higher rate limits
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Documotion/1.0',
    };
    
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    
    // Fetch user profile
    const userUrl = `https://api.github.com/users/${username}`;
    const userResponse = await fetch(userUrl, { headers });
    
    if (userResponse.status === 404) {
      return null;
    }
    
    if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.status}`);
    }
    
    const user = await userResponse.json();
    
    const result = {
      username: user.login,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar_url,
      profileUrl: user.html_url,
      company: user.company,
      location: user.location,
      email: user.email,
      blog: user.blog,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      publicGists: user.public_gists,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
    
    // Fetch repositories if requested
    if (includeRepos) {
      const reposUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=${repoLimit}`;
      const reposResponse = await fetch(reposUrl, { headers });
      
      if (reposResponse.ok) {
        const repos = await reposResponse.json();
        result.repositories = repos.map(repo => ({
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          url: repo.html_url,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          openIssues: repo.open_issues_count,
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
        }));
      }
    }
    
    return result;
  } catch (error) {
    console.error('GitHub API error:', error);
    throw error;
  }
}

