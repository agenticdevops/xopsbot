import JSON5 from 'json5';

interface GenerateOptions {
  workspaces: string[];
  profile: string;
  profileData: {
    environment: Record<string, string>;
    safety: { mode: string; audit_logging: boolean };
  };
}

export function generateOpenClawConfig(options: GenerateOptions): string {
  const { workspaces, profile, profileData } = options;

  const agentList = workspaces.map((ws, index) => ({
    id: `xops-${ws.replace('-agent', '')}`,
    name: ws.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    default: index === 0,
    workspace: `~/.xopsbot/workspaces/${ws}`,
    tools: {
      profile: 'coding',
      deny: profileData.safety.mode === 'safe' ? ['exec', 'write', 'edit'] : [],
    },
  }));

  const config = {
    agents: {
      defaults: {
        model: { primary: 'anthropic/claude-sonnet-4-5' },
        sandbox: { mode: 'off' },
      },
      list: agentList,
    },
    bindings: [],
    skills: {
      load: {
        extraDirs: ['~/.xopsbot/skills'],
        watch: true,
      },
    },
    env: profileData.environment,
  };

  // Use JSON5.stringify with nice formatting
  return JSON5.stringify(config, null, 2);
}
