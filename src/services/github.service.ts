// Read/write encrypted data to GitHub repo via API

const REPO_OWNER = 'zohar-newton'
const REPO_NAME = 'newton-board'
const DATA_PATH = 'data/board.enc'
const API_BASE = 'https://api.github.com'

interface GitHubFileResponse {
  content: string
  sha: string
}

let cachedToken: string | null = null

export function setGitHubToken(token: string) {
  cachedToken = token
  sessionStorage.setItem('gh_token', token)
}

export function getGitHubToken(): string | null {
  if (cachedToken) return cachedToken
  cachedToken = sessionStorage.getItem('gh_token')
  return cachedToken
}

export function clearGitHubToken() {
  cachedToken = null
  sessionStorage.removeItem('gh_token')
}

async function githubFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = getGitHubToken()
  if (!token) throw new Error('No GitHub token')

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
}

export async function readEncryptedData(): Promise<{ content: string; sha: string } | null> {
  try {
    const res = await githubFetch(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`)
    if (!res.ok) return null

    const data: GitHubFileResponse = await res.json()
    // GitHub returns base64-encoded file content
    const content = atob(data.content.replace(/\n/g, ''))
    return { content, sha: data.sha }
  } catch {
    return null
  }
}

export async function writeEncryptedData(encryptedContent: string, sha?: string): Promise<boolean> {
  try {
    const body: Record<string, string> = {
      message: 'Update board data',
      content: btoa(encryptedContent),
    }
    if (sha) body.sha = sha

    const res = await githubFetch(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })

    return res.ok
  } catch {
    return false
  }
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })
    return res.ok
  } catch {
    return false
  }
}
