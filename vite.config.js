import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

async function listOfflineAssets(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) return listOfflineAssets(path.join(directory, entry.name), relativePath)
    if (entry.name === 'index.html' || entry.name === 'service-worker.js' || entry.name === 'precache-manifest.json') return []
    return [relativePath]
  }))
  return files.flat()
}

const offlineManifestPlugin = {
  name: 'write-offline-asset-manifest',
  apply: 'build',
  async closeBundle() {
    const outputDirectory = path.join(projectRoot, 'dist')
    const assets = (await listOfflineAssets(outputDirectory)).sort()
    await writeFile(path.join(outputDirectory, 'precache-manifest.json'), `${JSON.stringify(assets, null, 2)}\n`)
  },
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/explain_ai/' : '/',
  plugins: [react(), offlineManifestPlugin],
}))
