import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // 内网穿透：允许任意隧道域名访问 dev server（隧道域名每次可能不同，
    // 用 true 省得反复改）。只对 dev server 生效，不影响生产构建。
    allowedHosts: true,
  },
  
})
