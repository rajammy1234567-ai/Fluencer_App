const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const brainDir = 'C:\\Users\\M4\\.gemini\\antigravity-ide\\brain\\1725fb5e-40f0-45ed-a6ff-f12a71b5e94a';
const storeAssetsDir = path.resolve(__dirname, '..', 'store_assets');

if (!fs.existsSync(storeAssetsDir)) {
  fs.mkdirSync(storeAssetsDir, { recursive: true });
}

// 1. Copy the 3 generated high-res screenshots
const existingScreenshots = [
  { src: 'fluencer_campaigns_screen_1790926453559.jpg', dest: 'screenshot-1-campaigns.jpg' },
  { src: 'fluencer_pro_pass_1790926482854.jpg', dest: 'screenshot-2-pro-pass.jpg' },
  { src: 'fluencer_portfolio_metrics_1790926522980.jpg', dest: 'screenshot-3-creator-portfolio.jpg' }
];

existingScreenshots.forEach(({ src, dest }) => {
  const srcPath = path.join(brainDir, src);
  const destPath = path.join(storeAssetsDir, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${src} -> ${dest}`);
  }
});
