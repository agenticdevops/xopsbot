import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'xops.bot',
  tagline: 'DevOps agents powered by OpenClaw',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.xops.bot',
  baseUrl: '/',
  trailingSlash: false,

  organizationName: 'agenticdevops',
  projectName: 'xopsbot',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl:
            'https://github.com/agenticdevops/xopsbot/tree/main/docs-site/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'xops.bot',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'userGuide',
          position: 'left',
          label: 'User Guide',
        },
        {
          type: 'docSidebar',
          sidebarId: 'devGuide',
          position: 'left',
          label: 'Developer Guide',
        },
        {
          href: 'https://github.com/agenticdevops/xopsbot',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'User Guide',
              to: '/user-guide/installation',
            },
            {
              label: 'Developer Guide',
              to: '/developer-guide/architecture',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/agenticdevops/xopsbot',
            },
          ],
        },
      ],
      copyright: `Copyright \u00a9 ${new Date().getFullYear()} agenticdevops. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
