import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    peerDepsExternal(),
    react(),
    viteSingleFile(),
  ],
  esbuild: {
    minifyIdentifiers: false,
    minifyWhitespace: false,
  },
  minify: 'esbuild',
  build: {
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'], // Mark React and ReactDOM as external
      output: {
        paths: {
          react: 'https://unpkg.com/react@^18/umd/react.development.js',
          'react-dom': 'https://unpkg.com/react-dom@^18/umd/react-dom.development.js'
        }
      }
    },
  },
})
