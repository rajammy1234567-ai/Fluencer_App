import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getPrivacyPageContent() {
  try {
    const possiblePaths = [
      path.join(__dirname, '../public/privacy-policy.html'),
      path.join(process.cwd(), 'public/privacy-policy.html'),
      path.join(process.cwd(), 'fluencer_Backend/public/privacy-policy.html'),
      path.join(__dirname, 'public/privacy-policy.html'),
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf8');
      }
    }
  } catch (err) {
    console.error('Error reading privacy-policy.html:', err);
  }

  // Fallback HTML content if file read fails
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Privacy Policy - Fluencer</title>
  <style>
    body { font-family: sans-serif; background: #0B0B10; color: #FFF; padding: 40px; line-height: 1.6; }
    h1 { color: #34D399; }
  </style>
</head>
<body>
  <h1>Privacy Policy & Data Protection</h1>
  <p>Fluencer respects your privacy. For full inquiries, contact support@fluencer.app.</p>
</body>
</html>`;
}
