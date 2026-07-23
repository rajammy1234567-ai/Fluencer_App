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
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        content = content.replace(
          '<div class="nav-item" id="nav-campaigns" onclick="switchTab(\'campaigns\')">📢 Active Campaigns</div>',
          '<div class="nav-item" id="nav-campaigns" onclick="switchTab(\'campaigns\')">📢 Active Campaigns</div>\n        <div class="nav-item" id="nav-banners" onclick="switchTab(\'banners\')">🖼️ Banner Manager</div>'
        );
        content = content.replace(
          '<div id="campaigns-tab" class="tab-content">',
          '<div id="banners-tab" class="tab-content" style="display:none;"></div>\n    <div id="campaigns-tab" class="tab-content">'
        );
        return content;
      }
    }
  } catch (err) {
    console.error('Error in getAdminPageContent:', err);
  }
  return `<!DOCTYPE html><html><head><title>Admin Error</title></head><body style="background:#0F172A;color:#FFF;font-family:sans-serif;padding:40px;"><h1>Admin HTML File Missing</h1></body></html>`;
}
