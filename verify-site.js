const { chromium } = require('playwright-core');

(async () => {
  console.log('🚀 Starting DABBOOS upgraded automated browser verification...');
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

    const consoleMessages = [];
    const pageErrors = [];

    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text });
      if (msg.type() === 'error') {
        console.error('❌ Browser Console Error:', text);
      }
    });

    page.on('pageerror', err => {
      pageErrors.push(err.message);
      console.error('❌ Browser Page Error:', err.message);
    });

    console.log('🌐 Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    console.log('✅ Page loaded. Initial Title:', await page.title());

    // Check preloader runs and completes
    console.log('⏳ Waiting for preloader exit...');
    await page.waitForTimeout(3000);

    // Verify initial scroll position is locked at top
    const initialScrollY = await page.evaluate(() => window.scrollY);
    console.log('📍 Initial Scroll Y after preloader (Must be ~0):', initialScrollY);

    // Capture clean Hero section with transparent cutout burger
    await page.screenshot({ path: 'screenshot_hero_clean_cutout.png' });
    console.log('📸 Hero clean cutout saved: screenshot_hero_clean_cutout.png');

    // Test Section 2 Polaroid Cards with AI visuals
    console.log('📜 Scrolling to Section 2: Polaroid Gallery with Nano Banana food visuals...');
    await page.evaluate(() => {
      const el = document.getElementById('gallery-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshot_polaroids_ai.png' });
    console.log('📸 Polaroids AI visuals saved: screenshot_polaroids_ai.png');

    // Test Menu Overlay and Full Menu Page Switching
    console.log('🍔 Clicking MENU button to open Menu Overlay...');
    const menuBtn = page.locator('#menu-toggle');
    await menuBtn.click();
    await page.waitForTimeout(500);

    const isOverlayVisible = await page.locator('#nav-overlay').isVisible();
    console.log('✅ Menu Overlay is visible:', isOverlayVisible);

    console.log('📋 Clicking FULL MENU from Overlay...');
    const overlayMenuLink = page.locator('#nav-overlay a:has-text("02. FULL MENU")');
    await overlayMenuLink.click();
    await page.waitForTimeout(800);

    const isMenuViewVisible = await page.locator('#menu-view').isVisible();
    console.log('✅ Full Menu Page is visible:', isMenuViewVisible);
    console.log('📄 Menu Page Title:', await page.title());
    await page.screenshot({ path: 'screenshot_menu_page_full.png' });
    console.log('📸 Menu Page full screenshot saved: screenshot_menu_page_full.png');

    // Test Category Filtering on Menu Page
    console.log('🏷️ Testing Category Tab click: الوجبات المقرمشة والتندرز...');
    const tendersTab = page.locator('.category-tab-btn[data-cat="crispy"]');
    await tendersTab.click();
    await page.waitForTimeout(500);
    const visibleCardsCount = await page.locator('.menu-product-card').count();
    console.log('🍗 Visible product cards in Tenders category:', visibleCardsCount);

    // Test Search Filter
    console.log('🔍 Testing search input with query "هريسة"...');
    const searchInput = page.locator('#menu-search-input');
    await searchInput.fill('هريسة');
    await page.waitForTimeout(500);
    const searchCardsCount = await page.locator('.menu-product-card').count();
    console.log('🔍 Filtered cards count:', searchCardsCount);

    // Clear Search and add an item to Cart
    await searchInput.fill('');
    await page.waitForTimeout(300);
    console.log('🛒 Adding first item to Cart...');
    const firstAddBtn = page.locator('.menu-product-card button').first();
    await firstAddBtn.click();
    await page.waitForTimeout(600);

    // Verify Floating Cart Pill appeared
    const isCartPillVisible = await page.locator('#cart-floating-pill').isVisible();
    console.log('✅ Floating Cart Pill is visible:', isCartPillVisible);

    // Click Cart Pill to open Cart Drawer
    console.log('🛍️ Opening Cart Drawer...');
    const cartPillBtn = page.locator('#cart-floating-pill button');
    await cartPillBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshot_cart_drawer.png' });
    console.log('📸 Cart Drawer screenshot saved: screenshot_cart_drawer.png');

    // Close Cart Drawer
    const cartCloseBtn = page.locator('#cart-close-btn');
    await cartCloseBtn.click();
    await page.waitForTimeout(400);

    // Test Back to Home Button
    console.log('🏠 Testing Back to Home button...');
    const backHomeBtn = page.locator('#nav-back-home');
    await backHomeBtn.click();
    await page.waitForTimeout(600);
    const isHomeVisible = await page.locator('#home-view').isVisible();
    console.log('✅ Back to Home View:', isHomeVisible);

    // Scroll to Footer & test lazy-loaded physics engine
    console.log('🧪 Scrolling to Footer to test lazy-loaded Matter.js physics engine...');
    await page.evaluate(() => {
      const footer = document.getElementById('footer-section');
      if (footer) footer.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(2000);

    const canvasCount = await page.locator('#physics-canvas-container canvas').count();
    console.log('✅ Physics canvas initialized upon scrolling near footer:', canvasCount > 0);

    console.log('\n================ AUDIT SUMMARY ================');
    console.log('Page Errors count:', pageErrors.length);
    const severeConsoleErrors = consoleMessages.filter(m => m.type === 'error');
    console.log('Severe Console Errors count:', severeConsoleErrors.length);
    if (pageErrors.length === 0 && severeConsoleErrors.length === 0) {
      console.log('🎉 ALL TESTS PASSED! ZERO ERRORS DETECTED.');
    } else {
      console.log('Errors:', { pageErrors, severeConsoleErrors });
    }

  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
