// Browser-native AES-256-GCM encryption using Web Crypto API

const SALT_LENGTH = 16
const IV_LENGTH = 12

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

function toBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

function fromBase64(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}

export async function encrypt(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey(password, salt)

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    encoder.encode(data)
  )

  return [toBase64(salt.buffer as ArrayBuffer), toBase64(iv.buffer as ArrayBuffer), toBase64(encrypted)].join(':')
}

export async function decrypt(encryptedData: string, password: string): Promise<string | null> {
  try {
    const [saltB64, ivB64, dataB64] = encryptedData.split(':')
    const salt = fromBase64(saltB64)
    const iv = fromBase64(ivB64)
    const data = fromBase64(dataB64)
    const key = await deriveKey(password, salt)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      key,
      data.buffer as ArrayBuffer
    )

    return new TextDecoder().decode(decrypted)
  } catch {
    return null
  }
}

export function isEncrypted(data: string): boolean {
  const parts = data.split(':')
  return parts.length === 3 && parts.every((p) => {
    try { atob(p); return true } catch { return false }
  })
}
