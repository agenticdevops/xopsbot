import { describe, expect, it } from 'bun:test';
import {
  generateToolSafetySection,
  generateWorkspaceToolsMd,
  stripGeneratedSections,
} from './generate-tools-md';
import { kubectlTool } from './definitions/kubectl';
import { ALL_TOOLS } from './index';
import type { ToolDefinition } from './schema';

describe('generateToolSafetySection', () => {
  it('produces a heading with the tool name', () => {
    const output = generateToolSafetySection(kubectlTool);
    expect(output).toContain('## kubectl');
  });

  it('contains Read-Only Operations section for LOW risk commands', () => {
    const output = generateToolSafetySection(kubectlTool);
    expect(output).toContain('### Read-Only Operations (LOW risk)');
  });

  it('contains kubectl get in the LOW risk table', () => {
    const output = generateToolSafetySection(kubectlTool);
    expect(output).toContain('| `kubectl get` | LOW |');
  });

  it('contains Destructive Operations section for CRITICAL risk commands', () => {
    const output = generateToolSafetySection(kubectlTool);
    expect(output).toContain('### Destructive Operations (CRITICAL risk)');
  });

  it('contains kubectl delete in the CRITICAL risk table', () => {
    const output = generateToolSafetySection(kubectlTool);
    expect(output).toContain('| `kubectl delete` | CRITICAL |');
  });

  it('omits groups with no commands', () => {
    const minimalTool: ToolDefinition = {
      name: 'testtool',
      description: 'A test tool',
      defaultRisk: 'LOW',
      binaryPatterns: ['*/testtool'],
      commands: [
        { command: 'info', risk: 'LOW', description: 'Show info', readOnly: true },
        { command: 'nuke', risk: 'CRITICAL', description: 'Destroy everything', readOnly: false },
      ],
    };
    const output = generateToolSafetySection(minimalTool);
    expect(output).toContain('### Read-Only Operations (LOW risk)');
    expect(output).toContain('### Destructive Operations (CRITICAL risk)');
    expect(output).not.toContain('Diagnostic Operations');
    expect(output).not.toContain('Mutations');
  });
});

describe('generateWorkspaceToolsMd', () => {
  it('starts with # Tools heading', () => {
    const output = generateWorkspaceToolsMd('k8s-agent', ALL_TOOLS);
    expect(output).toMatch(/^# Tools\n/);
  });

  it('contains GENERATED marker', () => {
    const output = generateWorkspaceToolsMd('k8s-agent', ALL_TOOLS);
    expect(output).toContain('<!-- GENERATED: Safety annotations from tool definitions -->');
  });

  it('contains END GENERATED marker', () => {
    const output = generateWorkspaceToolsMd('k8s-agent', ALL_TOOLS);
    expect(output).toContain('<!-- END GENERATED -->');
  });

  it('contains kubectl section for k8s-agent', () => {
    const output = generateWorkspaceToolsMd('k8s-agent', ALL_TOOLS);
    expect(output).toContain('## kubectl');
  });

  it('contains docker section for k8s-agent', () => {
    const output = generateWorkspaceToolsMd('k8s-agent', ALL_TOOLS);
    expect(output).toContain('## docker');
  });

  it('does NOT contain aws/terraform/ansible for k8s-agent', () => {
    const output = generateWorkspaceToolsMd('k8s-agent', ALL_TOOLS);
    expect(output).not.toContain('## aws');
    expect(output).not.toContain('## terraform');
    expect(output).not.toContain('## ansible');
  });

  it('contains aws section for finops-agent', () => {
    const output = generateWorkspaceToolsMd('finops-agent', ALL_TOOLS);
    expect(output).toContain('## aws');
  });

  it('does NOT contain kubectl for finops-agent', () => {
    const output = generateWorkspaceToolsMd('finops-agent', ALL_TOOLS);
    expect(output).not.toContain('## kubectl');
  });

  it('contains Risk Classification Summary table', () => {
    const output = generateWorkspaceToolsMd('k8s-agent', ALL_TOOLS);
    expect(output).toContain('Risk Classification Summary');
    expect(output).toContain('| LOW |');
    expect(output).toContain('| MEDIUM |');
    expect(output).toContain('| HIGH |');
    expect(output).toContain('| CRITICAL |');
  });

  it('preserves hand-written content after generated block', () => {
    const handWritten = '## Common Debugging Patterns\n\n### Pod Not Starting\n\nCheck events with `kubectl describe pod`.\n';
    const output = generateWorkspaceToolsMd('k8s-agent', ALL_TOOLS, handWritten);
    expect(output).toContain('<!-- END GENERATED -->');
    expect(output).toContain('## Common Debugging Patterns');
    expect(output).toContain('### Pod Not Starting');
    // Hand-written content comes after the generated block
    const endMarkerIdx = output.indexOf('<!-- END GENERATED -->');
    const handWrittenIdx = output.indexOf('## Common Debugging Patterns');
    expect(handWrittenIdx).toBeGreaterThan(endMarkerIdx);
  });

  it('strips old generated block from existingContent before appending', () => {
    const existingWithOldGenerated = [
      '# Tools',
      '<!-- GENERATED: Safety annotations from tool definitions -->',
      '## OLD CONTENT',
      '<!-- END GENERATED -->',
      '',
      '## Hand-Written Section',
      '',
      'This is manual content.',
    ].join('\n');

    const output = generateWorkspaceToolsMd('k8s-agent', ALL_TOOLS, existingWithOldGenerated);
    // Should not contain the old generated content
    expect(output).not.toContain('## OLD CONTENT');
    // Should contain the new generated content
    expect(output).toContain('## kubectl');
    // Should preserve hand-written section
    expect(output).toContain('## Hand-Written Section');
    expect(output).toContain('This is manual content.');
  });
});

describe('stripGeneratedSections', () => {
  it('removes generated block between markers', () => {
    const input = [
      '# Tools',
      '<!-- GENERATED: Safety annotations from tool definitions -->',
      '## Some Generated Stuff',
      '| Command | Risk | Description |',
      '<!-- END GENERATED -->',
      '',
      '## Hand-Written',
      'Manual content here.',
    ].join('\n');

    const output = stripGeneratedSections(input);
    expect(output).not.toContain('## Some Generated Stuff');
    expect(output).not.toContain('GENERATED');
    expect(output).toContain('## Hand-Written');
    expect(output).toContain('Manual content here.');
  });

  it('returns content unchanged if no markers present', () => {
    const input = '## Just Some Content\n\nNo markers here.\n';
    const output = stripGeneratedSections(input);
    expect(output).toBe(input);
  });

  it('strips leading # Tools heading', () => {
    const input = '# Tools\n\n## Hand-Written Section\n';
    const output = stripGeneratedSections(input);
    expect(output).not.toMatch(/^# Tools/);
    expect(output).toContain('## Hand-Written Section');
  });
});
