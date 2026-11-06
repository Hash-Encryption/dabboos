const { chromium } = require('playwright-core');

(async () => {
  console.log('📸 Capturing visual audit screenshots for Preloader, Footer, and Minimalist Menu...');
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\EdgeCore\\156.0.4314.58\\msedge.exe',
      headless: true
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    // 1. Capture Preloader mid-way
    console.log('⏳ Navigating and immediately capturing Preloader...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800); // Preloader is active around 50%
    await page.screenshot({ path: 'audit_1_preloader_locked.png' });
    console.log('✅ Captured: audit_1_preloader_locked.png');

    // Wait for preloader to finish
    await page.waitForTimeout(3000);

    // 2. Capture Menu Page Minimalist Cards
    console.log('🍔 Navigating to Menu View...');
    await page.evaluate(() => window.switchView('menu'));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'audit_2_minimalist_menu.png' });
    console.log('✅ Captured: audit_2_minimalist_menu.png');

    // 3. Return Home and scroll directly to Footer
    console.log('🦶 Returning Home and capturing Footer...');
    await page.evaluate(() => {
      window.switchView('home');
      const footer = document.getElementById('footer-section');
      if (footer) footer.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(2000); // Allow physics ingredients to drop
    await page.screenshot({ path: 'audit_3_footer_no_clipping.png' });
    console.log('✅ Captured: audit_3_footer_no_clipping.png');

    console.log('🎉 All audit screenshots captured successfully!');
  } catch (err) {
    console.error('Audit screenshot capture failed:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
