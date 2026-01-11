import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
		tailwindcss()
  ],
  define: {
    'import.meta.env.FIREBASE_WEBAPP_CONFIG': JSON.stringify(process.env.FIREBASE_WEBAPP_CONFIG),
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY),
  },
})
