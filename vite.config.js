import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // peerDepsExternal(),
    react(),
    viteSingleFile()
  ],
  esbuild: {
    minifyIdentifiers: false,
    minifyWhitespace: false,
  },
  minify: 'esbuild',
  build: {
    rollupOptions: {
      external: [
        'react', 
        'react-dom', 
      ],
      output: {
        paths: {
          react: "https://esm.sh/react@19.2.1",
          'react-dom': 'https://esm.sh/react-dom@19.2.1'
        }
      }
    },
  },
})
