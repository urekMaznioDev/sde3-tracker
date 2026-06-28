import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// IMPORTANT for GitHub Pages: set `base` to '/<your-repo-name>/'
// e.g. if your repo is github.com/yourname/sde3-tracker, use '/sde3-tracker/'
// If you're deploying to a custom domain or to <username>.github.io (root),
// leave base as '/'.
export default defineConfig({
  plugins: [react()],
  base: '/sde3-tracker/',
})
