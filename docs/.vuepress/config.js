import { viteBundler } from '@vuepress/bundler-vite'
import { hopeTheme } from 'vuepress-theme-hope'
import { defineUserConfig } from 'vuepress'
import { getDirname, path } from '@vuepress/utils'

const __dirname = getDirname(import.meta.url)

export default defineUserConfig({
  lang: 'zh-CN',
  base: '/',
  title: '亍云斋',
  description: '记录思考，分享见解',
  bundler: viteBundler(),

  theme: hopeTheme({
    logo: '/images/snail-new.svg',
    
    // 设置默认作者
    author: {
      name: 'loaf',
      url: 'https://loaf.github.io'
    },
    
    // 启用页面信息显示
    pageInfo: ['Author', 'Date', 'Category', 'Tag', 'ReadingTime'],
    
    // 启用markdown
    markdown: {
      mermaid: true,
      footnote: true,
      sub: true,
      sup: true,
      math: {
        type: 'katex',
      },
      align: true,
      markmap: true, 
    },
    navbar: [
      {
        text: '首页',
        link: '/'
      },
      {
        text: '随笔',
        link: '/essays/',
      },
      {
        text: '技术',
        link: '/tech/'
      },
      {
        text: '笔记',
        link: '/notes/'
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
        provider: 'Giscus',
        repo: 'loaf/loaf.github.io',
        repoId: 'R_kgDONhqGdw',
        category: 'Announcements',
        categoryId: 'DIC_kwDONhqGd84ClGNh',
        mapping: 'pathname',
        strict: false,
        lazyLoading: true,
        reactionsEnabled: true,
        inputPosition: 'top'
      }
    }
  })
})

