import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const input = join(webRoot, '../api/openapi.json');
const output = join(webRoot, 'src/api/schema.d.ts');
const banner = '/** generated, не править вручную */\n';

mkdirSync(dirname(output), { recursive: true });

execSync(`openapi-typescript "${input}" -o "${output}"`, {
  cwd: webRoot,
  stdio: 'inherit',
  shell: true,
});

const content = readFileSync(output, 'utf8');
if (!content.startsWith(banner)) {
  writeFileSync(output, `${banner}${content}`);
}
