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
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': 'https://gatectr.com/#organization',
            name: 'GateCtr',
            url: 'https://gatectr.com',
            logo: 'https://docs.gatectr.com/img/logo.svg',
            description:
              'GateCtr is an LLM gateway that sits between your app and any LLM provider — with cost control, smart routing, prompt compression, and real-time analytics.',
            sameAs: [
              'https://github.com/GateCtr',
              'https://twitter.com/gatectrl',
            ],
          },
          {
            '@type': 'WebSite',
            '@id': 'https://docs.gatectr.com/#website',
            url: 'https://docs.gatectr.com',
            name: 'GateCtr Docs',
            description: 'Official documentation for the GateCtr LLM gateway — SDKs, API reference, and guides.',
            publisher: { '@id': 'https://gatectr.com/#organization' },
            inLanguage: ['en', 'fr'],
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://docs.gatectr.com/search?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@type': 'SoftwareApplication',
            '@id': 'https://gatectr.com/#software',
            name: 'GateCtr',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            url: 'https://gatectr.com',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            description:
              'LLM gateway with token optimization, budget firewall, model routing, and real-time analytics.',
            publisher: { '@id': 'https://gatectr.com/#organization' },
          },
        ],
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
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          createSitemapItems: async (params) => {
            const { defaultCreateSitemapItems, ...rest } = params;
            const items = await defaultCreateSitemapItems(rest);
            return items.map((item) => {
              const u = item.url;
              if (u.endsWith('docs.gatectr.com') || u.endsWith('docs.gatectr.com/')) {
                return { ...item, priority: 1.0, changefreq: 'daily' };
              }
              if (u.includes('/getting-started/quickstart') || u.includes('/intro')) {
                return { ...item, priority: 0.9, changefreq: 'weekly' };
              }
              if (u.includes('/api-reference/') || u.includes('/sdks/')) {
                return { ...item, priority: 0.8, changefreq: 'weekly' };
              }
              if (u.includes('/features/') || u.includes('/getting-started/')) {
                return { ...item, priority: 0.7, changefreq: 'weekly' };
              }
              return { ...item, priority: 0.5, changefreq: 'monthly' };
            });
          },
        },
      }),
    ],
  ],

  clientModules: [require.resolve('./src/clientModules/languageDetect.js')],

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
            'GateCtr, LLM gateway, AI API gateway, OpenAI proxy, token optimization, cost control, model router, prompt compression, LLM cost reduction',
        },
        { name: 'author', content: 'GateCtr' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@gatectrl' },
        { name: 'twitter:creator', content: '@gatectrl' },
        { name: 'twitter:title', content: 'GateCtr Docs — One gateway. Every LLM.' },
        { name: 'twitter:description', content: 'Official docs for GateCtr: one endpoint swap, -40% token costs, budget firewall, model routing, and real-time analytics.' },
        { name: 'twitter:image', content: 'https://docs.gatectr.com/img/og-image.png' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'GateCtr Docs' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:locale:alternate', content: 'fr_FR' },
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
