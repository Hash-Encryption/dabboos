const { chromium } = require('playwright-core');

(async () => {
  console.log('🚀 Verifying Flagship Location Section & Navigation Overlay...');
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\EdgeCore\\156.0.4314.58\\msedge.exe',
      headless: true
    });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.body.classList.contains('is-loading'), { timeout: 8000 });
    await page.waitForTimeout(1000);

    // 1. Test Menu Overlay
    console.log('🔘 Opening Menu Overlay...');
    const menuBtn = page.locator('#menu-toggle');
    await menuBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'audit_nav_overlay.png' });
    console.log('📸 Saved: audit_nav_overlay.png');

    // Close overlay
    await page.evaluate(() => window.toggleNavOverlay(false));
    await page.waitForTimeout(400);

    // 2. Scroll to Travel / Flagship Section
    console.log('📍 Scrolling to #travel-section (Flagship Location & Fast Delivery)...');
    await page.evaluate(() => {
      const el = document.getElementById('travel-section');
      if (window.lenis) window.lenis.scrollTo(el, { immediate: true });
      else el.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(1500);

    const isFlagshipVisible = await page.locator('#flagship-card').isVisible();
    console.log('✅ Flagship Card is visible:', isFlagshipVisible);

    const cardTitle = await page.locator('#flagship-card h3').textContent();
    console.log('🏛️ Flagship Card Title:', cardTitle.trim());

    await page.screenshot({ path: 'audit_flagship_section.png' });
    console.log('📸 Saved: audit_flagship_section.png');

    // 3. Scroll to Footer to verify 04. LOCATION link
    console.log('🦶 Scrolling to footer navigation...');
    await page.evaluate(() => {
      const footer = document.getElementById('footer-section');
      if (window.lenis) window.lenis.scrollTo(footer, { immediate: true });
      else footer.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(1000);

    const locationLinkText = await page.locator('footer nav a[href="#travel-section"]').textContent();
    console.log('🔗 Footer Location Link Text:', locationLinkText.trim());

    console.log('🎉 Verification successful!');
  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
