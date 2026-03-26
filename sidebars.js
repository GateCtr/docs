/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/quickstart',
        'getting-started/authentication',
        'getting-started/first-request',
      ],
    },
    {
      type: 'category',
      label: 'SDKs',
      items: ['sdks/node', 'sdks/python'],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/budget-firewall',
        'features/context-optimizer',
        'features/model-router',
        'features/analytics',
        'features/webhooks',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api-reference/complete',
        'api-reference/chat',
        'api-reference/usage',
      ],
    },
  ],
};

module.exports = sidebars;
