// Read encrypted data from GitHub repo (public, no token needed)

const REPO_OWNER = 'zohar-newton'
const REPO_NAME = 'newton-board-v2'
const DATA_PATH = 'data/board.enc'
const API_BASE = 'https://api.github.com'

export async function readEncryptedData(): Promise<{ content: string; sha: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`)
    if (!res.ok) return null

    const data = await res.json()
    const content = atob(data.content.replace(/\n/g, ''))
    return { content, sha: data.sha }
  } catch {
    return null
  }
}
