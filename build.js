// ✅ Load environment variables from .env
require("dotenv").config();
console.log("Loaded SUPABASE_URL:", process.env.SUPABASE_URL);

// Then existing code:
const esbuild = require('esbuild');

// List of required environment variables for the application to function.
const requiredEnv = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'API_KEY'];

// Validate that all required environment variables are set.
// If any are missing, log an error and exit the build process to prevent a faulty build.
for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    console.error(`Error: Missing required environment variable: ${envVar}`);
    console.error('Please ensure you have a .env file or have set the environment variables before building.');
    process.exit(1);
  }
}

// Create the 'define' object for esbuild.
const define = {
  'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
  'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY),
  'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
};

// Execute the esbuild build process.
esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  outfile: 'public/index.js',
  jsx: 'automatic',
  format: 'esm',
  external: ['react', 'react-dom/client', '@google/genai', '@supabase/supabase-js'],
  define,
}).catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});