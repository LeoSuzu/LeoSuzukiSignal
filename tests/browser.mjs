// Run with PLAYWRIGHT_MODULE pointing to an installed playwright/index.mjs.
// Start `npm run preview` first. This optional check adds no runtime dependency.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
const url = process.env.PREVIEW_URL || 'http://localhost:4173';
await mkdir('test-results', { recursive: true });
try {
  await page.goto(url);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.screenshot({ path: 'test-results/desktop.png' });
  const sections = await page.locator('main [data-label]').evaluateAll(nodes => nodes.map(n => ({ id: n.id, label: n.dataset.label, message: n.dataset.message })));
  const shapes = new Set();
  for (const section of sections) {
    await page.locator(`.section-nav a[href="#${section.id}"]`).click();
    await page.waitForFunction(expected => document.getElementById('terminal-message').textContent === expected, section.message);
    assert.equal(await page.locator('.section-nav [aria-current]').getAttribute('href'), `#${section.id}`);
    assert.equal(await page.locator('#terminal-command').textContent(), `> reading / ${section.label}`);
    shapes.add(await page.locator('#instrument-path').getAttribute('d'));
    const rail = await page.locator('.terminal').boundingBox();
    assert.ok(rail.y >= 0 && rail.y + rail.height <= 1000, 'Companion stays in viewport');
  }
  assert.equal(shapes.size, 7);
  await page.locator('.section-nav a[href="#projects"]').click();
  for (const summary of await page.locator('details summary').all()) {
    await summary.focus();
    await page.keyboard.press('Enter');
    assert.equal(await summary.evaluate(n => n.parentElement.open), true);
    await page.keyboard.press('Enter');
    assert.equal(await summary.evaluate(n => n.parentElement.open), false);
  }
  const range = await page.request.get(`${url}/assets/project_samples/PatientMonitor/PatientMonitorComp.mp4`, { headers: { Range: 'bytes=0-127' } });
  assert.equal(range.status(), 206);
  assert.equal((await range.body()).length, 128);
  assert.equal((await page.request.get(`${url}/assets/CV/CV_LeoSuzu.pdf`)).status(), 200);
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(url);
    await page.waitForFunction(() => document.getElementById('terminal-command').textContent.includes('introduction'));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No horizontal overflow at ${width}`);
    if (width <= 980) {
      await page.locator('#close-terminal').click();
      assert.equal(await page.locator('#terminal').isVisible(), false);
      await page.locator('#open-terminal').click();
      assert.equal(await page.locator('#terminal').isVisible(), true);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'close-terminal');
      await page.locator('.section-nav a[href="#education"]').click();
      await page.waitForFunction(() => document.getElementById('terminal-command').textContent.includes('education'));
      assert.equal(await page.locator('.scanner').isVisible(), false);
    }
    if (width === 390) {
      await page.goto(url);
      await page.screenshot({ path: 'test-results/mobile.png' });
    }
  }
  const plain = await browser.newPage({ javaScriptEnabled: false });
  await plain.goto(url);
  await plain.locator('details summary').first().click();
  assert.equal(await plain.locator('details[open]').count(), 1);
  await plain.close();
  assert.deepEqual(errors, []);
  console.log('Browser checks passed: 7 contextual notes and graphics, sticky panel, 8 keyboard disclosures, 4 responsive widths, mobile close/reopen, reduced motion, no-JS disclosure, CV and video ranges.');
} finally { await browser.close(); }
