import { fileURLToPath, URL } from 'node:url'
import postcssNesting from 'postcss-nesting';
import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css:{
    preprocessorOptions:{
      scss: {
        additionalData: `@import "@/assets/global.scss";`
      }
    },
    postcss: {
      plugins: [
          postcssNesting,
          tailwindcss
      ],
  },
  },
  esbuild:{
    jsxInject: `import React from 'react'`,
  },
  devServer: {
    port: 3000, // 指定开发服务器端口号
    open: true, // 自动打开浏览器
    proxy: {
      // 配置代理
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
