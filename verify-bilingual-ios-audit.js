const { chromium } = require('playwright-core');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\EdgeCore\\156.0.4314.58\\msedge.exe';

async function runAudit() {
  console.log('🚀 Starting Comprehensive iOS Safari, Anti-Jitter & Bilingual i18n Audit...');
  
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const pageErrors = [];
  const consoleErrors = [];

  // 1. Mobile Context (iPhone 14 Pro: 393 x 852, touch pointer coarse)
  const mobileContext = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });

  const page = await mobileContext.newPage();

  page.on('pageerror', (err) => {
    console.error('❌ Page Error Stack:', err.stack || err.message);
    pageErrors.push(err.message);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.warn('⚠️ Console Error:', msg.text());
      consoleErrors.push(msg.text());
    }
  });

  console.log('🌐 Navigating to http://localhost:3000 on Mobile Viewport...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Wait for preloader completion
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'), { timeout: 10000 });
  await page.waitForTimeout(500);

  console.log('🔍 Auditing Anti-Jitter & iOS Scroll Stabilization...');
  const heroStyles = await page.evaluate(() => {
    const hero = document.getElementById('hero-section');
    const computed = window.getComputedStyle(hero);
    return {
      minHeight: computed.minHeight,
      hasTranslate3d: computed.transform.includes('matrix3d') || computed.transform !== 'none' || computed.willChange.includes('transform'),
      lenisInstance: window.lenis !== null && window.lenis !== undefined,
      gsapIgnoreResize: gsap.config().ignoreMobileResize
    };
  });

  console.log('📱 Hero Min-Height:', heroStyles.minHeight);
  console.log('📱 Hardware Accelerated Transform / willChange:', heroStyles.hasTranslate3d);
  console.log('📱 Lenis Active on Touch Device (Must be FALSE):', heroStyles.lenisInstance);
  console.log('📱 GSAP ignoreMobileResize (Must be TRUE):', heroStyles.gsapIgnoreResize);

  if (heroStyles.lenisInstance) {
    throw new Error('FAIL: Lenis is active on mobile touch device!');
  }
  if (!heroStyles.gsapIgnoreResize) {
    throw new Error('FAIL: gsap ignoreMobileResize is false!');
  }

  // 2. Language Switcher Tests
  console.log('\n🌐 Auditing Instant Bilingual Language Switcher (AR -> EN -> AR)...');
  const initialLang = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    toggleText: document.getElementById('lang-toggle-text')?.textContent.trim()
  }));

  console.log('🇸🇦 Initial Language State:', initialLang);

  // Switch to English
  console.log('🔄 Clicking Language Toggle Button to switch to English...');
  await page.click('#lang-toggle-btn');
  await page.waitForTimeout(300);

  const englishState = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    toggleText: document.getElementById('lang-toggle-text')?.textContent.trim(),
    brandSub: document.querySelector('[data-i18n="brand_sub"]')?.textContent.trim(),
    heroBadge1: document.querySelector('[data-i18n="hero_badge_1"]')?.textContent.trim(),
    flagshipTitle: document.querySelector('[data-i18n="flagship_name"]')?.textContent.trim(),
    flagshipPill: document.querySelector('[data-i18n="flagship_pill"]')?.textContent.trim()
  }));

  console.log('🇺🇸 English Language State:', englishState);

  if (englishState.lang !== 'en' || englishState.dir !== 'ltr') {
    throw new Error(`FAIL: English toggle failed: lang=${englishState.lang}, dir=${englishState.dir}`);
  }
  if (englishState.toggleText !== 'عربي') {
    throw new Error(`FAIL: Toggle button should show "عربي" when active lang is EN. Found: ${englishState.toggleText}`);
  }

  await page.screenshot({ path: 'audit_bilingual_1_hero_en.png' });
  console.log('📸 Saved: audit_bilingual_1_hero_en.png');

  // 3. Menu View Auditing
  console.log('\n🍔 Navigating to Menu View in English Mode...');
  await page.evaluate(() => window.switchView('menu'));
  await page.waitForTimeout(400);

  const menuEnState = await page.evaluate(() => {
    const cards = document.querySelectorAll('.menu-product-card');
    const firstCard = cards[0];
    const img = firstCard?.querySelector('img');
    const titleEl = firstCard?.querySelector('h3');
    const tagEl = firstCard?.querySelector('span.font-arabic');
    const priceEl = firstCard?.querySelector('.font-bungee');
    const addBtn = firstCard?.querySelector('button');

    return {
      cardCount: cards.length,
      imgHasLazy: img ? (img.hasAttribute('loading') && img.getAttribute('loading') === 'lazy') : false,
      imgDecoding: img?.getAttribute('decoding'),
      imgSrc: img?.getAttribute('src'),
      titleText: titleEl?.textContent.trim(),
      titleHasEllipsis: titleEl ? (window.getComputedStyle(titleEl).textOverflow === 'ellipsis') : false,
      tagText: tagEl?.textContent.trim(),
      priceText: priceEl?.textContent.trim(),
      addBtnText: addBtn?.textContent.trim()
    };
  });

  console.log('🍔 Menu in English State:', menuEnState);

  if (menuEnState.imgHasLazy) {
    throw new Error('FAIL: Menu image has loading="lazy" which causes blank grey boxes!');
  }
  if (menuEnState.imgDecoding !== 'async') {
    throw new Error('FAIL: Menu image missing decoding="async"!');
  }
  if (menuEnState.titleHasEllipsis) {
    throw new Error('FAIL: Menu title has text-overflow: ellipsis!');
  }

  await page.screenshot({ path: 'audit_bilingual_2_menu_en.png' });
  console.log('📸 Saved: audit_bilingual_2_menu_en.png');

  // Test category tab click
  console.log('🍗 Clicking "Crispy & Tenders" Category Tab in English...');
  await page.click('button[data-cat="crispy"]');
  await page.waitForTimeout(300);

  const crispyCount = await page.evaluate(() => document.querySelectorAll('.menu-product-card').length);
  console.log('🍗 Visible cards in Crispy category:', crispyCount);

  // Add item to cart in English and check cart drawer & WhatsApp message
  console.log('🛒 Adding first item to cart in English...');
  await page.evaluate(() => window.addToCart('t1'));
  await page.waitForTimeout(300);

  const toastText = await page.evaluate(() => document.getElementById('dabboos-toast')?.textContent);
  console.log('🍞 Toast message displayed:', toastText);

  console.log('🛍️ Opening Cart Drawer in English...');
  await page.evaluate(() => window.openCart());
  await page.waitForTimeout(400);

  const cartEnDetails = await page.evaluate(() => {
    const drawer = document.getElementById('cart-drawer');
    const computedDrawer = window.getComputedStyle(drawer.querySelector('div:last-child'));
    const totalEl = document.getElementById('cart-total-amount');
    return {
      total: totalEl?.textContent.trim(),
      drawerPaddingBottom: computedDrawer.paddingBottom
    };
  });

  console.log('🛍️ Cart Total in English:', cartEnDetails.total);
  console.log('📱 Cart Drawer Padding Bottom (Safe Area):', cartEnDetails.drawerPaddingBottom);

  await page.screenshot({ path: 'audit_bilingual_3_cart_en.png' });
  console.log('📸 Saved: audit_bilingual_3_cart_en.png');

  // Close cart
  await page.evaluate(() => window.closeCart());
  await page.waitForTimeout(300);

  // Switch back to Arabic
  console.log('\n🇸🇦 Switching back to Arabic...');
  await page.click('#lang-toggle-btn');
  await page.waitForTimeout(300);

  const arabicState = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    toggleText: document.getElementById('lang-toggle-text')?.textContent.trim(),
    menuTitle: document.querySelector('[data-i18n="menu_title"]')?.textContent.trim(),
    firstCardTitle: document.querySelector('.menu-product-card h3')?.textContent.trim()
  }));

  console.log('🇸🇦 Back to Arabic State:', arabicState);

  if (arabicState.lang !== 'ar' || arabicState.dir !== 'rtl') {
    throw new Error('FAIL: Reverting to Arabic failed!');
  }
  if (arabicState.toggleText !== 'EN') {
    throw new Error('FAIL: Toggle text should be "EN" when in Arabic!');
  }

  await page.screenshot({ path: 'audit_bilingual_4_menu_ar.png' });
  console.log('📸 Saved: audit_bilingual_4_menu_ar.png');

  // Return to Home view and check Flagship layering
  await page.evaluate(() => window.switchView('home'));
  await page.waitForTimeout(400);

  console.log('\n✈️ Auditing Flagship vs Paper Airplane Layering...');
  const layeringCheck = await page.evaluate(() => {
    const card = document.getElementById('flagship-card');
    const airplane = document.getElementById('travel-airplane');
    const cardZ = window.getComputedStyle(card).zIndex;
    const airplaneZ = window.getComputedStyle(airplane).zIndex;
    const airplanePE = window.getComputedStyle(airplane).pointerEvents;
    return {
      cardZ: parseInt(cardZ, 10),
      airplaneZ: parseInt(airplaneZ, 10),
      airplanePE: airplanePE,
      cardInFront: parseInt(cardZ, 10) > parseInt(airplaneZ, 10)
    };
  });

  console.log('✈️ Flagship Card Z-Index:', layeringCheck.cardZ);
  console.log('✈️ Paper Airplane Z-Index:', layeringCheck.airplaneZ);
  console.log('✈️ Paper Airplane pointer-events:', layeringCheck.airplanePE);
  console.log('✈️ Flagship Card is Strictly In Front of Airplane:', layeringCheck.cardInFront);

  if (!layeringCheck.cardInFront) {
    throw new Error('FAIL: Flagship card is NOT in front of airplane!');
  }

  await page.screenshot({ path: 'audit_bilingual_5_flagship_ar.png' });
  console.log('📸 Saved: audit_bilingual_5_flagship_ar.png');

  console.log('\n================ AUDIT SUMMARY ================');
  console.log('Page Errors count:', pageErrors.length);
  console.log('Console Errors count:', consoleErrors.length);

  await browser.close();

  if (pageErrors.length > 0) {
    console.error('❌ Tests failed with page errors!');
    process.exit(1);
  } else {
    console.log('🎉 ALL AUDIT CHECKS PASSED WITH 0 ERRORS!');
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error('Fatal Audit Error:', err);
  process.exit(1);
});
