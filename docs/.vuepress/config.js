import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { markdownChartPlugin } from '@vuepress/plugin-markdown-chart'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 读取文章元数据的函数
function getArticleMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const { data, content: articleContent } = matter(content)
    const firstParagraph = articleContent.split('\n').find(line => line.trim() && !line.startsWith('#'))
    return {
      title: data.title || '未命名文章',
      date: data.date || '',
      description: data.description || firstParagraph || '',
      category: data.category || '',
      tags: data.tags || []
    }
  } catch (error) {
    console.warn(`无法读取文件元数据: ${filePath}`, error)
    return null
  }
}

// 获取目录下所有文章的元数据
function getArticlesMetadata(dir) {
  const docsDir = path.join(__dirname, '..')
  const dirPath = path.join(docsDir, dir)
  if (!fs.existsSync(dirPath)) return []
  
  const files = fs.readdirSync(dirPath)
  const articles = []
  
  files
    .filter(file => file.endsWith('.md') && file !== 'README.md')
    .forEach(file => {
      const filePath = path.join(dirPath, file)
      const metadata = getArticleMetadata(filePath)
      if (metadata) {
        articles.push({
          ...metadata,
          filename: file.replace('.md', ''),
          link: `/${dir}/${file.replace('.md', '.html')}`
        })
      }
    })
  
  // 按日期排序（最新在前）
  return articles.sort((a, b) => new Date(b.date) - new Date(a.date))
}

// 自动生成侧边栏的函数
function getAutoSidebar(dir) {
  const articles = getArticlesMetadata(dir)
  return articles.map(article => article.filename)
}

// 生成首页内容
function generateHomePage() {
  const essaysArticles = getArticlesMetadata('essays').slice(0, 5)
  const techArticles = getArticlesMetadata('tech').slice(0, 3)
  const othersArticles = getArticlesMetadata('others').slice(0, 3)
  
  let content = `---
home: false
---

# 📚 最新文章

`
  
  if (essaysArticles.length > 0) {
    content += `### 📝 随笔类文章\n`
    essaysArticles.forEach(article => {
      const dateStr = article.date ? new Date(article.date).toISOString().split('T')[0] : ''
      content += `- **[${article.title}](${article.link})** - *${dateStr}*  \n`
      if (article.description) {
        content += `  ${article.description.substring(0, 100)}...\n\n`
      }
    })
  }
  
  if (techArticles.length > 0) {
    content += `### 💻 技术类文章\n`
    techArticles.forEach(article => {
      const dateStr = article.date ? new Date(article.date).toISOString().split('T')[0] : ''
      content += `- **[${article.title}](${article.link})** - *${dateStr}*  \n`
      if (article.description) {
        content += `  ${article.description.substring(0, 100)}...\n\n`
      }
    })
  }
  
  if (othersArticles.length > 0) {
    content += `### 🎭 其它类文章\n`
    othersArticles.forEach(article => {
      const dateStr = article.date ? new Date(article.date).toISOString().split('T')[0] : ''
      content += `- **[${article.title}](${article.link})** - *${dateStr}*  \n`
      if (article.description) {
        content += `  ${article.description.substring(0, 100)}...\n\n`
      }
    })
  }
  
  return content
}

// 生成分类页面内容
function generateCategoryPage(category, categoryName, categoryIcon) {
  const articles = getArticlesMetadata(category)
  
  let content = `---\ntitle: ${categoryName}\nsidebar: auto\n---\n\n# ${categoryName}\n\n`
  
  if (category === 'essays') {
    content += `记录生活中的点点滴滴，分享人生感悟和思考。\n\n`
  } else if (category === 'tech') {
    content += `技术学习笔记和实践经验分享。\n\n`
  } else if (category === 'others') {
    content += `读书笔记、观影感想等其他内容。\n\n`
  }
  
  content += `## 文章列表\n\n`
  
  // 按年月分组
  const groupedArticles = {}
  articles.forEach(article => {
    if (article.date) {
      const date = new Date(article.date)
      const yearMonth = `${date.getFullYear()}年${date.getMonth() + 1}月`
      if (!groupedArticles[yearMonth]) {
        groupedArticles[yearMonth] = []
      }
      groupedArticles[yearMonth].push(article)
    }
  })
  
  // 生成分组内容
  Object.keys(groupedArticles)
    .sort((a, b) => b.localeCompare(a))
    .forEach(yearMonth => {
      content += `### ${yearMonth}\n\n`
      groupedArticles[yearMonth].forEach(article => {
        const dateStr = article.date ? new Date(article.date).toISOString().split('T')[0] : ''
        content += `- [${article.title}](./${article.filename}.md) - ${dateStr}\n`
      })
      content += `\n`
    })
  
  return content
}

// 自动更新README文件
function updateReadmeFiles() {
  try {
    // 更新首页
    const homeContent = generateHomePage()
    const docsDir = path.join(__dirname, '..')
    fs.writeFileSync(path.join(docsDir, 'README.md'), homeContent, 'utf-8')
    
    // 更新各分类页面
    const categories = [
      { dir: 'essays', name: '随笔', icon: '📝' },
      { dir: 'tech', name: '技术', icon: '💻' },
      { dir: 'others', name: '其它', icon: '🎭' }
    ]
    
    categories.forEach(({ dir, name, icon }) => {
      const categoryContent = generateCategoryPage(dir, name, icon)
      const categoryPath = path.join(docsDir, dir, 'README.md')
      fs.writeFileSync(categoryPath, categoryContent, 'utf-8')
    })
    
    console.log('README文件已自动更新')
  } catch (error) {
    console.error('更新README文件时出错:', error)
  }
}

// 在构建时自动更新README文件
updateReadmeFiles()

export default defineUserConfig({
  base: '/',
  title: '亍云旁观',
  description: '个人博客网站',
  bundler: viteBundler(),

  plugins: [
    markdownChartPlugin({
      mermaid: true,
    })
  ],

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

