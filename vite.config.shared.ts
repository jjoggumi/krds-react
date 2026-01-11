import { defineConfig } from 'vite';

// 공통 Vite 설정(패키지/앱에서 mergeConfig로 덮어씌워 사용)
export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
});
