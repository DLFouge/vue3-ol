import { defineConfig,loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  const { VITE_APP_ENV } = env
  return {
    base: VITE_APP_ENV === 'production' ? '/' : '/',
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        // 设置别名
        // '@': resolve(__dirname, './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    plugins: [vue()],
    server: {
      port: 18110,  //服务端口号
      open: true,   //服务启动时是否自动打开浏览器
      cors: true,   //允许跨域
      proxy: {
        '/api': {
          target:'http://www.xxxx.com.cn',
          changeOrigin:true,
          // rewrite:(path) =>path.replace('/api','')
        }
      }
    }
  }
  
})
