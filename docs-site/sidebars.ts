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
    'user-guide/safety-configuration',
    'user-guide/skills',
    'user-guide/tool-safety',
    'user-guide/plugins',
    'user-guide/presets',
  ],
  devGuide: [
    'developer-guide/architecture',
    'developer-guide/wizard-architecture',
    'developer-guide/safety-architecture',
    'developer-guide/adding-agents',
    'developer-guide/agent-personality',
    'developer-guide/adding-skills',
    'developer-guide/adding-tools',
    'developer-guide/adding-plugins',
    'developer-guide/adding-presets',
    'developer-guide/contributing',
  ],
};

export default sidebars;
