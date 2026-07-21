import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\jhasa\\.gemini\\antigravity\\brain\\bab85b7a-8d4f-4f33-9d4e-df6646a7e7c6';

async function runVisualTests() {
  console.log('🚀 Starting Visual UI Automation Tests with Puppeteer...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set viewport to mobile standard since it's a React Native Web layout
  await page.setViewport({ width: 450, height: 900 });

  // Disable default 30-second timeout since Metro bundler can take time to build on first load
  page.setDefaultNavigationTimeout(180000); // 3 minutes timeout

  try {
    // 1. Role Selection Screen
    console.log('📸 Navigating to Role Selection (waiting for Metro to compile)...');
    await page.goto('http://localhost:8081/role-selection', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 5000)); // Let animations settle
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_role_selection.png') });
    console.log('✅ Screenshot saved: 01_role_selection.png');

    // 2. Influencer Login Screen
    console.log('📸 Navigating to Influencer Login...');
    await page.goto('http://localhost:8081/login?role=influencer', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_influencer_login.png') });
    console.log('✅ Screenshot saved: 02_influencer_login.png');

    // 3. Admin Login Screen
    console.log('📸 Navigating to Admin Login...');
    await page.goto('http://localhost:8081/(admin)/login', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_admin_login.png') });
    console.log('✅ Screenshot saved: 03_admin_login.png');

    // 4. Perform Admin Login & Dashboard View
    console.log('⚙️ Typing Admin credentials...');
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].type('admin@fluencer.app');
      await inputs[1].type('Admin@123');
    } else {
      // Fallback selector typing
      await page.type('input[type="email"]', 'admin@fluencer.app');
      await page.type('input[type="password"]', 'Admin@123');
    }
    
    console.log('⚙️ Clicking Sign In...');
    const buttons = await page.$$('div[role="button"], button');
    let loginButtonClicked = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('Sign In') || text.includes('Login'))) {
        await btn.click();
        loginButtonClicked = true;
        break;
      }
    }
    if (!loginButtonClicked && buttons.length > 0) {
      await buttons[0].click();
    }

    console.log('⏳ Waiting for dashboard redirect...');
    await new Promise(r => setTimeout(r, 6000)); // Give it time to hit backend API
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_admin_dashboard.png') });
    console.log('✅ Screenshot saved: 04_admin_dashboard.png');

    // 5. Admin Notifications Screen
    console.log('📸 Navigating to Admin Notifications...');
    await page.goto('http://localhost:8081/(admin)/notifications', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_admin_notifications.png') });
    console.log('✅ Screenshot saved: 05_admin_notifications.png');

    console.log('\n🌟 ALL VISUAL SCREENSHOT TESTS COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Visual verification failed:', error);
  } finally {
    await browser.close();
  }
}

runVisualTests();
