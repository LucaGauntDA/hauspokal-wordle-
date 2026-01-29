
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This maps the process.env.API_KEY used in the code to the VITE_API_KEY environment variable
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  };
});
