import { spawn } from 'node:child_process';

const commands = [
  { name: 'api', command: 'npm', args: ['run', 'dev', '--prefix', 'backend'] },
  { name: 'web', command: 'npm', args: ['run', 'dev', '--prefix', 'frontend'] }
];

const children = commands.map(({ name, command, args }) => {
  const child = spawn(command, args, {
    stdio: 'pipe',
    shell: process.platform === 'win32'
  });

  child.stdout.on('data', (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });

  return child;
});

function shutdown() {
  children.forEach((child) => child.kill());
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
