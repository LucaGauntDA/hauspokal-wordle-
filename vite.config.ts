
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix for TypeScript error: explicitly import process and use it to load env variables
  // The empty string as third argument allows loading variables without the VITE_ prefix
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Maps the process.env.API_KEY used in the source code to the actual key from the environment
      // This follows the rule of obtaining the key exclusively from process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY)
    }
  };
});
