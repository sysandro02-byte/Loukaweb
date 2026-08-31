import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const output = join(root, 'dist');
const skipped = new Set(['node_modules', 'dist', '.vercel', 'scripts']);

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const entry of readdirSync(root)) {
  if (!skipped.has(entry)) {
    cpSync(join(root, entry), join(output, entry), { recursive: true });
  }
}
