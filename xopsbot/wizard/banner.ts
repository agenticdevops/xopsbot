import pc from 'picocolors';

export function printBanner(): void {
  const art = [
    pc.cyan('__  __  ___  ____  ____    ____   ___ _____ '),
    pc.cyan(' \\ \\/ / / _ \\|  _ \\/ ___|  | __ ) / _ \\_   _|'),
    pc.cyan('  \\  / | | | | |_) \\___ \\  |  _ \\| | | || |  '),
    pc.cyan('  /  \\ | |_| |  __/ ___) |_| |_) | |_| || |  '),
    pc.cyan(' /_/\\_\\ \\___/|_|   |____/(_)____/ \\___/ |_|  '),
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
