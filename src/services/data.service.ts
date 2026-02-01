import type { BoardData } from '@/types'
import { decrypt, isEncrypted } from './crypto.service'
import { readEncryptedData } from './github.service'

export async function loadBoard(password: string): Promise<BoardData | null> {
  const file = await readEncryptedData()
  if (!file) return null

  if (!isEncrypted(file.content)) return null

  const decrypted = await decrypt(file.content, password)
  if (!decrypted) return null

  try {
    return JSON.parse(decrypted) as BoardData
  } catch {
    return null
  }
}
