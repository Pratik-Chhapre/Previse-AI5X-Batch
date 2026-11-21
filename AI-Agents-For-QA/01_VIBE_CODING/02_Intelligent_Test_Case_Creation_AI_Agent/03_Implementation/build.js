import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'public');
fs.mkdirSync(output, { recursive: true });

for (const filename of ['index.html', 'app.js', 'styles.css']) {
  fs.copyFileSync(path.join(root, filename), path.join(output, filename));
}
