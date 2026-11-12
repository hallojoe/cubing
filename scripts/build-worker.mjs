// Hash the finished shell, icons and bundles together so an update installs atomically.
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const dist = 'dist';
const files = [];
async function collect(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) await collect(path);
    else files.push(relative(dist, path).split(sep).join('/'));
  }
}
await collect(join(dist, 'assets'));
await collect(join(dist, 'app'));
files.sort();
const template = await readFile('scripts/worker-template.js', 'utf8');
const hash = createHash('sha256').update(template);
for (const file of files) {
  hash.update(file).update(await readFile(join(dist, file)));
}
const worker = template.replace('__VERSION__', hash.digest('hex').slice(0, 20))
  .replace('/* PRECACHE */ []', JSON.stringify(files));
await writeFile(join(dist, 'cubing-sw.js'), worker);
