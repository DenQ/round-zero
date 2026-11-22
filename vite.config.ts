import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

function pagesBase(): string {
  const configured = process.env.PAGES_BASE
  if (!configured || configured === '/') {
    return '/'
  }

  return configured.endsWith('/') ? configured : `${configured}/`
}

export default defineConfig({
  base: pagesBase(),
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      '@app': path.resolve(rootDir, 'src/app'),
      '@pages': path.resolve(rootDir, 'src/pages'),
      '@widgets': path.resolve(rootDir, 'src/widgets'),
      '@features': path.resolve(rootDir, 'src/features'),
      '@entities': path.resolve(rootDir, 'src/entities'),
      '@shared': path.resolve(rootDir, 'src/shared'),
    },
  },
})
