import { copyFileSync, unlinkSync, existsSync } from 'fs';
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const babelrc = resolve(root, '.babelrc');
const babelrcCoverage = resolve(root, '.babelrc.coverage');

copyFileSync(babelrcCoverage, babelrc);

const child = spawn('next', ['dev'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  try { if (existsSync(babelrc)) unlinkSync(babelrc); } catch {}
};

process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(0); });
process.on('SIGTERM', () => { cleanup(); process.exit(0); });

child.on('close', (code) => {
  cleanup();
  process.exit(code ?? 0);
});
