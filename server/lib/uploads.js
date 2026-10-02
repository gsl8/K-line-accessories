import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

export function deleteUpload(urlOrFile) {
  if (!urlOrFile) return;
  const file = urlOrFile.startsWith('/uploads/') ? urlOrFile.slice('/uploads/'.length) : urlOrFile;
  if (!/^[a-z0-9-]+\.(jpe?g|png|webp)$/i.test(file)) return; // never touch non-upload paths
  fs.promises.unlink(path.join(uploadsDir, file)).catch(() => {});
}
