import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getAdminPageContent() {
  try {
    const possiblePaths = [
      path.join(__dirname, '../public/admin.html'),
      path.join(process.cwd(), 'public/admin.html'),
      path.join(process.cwd(), 'fluencer_Backend/public/admin.html'),
      path.join(__dirname, 'public/admin.html'),
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf8');
      }
    }
  } catch (err) {
    console.error('Error in getAdminPageContent:', err);
  }
  return `<!DOCTYPE html><html><head><title>Admin Error</title></head><body style="background:#0F172A;color:#FFF;font-family:sans-serif;padding:40px;"><h1>Admin HTML File Missing</h1></body></html>`;
}
