import { viteBundler } from '@vuepress/bundler-vite'
import { hopeTheme } from 'vuepress-theme-hope'
import { defineUserConfig } from 'vuepress'
import { markdownChartPlugin } from '@vuepress/plugin-markdown-chart'
import { getDirname, path } from '@vuepress/utils'

const __dirname = getDirname(import.meta.url)

export default defineUserConfig({
  base: '/',
  title: '亍云斋',
  description: '记录思考，分享见解',
  bundler: viteBundler(),

  plugins: [
    markdownChartPlugin({
      mermaid: true,
    })
  ],



  theme: hopeTheme({
    logo: '/images/snail-new.svg',
    
    // 设置默认作者
    author: {
      name: 'loaf',
      url: 'https://loaf.github.io'
    },
    
    // 启用页面信息显示
    pageInfo: ['Author', 'Date', 'Category', 'Tag', 'ReadingTime'],
    
    navbar: [
      {
        text: '首页',
        link: '/'
      },
      {
        text: '随笔',
        link: '/category/随笔/',
      },
      {
        text: '技术',
        link: '/category/技术/'
      },
      {
        text: '其它',
        link: '/category/其它/'
      },
      {
        text: '关于',
        link: '/about.md'
      }
    ],

    // 侧边栏配置
    sidebar: false,
    
    // 禁用Contributors显示
    contributors: false,
    
    // 启用博客功能
    blog: {
      name: 'loaf',
      avatar: '/images/snail-new.svg',
      description: '记录思考，分享见解',
      intro: '/about.html',
      roundAvatar: true,
      medias: {
        GitHub: 'https://github.com/loaf',
        Email: 'mailto:your-email@example.com'
      }
    },
    
    plugins: {
      // 启用博客插件
      blog: true,
      
      // 启用搜索功能
      search: {
        locales: {
          '/': {
            placeholder: '搜索文档',
          },
        },
        hotKeys: ['s', '/'],
        maxSuggestions: 10,
        isSearchable: (page) => page.path !== '/',
      },
      
      // 启用评论功能（可选）
      comment: {
        provider: 'None'
      }
    }
  })
})

