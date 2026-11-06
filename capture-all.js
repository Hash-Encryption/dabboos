const { chromium } = require('playwright-core');

(async () => {
  console.log('Capturing all sections for visual audit...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\EdgeCore\\156.0.4314.58\\msedge.exe',
    headless: true
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Navigate to local server
  await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
  
  // Capture preloader midway through build
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'screenshot_preloader.png' });
  console.log('Captured screenshot_preloader.png');

  // Wait for preloader to fully complete and hide
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'screenshot_hero_clean.png' });
  console.log('Captured screenshot_hero_clean.png');

  // Capture Section 3 (Food that feels good & mascot)
  await page.evaluate(() => {
    window.scrollTo(0, 2400);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot_mascot_section3.png' });
  console.log('Captured screenshot_mascot_section3.png');

  // Capture Section 4 (Macro image & exploded ingredients)
  await page.evaluate(() => {
    window.scrollTo(0, 3600);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot_macro_exploded_section4.png' });
  console.log('Captured screenshot_macro_exploded_section4.png');

  // Capture Section 6 (Feel The Change editorial)
  await page.evaluate(() => {
    const el = document.getElementById('editorial-section');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot_editorial_section6.png' });
  console.log('Captured screenshot_editorial_section6.png');

  await browser.close();
  console.log('All section screenshots captured successfully!');
})();
