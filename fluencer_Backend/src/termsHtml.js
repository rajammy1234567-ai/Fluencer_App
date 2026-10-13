import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getTermsPageContent() {
  try {
    const possiblePaths = [
      path.join(__dirname, '../public/terms-and-eula.html'),
      path.join(process.cwd(), 'public/terms-and-eula.html'),
      path.join(process.cwd(), 'fluencer_Backend/public/terms-and-eula.html'),
      path.join(__dirname, 'public/terms-and-eula.html'),
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf8');
      }
    }
  } catch (err) {
    console.error('Error reading terms-and-eula.html:', err);
  }

  // Fallback HTML content if file read fails
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Terms of Service - Fluencer</title>
  <style>
    body { font-family: sans-serif; background: #0B0B10; color: #FFF; padding: 40px; line-height: 1.6; }
    h1 { color: #C084FC; }
  </style>
</head>
<body>
  <h1>Terms of Service & EULA</h1>
  <p>Fluencer maintains zero tolerance for objectionable content and abusive users. Inquiries: support@fluencer.app.</p>
</body>
</html>`;
}
