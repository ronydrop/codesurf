import { ipcMain } from 'electron'
import { execFile } from 'node:child_process'
import { promisify } from 'util'
import { existsSync, statSync } from 'fs'
import path from 'node:path'

const execFileAsync = promisify(execFile)

export type GitStatus = 'modified' | 'untracked' | 'added' | 'deleted' | 'renamed' | 'conflict'

export interface GitFileStatus {
  path: string   // relative to repo root
  status: GitStatus
}

export interface GitStatusResult {
  isRepo: boolean
  root: string
  files: GitFileStatus[]
}

function parseStatus(code: string): GitStatus {
  if (code === '??' || code === '!!') return 'untracked'
  if (code.includes('A')) return 'added'
  if (code.includes('D')) return 'deleted'
  if (code.includes('R')) return 'renamed'
  if (code.includes('U') || code === 'AA' || code === 'DD') return 'conflict'
  return 'modified'
}

export interface GitRemoteResult {
  isRepo: boolean
  remoteUrl: string | null
  /** Parsed "owner/repo" from a GitHub remote, or null if not GitHub. */
  githubRepo: string | null
}

/** Extract "owner/repo" from GitHub remote URLs (HTTPS or SSH). */
function parseGithubRepo(url: string): string | null {
  // HTTPS: https://github.com/owner/repo.git
  const https = url.match(/github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?$/)
  if (https) return https[1]
  // SSH: git@github.com:owner/repo.git
  const ssh = url.match(/github\.com:([^/]+\/[^/]+?)(?:\.git)?$/)
  if (ssh) return ssh[1]
  return null
}

export function registerGitIPC(): void {
  ipcMain.handle('git:remote', async (_, dirPath: string): Promise<GitRemoteResult> => {
    try {
      const resolvedDir = path.resolve(dirPath)
      if (!existsSync(resolvedDir) || !statSync(resolvedDir).isDirectory()) {
        return { isRepo: false, remoteUrl: null, githubRepo: null }
      }
      const { stdout } = await execFileAsync('git', ['remote', 'get-url', 'origin'], { cwd: resolvedDir })
      const remoteUrl = stdout.trim()
      return { isRepo: true, remoteUrl, githubRepo: parseGithubRepo(remoteUrl) }
    } catch {
      return { isRepo: false, remoteUrl: null, githubRepo: null }
    }
  })

  ipcMain.handle('git:status', async (_, dirPath: string): Promise<GitStatusResult> => {
    try {
      // SEC-05: Validate that dirPath exists and is a directory
      const resolvedDir = path.resolve(dirPath)
      if (!existsSync(resolvedDir) || !statSync(resolvedDir).isDirectory()) {
        return { isRepo: false, root: dirPath, files: [] }
      }

      // Find repo root — use execFile to avoid shell interpretation
      const { stdout: rootRaw } = await execFileAsync('git', ['rev-parse', '--show-toplevel'], { cwd: resolvedDir })
      const root = rootRaw.trim()

      // Get porcelain status
      const { stdout } = await execFileAsync('git', ['status', '--porcelain', '-u'], { cwd: root })
      const files: GitFileStatus[] = []

      for (const line of stdout.split('\n')) {
        if (!line.trim()) continue
        const xy = line.slice(0, 2)
        const rest = line.slice(3).trim()
        // Handle renames: "old -> new"
        const filePath = rest.includes(' -> ') ? rest.split(' -> ')[1] : rest
        files.push({ path: filePath, status: parseStatus(xy.trim()) })
      }

      return { isRepo: true, root, files }
    } catch {
      return { isRepo: false, root: dirPath, files: [] }
    }
  })
}
