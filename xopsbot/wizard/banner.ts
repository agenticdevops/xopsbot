import pc from 'picocolors';

export function printBanner(): void {
  const art = [
    pc.cyan('  X ╔═╗ ╔═╗ ╔═╗ . ╔╗  ╔═╗ ╔╦╗'),
    pc.cyan('    ║ ║ ╠═╝ ╚═╗   ╠╩╗ ║ ║  ║ '),
    pc.cyan('    ╚═╝ ╩   ╚═╝   ╚═╝ ╚═╝  ╩ '),
  ];

  console.log();
  for (const line of art) {
    console.log(line);
  }
  console.log();
  console.log(`  ${pc.bold(pc.cyan('xops.bot'))}`);
  console.log(`  ${pc.dim('DevOps agents powered by OpenClaw')}`);
  console.log();
}
