const { chromium } = require('playwright-core');

(async () => {
  console.log('🔍 Testing Footer DABBOOS Giant Logo on Desktop and Mobile...');
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\EdgeCore\\156.0.4314.58\\msedge.exe',
      headless: true
    });

    // 1. Desktop Test (1440 x 900)
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    // Wait until preloader completely exits and body is unlocked
    await desktopPage.waitForFunction(() => !document.body.classList.contains('is-loading'), { timeout: 8000 });
    await desktopPage.waitForTimeout(1000);

    // Scroll to footer
    await desktopPage.evaluate(() => {
      const footer = document.getElementById('footer-section');
      if (window.lenis) {
        window.lenis.scrollTo(footer, { immediate: true });
      } else {
        footer.scrollIntoView({ behavior: 'instant' });
      }
    });
    await desktopPage.waitForTimeout(1500);

    const logoMetricsDesktop = await desktopPage.evaluate(() => {
      const el = document.querySelector('.footer-giant-logo');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        width: rect.width,
        height: rect.height,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        stroke: style.webkitTextStroke,
        text: el.textContent
      };
    });
    console.log('🖥️ Desktop Logo Metrics:', logoMetricsDesktop);

    await desktopPage.screenshot({ path: 'audit_footer_desktop_fixed.png' });
    console.log('📸 Desktop footer saved: audit_footer_desktop_fixed.png');

    // 2. Mobile Test (390 x 844 - iPhone 13/14)
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForFunction(() => !document.body.classList.contains('is-loading'), { timeout: 8000 });
    await mobilePage.waitForTimeout(1000);

    await mobilePage.evaluate(() => {
      const footer = document.getElementById('footer-section');
      if (window.lenis) {
        window.lenis.scrollTo(footer, { immediate: true });
      } else {
        footer.scrollIntoView({ behavior: 'instant' });
      }
    });
    await mobilePage.waitForTimeout(1500);

    const logoMetricsMobile = await mobilePage.evaluate(() => {
      const el = document.querySelector('.footer-giant-logo');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        width: rect.width,
        height: rect.height,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        stroke: style.webkitTextStroke,
        text: el.textContent
      };
    });
    console.log('📱 Mobile Logo Metrics:', logoMetricsMobile);

    await mobilePage.screenshot({ path: 'audit_footer_mobile_fixed.png' });
    console.log('📸 Mobile footer saved: audit_footer_mobile_fixed.png');

    console.log('🎉 Verification completed successfully!');
  } catch (err) {
    console.error('Footer logo verification failed:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
