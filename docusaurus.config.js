// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'GateCtr',
  tagline: 'One gateway. Every LLM.',
  favicon: 'img/favicon.ico',

  url: 'https://docs.gatectr.com',
  baseUrl: '/',

  trailingSlash: false,
  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    localeConfigs: {
      en: {
        label: 'English',
        htmlLang: 'en',
      },
      fr: {
        label: 'Français',
        htmlLang: 'fr',
      },
    },
  },

  headTags: [
    {
      tagName: 'link',
      attributes: { rel: 'icon', type: 'image/x-icon', href: '/img/favicon.ico' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'shortcut icon', href: '/img/favicon.ico' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
      },
    },
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Organization',
        name: 'GateCtr',
        url: 'https://gatectr.com',
        description:
          'GateCtr is an LLM gateway that sits between your app and any LLM provider — with cost control, smart routing, and real-time analytics.',
      }),
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/GateCtr/docs/edit/main/',
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      }),
    ],
  ],

  plugins: [
    function allowedHostsPlugin() {
      return {
        name: 'allowed-hosts-plugin',
        configureWebpack() {
          return {
            devServer: {
              allowedHosts: 'all',
            },
          };
        },
      };
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/og-image.png',

      metadata: [
        {
          name: 'keywords',
          content:
            'LLM gateway, AI API, OpenAI proxy, token optimization, cost control, model router, prompt compression',
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@gatectrl' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'GateCtr Docs' },
      ],

      navbar: {
        title: 'GateCtr',
        logo: {
          alt: 'GateCtr Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            to: '/docs/api-reference/complete',
            label: 'API Reference',
            position: 'left',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/GateCtr',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },

      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              { label: 'Quickstart', to: '/docs/getting-started/quickstart' },
              { label: 'API Reference', to: '/docs/api-reference/complete' },
              { label: 'Node.js SDK', to: '/docs/sdks/node' },
              { label: 'Python SDK', to: '/docs/sdks/python' },
            ],
          },
          {
            title: 'Product',
            items: [
              { label: 'Dashboard', href: 'https://app.gatectr.com' },
              { label: 'Pricing', href: 'https://gatectr.com/pricing' },
              { label: 'Status', href: 'https://status.gatectr.com' },
            ],
          },
          {
            title: 'Community',
            items: [
              { label: 'GitHub', href: 'https://github.com/GateCtr' },
              { label: 'Twitter', href: 'https://twitter.com/gatectrl' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} GateCtr.`,
      },

      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
        additionalLanguages: ['bash', 'json', 'python', 'typescript'],
      },

      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
    }),
};

module.exports = config;
