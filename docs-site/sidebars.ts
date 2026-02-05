import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  userGuide: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'user-guide/installation',
        'user-guide/setup-wizard',
      ],
    },
    {
      type: 'category',
      label: 'Agents',
      items: [
        'user-guide/agents/k8s-bot',
        'user-guide/agents/rca-bot',
        'user-guide/agents/incident-bot',
        'user-guide/agents/finops-bot',
        'user-guide/agents/platform-bot',
      ],
    },
    'user-guide/profiles',
  ],
  devGuide: [
    'developer-guide/architecture',
    'developer-guide/wizard-architecture',
    'developer-guide/adding-agents',
    'developer-guide/contributing',
  ],
};

export default sidebars;
