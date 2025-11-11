import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Using dynamic imports for PostCSS plugins
const tailwindcss = (await import('tailwindcss')).default;
const autoprefixer = (await import('autoprefixer')).default;

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    root: 'src/client',
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: {
        overlay: false
      }
    },
    plugins: [
      react({
        jsxRuntime: 'classic'
      })
    ],
    publicDir: path.resolve(__dirname, 'public'),
    css: {
      postcss: {
        plugins: [
          tailwindcss,
          autoprefixer,
        ],
      },
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/client'),
        'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
        'react-dom/client': path.resolve(__dirname, 'node_modules/react-dom/client.js'),
        'react': path.resolve(__dirname, 'node_modules/react/index.js'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom/index.js')
      }
    },
    optimizeDeps: {
      include: ['@google/generative-ai']
    },
    build: {
      outDir: path.resolve(__dirname, 'dist/client'),
      emptyOutDir: true,
      commonjsOptions: {
        include: [/node_modules/]
      }
    },
    esbuild: {
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.test.tsx',
        '**/*.spec.tsx',
      ],
    },
  };
});
