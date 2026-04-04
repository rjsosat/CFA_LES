import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/CFA_LES/', // Set this to your repository name for GitHub Pages
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CFA LES Dashboard',
        short_name: 'CFA Tracker',
        description: 'CFA Level II Study Tracker',
        theme_color: '#ffffff',
        background_color: '#f0f4f8',
        display: 'standalone',
        icons: [] // We will add your generated icons here later
      }
    })
  ]
})
