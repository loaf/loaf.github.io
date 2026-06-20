import { viteBundler } from '@vuepress/bundler-vite'
import { hopeTheme } from 'vuepress-theme-hope'
import { defineUserConfig } from 'vuepress'
import { getDirname, path } from '@vuepress/utils'
import fs from 'node:fs'

const __dirname = getDirname(import.meta.url)

export default defineUserConfig({
  lang: 'zh-CN',
  base: '/',
  title: '亍云斋',
  description: '记录思考，分享见解',
  bundler: viteBundler(),
  extendsPage: (page) => {
    if (
      page.path === '/' ||
      page.path === '/essays/20260111-DeepSeek%E4%BC%9A%E8%AE%A9%E4%BD%A0%E8%BF%87%E4%B8%AA%E5%BC%80%E5%BF%83%E5%B9%B4.html'
    ) {
      // #region debug-point A:page-collection
      (() => {
        let debugServerUrl = 'http://127.0.0.1:7777/event'
        let debugSessionId = 'home-missing-essay'

        try {
          const envContent = fs.readFileSync(path(__dirname, '../../.dbg/home-missing-essay.env'), 'utf8')
          debugServerUrl =
            envContent.match(/DEBUG_SERVER_URL=(.+)/)?.[1]?.trim() || debugServerUrl
          debugSessionId =
            envContent.match(/DEBUG_SESSION_ID=(.+)/)?.[1]?.trim() || debugSessionId
        } catch {}

        fetch(debugServerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: debugSessionId,
            runId: 'pre-fix',
            hypothesisId: 'A',
            location: 'docs/.vuepress/config.js:extendsPage',
            msg: '[DEBUG] VuePress page collected',
            data: {
              path: page.path,
              title: page.title,
              frontmatter: page.frontmatter,
              filePathRelative: page.filePathRelative,
            },
            ts: Date.now(),
          }),
        }).catch(() => {})
      })()
      // #endregion
    }
  },

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

