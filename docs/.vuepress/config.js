import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 自动生成侧边栏的函数
function getAutoSidebar(dir) {
  const files = fs.readdirSync(path.join(__dirname, '..', dir))
  return files
    .filter(file => file.endsWith('.md') && file !== 'README.md')
    .map(file => file.replace('.md', ''))
    .sort()
}

export default defineUserConfig({
  title: '亍云旁观',
  description: '个人博客网站',
  bundler: viteBundler(),

  theme: defaultTheme({
    logo: '/images/snail-new.svg',
    navbar: [
      {
        text: '首页',
        link: '/'
      },
      {
        text: '随笔',
        link: '/essays/'
      },
      {
        text: '技术',
        link: '/tech/'
      },
      {
        text: '其它',
        link: '/others/'
      },
      {
        text: '关于',
        link: '/about.md'
      }
    ],

    // 自动生成的侧边栏
    sidebar: {
      '/essays/': getAutoSidebar('essays/'),
      '/tech/': getAutoSidebar('tech/'),
      '/others/': getAutoSidebar('others/')
    },
    sidebarDepth: 2,
    
    // 禁用Contributors显示
    contributors: false
  })
})

