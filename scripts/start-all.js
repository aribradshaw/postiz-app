const { spawn } = require('child_process');

const procs = [
  { name: 'backend',      cmd: 'pnpm', args: ['run', 'start:prod:backend'] },
  { name: 'orchestrator',  cmd: 'pnpm', args: ['run', 'start:prod:orchestrator'] },
];

for (const { name, cmd, args } of procs) {
  const child = spawn(cmd, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  child.stdout.on('data', (d) =>
    d.toString().split('\n').filter(Boolean).forEach((line) =>
      console.log(`[${name}] ${line}`)
    )
  );

  child.stderr.on('data', (d) =>
    d.toString().split('\n').filter(Boolean).forEach((line) =>
      console.error(`[${name}] ${line}`)
    )
  );

  child.on('exit', (code) => {
    console.error(`[${name}] exited with code ${code}`);
    process.exit(code || 1);
  });
}
