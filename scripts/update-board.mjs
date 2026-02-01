#!/usr/bin/env node
// Script for Newton to update board data via GitHub API
// Usage: node scripts/update-board.mjs <password> <action> [args...]

const REPO_OWNER = 'zohar-newton'
const REPO_NAME = 'newton-board-v2'
const DATA_PATH = 'data/board.enc'
const API_BASE = 'https://api.github.com'
const TOKEN = process.env.GITHUB_TOKEN || ''

// --- Crypto (Node.js) ---
import crypto from 'crypto'

function encrypt(data, password) {
  const salt = crypto.randomBytes(16)
  const iv = crypto.randomBytes(12)
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256')
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Combine encrypted + tag (Web Crypto API does this automatically)
  const combined = Buffer.concat([encrypted, tag])
  return [salt.toString('base64'), iv.toString('base64'), combined.toString('base64')].join(':')
}

function decrypt(encryptedData, password) {
  try {
    const [saltB64, ivB64, dataB64] = encryptedData.split(':')
    const salt = Buffer.from(saltB64, 'base64')
    const iv = Buffer.from(ivB64, 'base64')
    const combined = Buffer.from(dataB64, 'base64')
    // AES-GCM tag is last 16 bytes
    const tag = combined.subarray(combined.length - 16)
    const encrypted = combined.subarray(0, combined.length - 16)
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256')
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}

// --- GitHub API ---
async function githubFetch(path, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `token ${TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

async function readData(password) {
  const res = await githubFetch(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`)
  if (!res.ok) return { data: null, sha: null }
  const file = await res.json()
  const content = atob(file.content.replace(/\n/g, ''))
  const decrypted = decrypt(content, password)
  if (!decrypted) { console.error('Wrong password'); process.exit(1) }
  return { data: JSON.parse(decrypted), sha: file.sha }
}

async function writeData(data, password, sha) {
  const encrypted = encrypt(JSON.stringify(data), password)
  const res = await githubFetch(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: 'Update board data',
      content: Buffer.from(encrypted).toString('base64'),
      sha,
    }),
  })
  return res.ok
}

// --- Commands ---
const [,, password, action, ...args] = process.argv

if (!password || !action) {
  console.log('Usage: node update-board.mjs <password> <action> [args...]')
  console.log('Actions: init, show, add-project, add-task, move-task, delete-task')
  process.exit(1)
}

if (action === 'init') {
  // Initialize with empty board
  const data = { projects: [], tasks: [] }
  const encrypted = encrypt(JSON.stringify(data), password)
  const content = Buffer.from(encrypted).toString('base64')

  // Check if file exists
  const check = await githubFetch(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`)
  const body = { message: 'Initialize encrypted board data', content }
  if (check.ok) {
    const existing = await check.json()
    body.sha = existing.sha
  }

  const res = await githubFetch(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  console.log(res.ok ? '✅ Board initialized' : '❌ Failed')

} else if (action === 'show') {
  const { data } = await readData(password)
  console.log(JSON.stringify(data, null, 2))

} else if (action === 'add-project') {
  const [name, description] = args
  const { data, sha } = await readData(password)
  data.projects.push({
    id: crypto.randomUUID(),
    name,
    description: description || '',
    createdAt: new Date().toISOString(),
  })
  const ok = await writeData(data, password, sha)
  console.log(ok ? `✅ Project "${name}" added` : '❌ Failed')

} else if (action === 'add-task') {
  const [projectId, title, description, status, priority] = args
  const { data, sha } = await readData(password)
  data.tasks.push({
    id: crypto.randomUUID(),
    projectId,
    title,
    description: description || '',
    status: status || 'backlog',
    priority: priority || 'medium',
    order: data.tasks.filter(t => t.status === (status || 'backlog')).length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  const ok = await writeData(data, password, sha)
  console.log(ok ? `✅ Task "${title}" added` : '❌ Failed')

} else if (action === 'move-task') {
  const [taskId, status] = args
  const { data, sha } = await readData(password)
  const task = data.tasks.find(t => t.id === taskId)
  if (!task) { console.error('Task not found'); process.exit(1) }
  task.status = status
  task.updatedAt = new Date().toISOString()
  const ok = await writeData(data, password, sha)
  console.log(ok ? `✅ Task moved to ${status}` : '❌ Failed')

} else if (action === 'delete-task') {
  const [taskId] = args
  const { data, sha } = await readData(password)
  data.tasks = data.tasks.filter(t => t.id !== taskId)
  const ok = await writeData(data, password, sha)
  console.log(ok ? '✅ Task deleted' : '❌ Failed')

} else {
  console.log('Unknown action:', action)
}
