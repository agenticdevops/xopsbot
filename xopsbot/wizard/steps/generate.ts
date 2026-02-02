import * as p from '@clack/prompts';
import pc from 'picocolors';
import * as fs from 'fs';
import * as path from 'path';
import { generateOpenClawConfig } from '../templates/openclaw.json5';

const XOPSBOT_HOME = path.join(process.env.HOME || '~', '.xopsbot');
const OPENCLAW_HOME = path.join(process.env.HOME || '~', '.openclaw');
const TEMPLATE_DIR = path.join(__dirname, '../../');

export async function generateConfig(workspaces: string[], profile: string) {
  const spinner = p.spinner();
  spinner.start('Generating configuration...');

  try {
    // 1. Create directories
    fs.mkdirSync(path.join(XOPSBOT_HOME, 'workspaces'), { recursive: true });
    fs.mkdirSync(path.join(XOPSBOT_HOME, 'profiles'), { recursive: true });
    fs.mkdirSync(path.join(XOPSBOT_HOME, 'skills'), { recursive: true });
    fs.mkdirSync(OPENCLAW_HOME, { recursive: true });

    // 2. Copy workspace templates
    for (const ws of workspaces) {
      const src = path.join(TEMPLATE_DIR, 'workspaces', ws);
      const dest = path.join(XOPSBOT_HOME, 'workspaces', ws);
      copyDirSync(src, dest);
    }

    // 3. Copy profile template
    const profileSrc = path.join(TEMPLATE_DIR, 'profiles', profile);
    const profileDest = path.join(XOPSBOT_HOME, 'profiles', profile);
    copyDirSync(profileSrc, profileDest);

    // 4. Load profile data
    const profileData = JSON.parse(
      fs.readFileSync(path.join(profileDest, 'profile.json'), 'utf-8')
    );

    // 5. Generate OpenClaw config
    const openclawConfig = generateOpenClawConfig({
      workspaces,
      profile,
      profileData,
    });

    // 6. Write openclaw.json
    fs.writeFileSync(
      path.join(OPENCLAW_HOME, 'openclaw.json'),
      openclawConfig,
      'utf-8'
    );

    spinner.stop('Configuration generated!');

    p.note(
      `Workspaces: ${pc.cyan(workspaces.join(', '))}
Profile: ${pc.cyan(profile)}

Files created:
  ${pc.dim('~/.openclaw/openclaw.json')}
  ${pc.dim('~/.xopsbot/workspaces/*')}
  ${pc.dim('~/.xopsbot/profiles/' + profile + '/')}`,
      'Summary'
    );
  } catch (err) {
    spinner.stop('Failed to generate configuration');
    throw err;
  }
}

function copyDirSync(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
