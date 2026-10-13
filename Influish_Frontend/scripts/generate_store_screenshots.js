const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const brainDir = 'C:\\Users\\M4\\.gemini\\antigravity-ide\\brain\\1725fb5e-40f0-45ed-a6ff-f12a71b5e94a';
const storeAssetsDir = path.resolve(__dirname, '..', 'store_assets');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

if (!fs.existsSync(storeAssetsDir)) {
  fs.mkdirSync(storeAssetsDir, { recursive: true });
}

// 1. Copy raw screenshots from brain
const rawScreenshots = [
  { src: 'fluencer_campaigns_screen_1790926453559.jpg', dest: 'screenshot-1-campaigns.jpg' },
  { src: 'fluencer_pro_pass_1790926482854.jpg', dest: 'screenshot-2-pro-pass.jpg' },
  { src: 'fluencer_portfolio_metrics_1790926522980.jpg', dest: 'screenshot-3-creator-portfolio.jpg' }
];

rawScreenshots.forEach(({ src, dest }) => {
  const srcPath = path.join(brainDir, src);
  const destPath = path.join(storeAssetsDir, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${dest}`);
  } else {
    console.warn(`File not found: ${srcPath}`);
  }
});

// 2. Render screenshot 4 using Chrome
const htmlWallet = path.join(storeAssetsDir, 'screenshot-4-wallet.html');
const outWallet = path.join(storeAssetsDir, 'screenshot-4-wallet.png');

console.log('Rendering screenshot-4-wallet.png with Chrome...');
execSync(`"${chromePath}" --headless=new --disable-gpu --window-size=1080,1920 --screenshot="${outWallet}" "file:///${htmlWallet.replace(/\\/g, '/')}"`);
console.log('Rendered screenshot-4-wallet.png');

// 3. Create framed 1080x1920 promotional screenshots for all 4 screens
const promoScreens = [
  {
    num: 1,
    tag: 'EXPLORE BRAND CAMPAIGNS',
    title: 'Browse Verified Deals & Sponsorships',
    sub: 'Apply to top brands in fashion, tech, fitness & lifestyle',
    imgFile: 'screenshot-1-campaigns.jpg'
  },
  {
    num: 2,
    tag: 'CREATOR PRO PASS',
    title: 'Unlock 0% Commission & Priority Deals',
    sub: 'Keep 100% of campaign earnings with lifetime access',
    imgFile: 'screenshot-2-pro-pass.jpg'
  },
  {
    num: 3,
    tag: 'CREATOR MEDIA KIT',
    title: 'Showcase Live Analytics & Portfolio',
    sub: 'Share verified engagement rates, followers & past collabs',
    imgFile: 'screenshot-3-creator-portfolio.jpg'
  },
  {
    num: 4,
    tag: 'SECURE ESCROW PAYMENTS',
    title: 'Guaranteed Milestone Payouts',
    sub: 'Funds held safely in escrow & paid directly to your bank',
    imgFile: 'screenshot-4-wallet.png'
  }
];

promoScreens.forEach(item => {
  const promoHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body {
      width: 1080px;
      height: 1920px;
      background: #09090f;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: hidden;
      position: relative;
    }
    .glow-circle {
      position: absolute;
      width: 600px;
      height: 600px;
      top: -100px;
      background: radial-gradient(circle, rgba(168, 85, 247, 0.28) 0%, rgba(9, 9, 15, 0) 70%);
      pointer-events: none;
    }
    .header {
      text-align: center;
      padding: 60px 40px 30px;
      z-index: 10;
    }
    .badge {
      display: inline-block;
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.4);
      color: #c084fc;
      padding: 8px 24px;
      border-radius: 999px;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 1.5px;
      margin-bottom: 16px;
    }
    .title {
      font-size: 46px;
      font-weight: 800;
      line-height: 1.2;
      color: #ffffff;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }
    .subtitle {
      font-size: 22px;
      color: #94a3b8;
      font-weight: 500;
      max-width: 800px;
    }
    .mockup-container {
      margin-top: 15px;
      width: 780px;
      height: 1480px;
      background: #151523;
      border-radius: 46px;
      border: 4px solid #2d2d44;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(168, 85, 247, 0.2);
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      position: relative;
    }
    .mockup-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }
  </style>
</head>
<body>
  <div class="glow-circle"></div>
  <div class="header">
    <div class="badge">${item.tag}</div>
    <h1 class="title">${item.title}</h1>
    <p class="subtitle">${item.sub}</p>
  </div>
  <div class="mockup-container">
    <img class="mockup-img" src="file:///${path.join(storeAssetsDir, item.imgFile).replace(/\\/g, '/')}" />
  </div>
</body>
</html>`;

  const htmlPath = path.join(storeAssetsDir, `promo-${item.num}.html`);
  const outPng = path.join(storeAssetsDir, `play-store-screenshot-${item.num}.png`);

  fs.writeFileSync(htmlPath, promoHtml);
  console.log(`Rendering play-store-screenshot-${item.num}.png...`);
  execSync(`"${chromePath}" --headless=new --disable-gpu --window-size=1080,1920 --screenshot="${outPng}" "file:///${htmlPath.replace(/\\/g, '/')}"`);
  console.log(`Rendered play-store-screenshot-${item.num}.png`);
});

console.log('All screenshots ready in store_assets:');
fs.readdirSync(storeAssetsDir).forEach(f => {
  const stat = fs.statSync(path.join(storeAssetsDir, f));
  console.log(`- ${f} (${(stat.size / 1024).toFixed(1)} KB)`);
});
