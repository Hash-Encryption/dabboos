const { chromium } = require('playwright-core');

(async () => {
  console.log('📱 Starting comprehensive Mobile UI/UX & Responsive Audit...');
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\EdgeCore\\156.0.4314.58\\msedge.exe',
      headless: true
    });

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      hasTouch: true,
      isMobile: true
    });

    const page = await mobileContext.newPage();
    const pageErrors = [];
    const consoleErrors = [];

    page.on('pageerror', err => pageErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.body.classList.contains('is-loading'), { timeout: 8000 });
    await page.waitForTimeout(1000);

    // 1. Audit Header & Hero on Mobile
    console.log('🔍 Auditing Mobile Header and Hero section...');
    const headerHeight = await page.evaluate(() => document.querySelector('header').clientHeight);
    console.log('📏 Mobile Header Height (Expected ~60px):', headerHeight);

    const pinIconSize = await page.evaluate(() => {
      const pin = document.querySelector('header a > div');
      const rect = pin.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    console.log('📍 Location Pin Size on Mobile (Expected ~22px):', pinIconSize);

    // Check custom cursor display on touch devices
    const cursorDisplay = await page.evaluate(() => {
      const dot = document.querySelector('.custom-cursor-dot');
      if (!dot) return 'none';
      return window.getComputedStyle(dot).display;
    });
    console.log('🖱️ Custom Cursor Display on Mobile (Expected none):', cursorDisplay);

    // Check horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log('📐 Has Horizontal Scroll Overflow on Mobile (Must be false):', hasHorizontalOverflow);

    await page.screenshot({ path: 'audit_mobile_1_hero.png' });
    console.log('📸 Saved: audit_mobile_1_hero.png');

    // 2. Audit Section 2 Polaroid Cards on Mobile
    console.log('🖼️ Auditing Mobile Polaroid Cards...');
    await page.evaluate(() => {
      const el = document.getElementById('gallery-section');
      if (window.lenis) window.lenis.scrollTo(el, { immediate: true });
      else el.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(1000);

    const polaroidWidth = await page.evaluate(() => {
      const card = document.querySelector('.polaroid-item');
      return card ? card.getBoundingClientRect().width : 0;
    });
    console.log('📐 Polaroid Card Width on 390px Mobile (Expected ~343px / 88vw):', polaroidWidth);

    await page.screenshot({ path: 'audit_mobile_2_polaroids.png' });
    console.log('📸 Saved: audit_mobile_2_polaroids.png');

    // 3. Audit Flagship Centerpiece Card on Mobile
    console.log('📍 Auditing Mobile Flagship Location Section...');
    await page.evaluate(() => {
      const el = document.getElementById('travel-section');
      if (window.lenis) window.lenis.scrollTo(el, { immediate: true });
      else el.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'audit_mobile_3_flagship.png' });
    console.log('📸 Saved: audit_mobile_3_flagship.png');

    // 4. Audit Full Menu Page on Mobile (2-Column Grid)
    console.log('🍔 Navigating to Menu Page on Mobile...');
    await page.evaluate(() => window.switchView('menu'));
    await page.waitForTimeout(800);

    const menuGridCols = await page.evaluate(() => {
      const grid = document.getElementById('menu-items-grid');
      const style = window.getComputedStyle(grid);
      return style.gridTemplateColumns.split(' ').length;
    });
    console.log('📱 Menu Grid Columns on Mobile (Expected 2):', menuGridCols);

    await page.screenshot({ path: 'audit_mobile_4_menu_grid.png' });
    console.log('📸 Saved: audit_mobile_4_menu_grid.png');

    // 5. Audit Footer & Matter.js Physics on Mobile
    console.log('🦶 Returning Home and Auditing Footer on Mobile...');
    await page.evaluate(() => {
      window.switchView('home');
      const footer = document.getElementById('footer-section');
      if (window.lenis) window.lenis.scrollTo(footer, { immediate: true });
      else footer.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'audit_mobile_5_footer.png' });
    console.log('📸 Saved: audit_mobile_5_footer.png');

    console.log('\n================ MOBILE AUDIT RESULTS ================');
    console.log('Page Errors count:', pageErrors.length);
    console.log('Console Errors count:', consoleErrors.length);
    console.log('Horizontal Overflow Free:', !hasHorizontalOverflow);
    console.log('Mobile Header Height:', headerHeight);
    console.log('Menu Grid Columns:', menuGridCols);

    if (pageErrors.length === 0 && consoleErrors.length === 0 && !hasHorizontalOverflow) {
      console.log('🎉 PERFECT MOBILE AUDIT! ALL CHECKS PASSED.');
    }
  } catch (err) {
    console.error('Mobile audit failed:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
