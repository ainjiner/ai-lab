import { defineConfig } from 'vite';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { qwikVite } from '@builder.io/qwik/optimizer';

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity(),
      qwikVite(),
    ],
    server: {
      port: 3000,
    },
    build: {
      target: 'es2022',
    },
  };
});
