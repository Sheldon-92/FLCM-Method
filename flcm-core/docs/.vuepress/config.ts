import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'

export default defineUserConfig({
  title: 'FLCM 2.0 Documentation',
  description: 'AI-Powered Learning Content Management System',
  base: '/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }]
  ],
  
  theme: defaultTheme({
    repo: 'Sheldon-92/FLCM-Method',
    docsDir: 'docs',
    docsBranch: 'main',
    editLinkPattern: ':repo/edit/:branch/:path',
    
    navbar: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'Contributing', link: '/contributing/' },
      {
        text: 'Links',
        children: [
          { text: 'GitHub', link: 'https://github.com/Sheldon-92/FLCM-Method' },
          { text: 'Issues', link: 'https://github.com/Sheldon-92/FLCM-Method/issues' },
          { text: 'Changelog', link: '/changelog/' }
        ]
      }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          children: [
            '/guide/',
            '/guide/installation',
            '/guide/quick-start',
            '/guide/configuration'
          ]
        },
        {
          text: 'Core Concepts',
          children: [
            '/guide/agents',
            '/guide/methodologies',
            '/guide/pipeline',
            '/guide/templates'
          ]
        },
        {
          text: 'Advanced Usage',
          children: [
            '/guide/customization',
            '/guide/deployment',
            '/guide/monitoring',
            '/guide/troubleshooting'
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          children: [
            '/api/',
            '/api/agents',
            '/api/pipeline',
            '/api/methodologies',
            '/api/shared'
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          children: [
            '/examples/',
            '/examples/basic-usage',
            '/examples/custom-agents',
            '/examples/advanced-workflows'
          ]
        }
      ]
    },
    
    sidebarDepth: 2,
    lastUpdated: true,
    contributors: true,
    
    themePlugins: {
      git: true,
      nprogress: true
    }
  }),
  
  plugins: [
    ['@vuepress/plugin-search', {
      searchMaxSuggestions: 10
    }]
  ]
})