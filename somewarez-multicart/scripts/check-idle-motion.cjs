/**
 * Browser check for idle margin escapes.
 * Usage: node scripts/check-idle-motion.cjs --modules <node_modules> [--screenshots <dir>]
 * Requires Playwright and installed Microsoft Edge; serves the project via the root server.
 */
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const option = name => process.argv[process.argv.indexOf(name) + 1];
const modules = process.argv.includes('--modules') ? option('--modules') : null;
const {chromium} = require(modules ? path.join(modules, 'playwright') : 'playwright');
const shots = process.argv.includes('--screenshots') ? option('--screenshots') : null;
if (shots) fs.mkdirSync(shots, {recursive: true});
(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 1000}, reducedMotion: 'no-preference'});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:8000/xyhtamura.github.io/somewarez-multicart/');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => document.body.classList.contains('idle'), {timeout: 12000});
    assert.equal(await page.locator('.margin-escape').count(), 1);
    assert.equal(await page.locator('.margin-escapes').getAttribute('aria-hidden'), 'true');
    // Seek actual browser animations through the route, checking their margin positions.
    for (const random of [.05, .45, .9]) {
      const route = await page.evaluate(random => {
        marginEscapes.stop();
        const previousRandom = Math.random;
        Math.random = () => random;
        marginEscapes.start();
        Math.random = previousRandom;
        const fragment = document.querySelector('.margin-escape');
        const animation = fragment.getAnimations()[0];
        animation.pause();
        const positions = [];
        const main = document.querySelector('main').getBoundingClientRect();
        for (const fraction of [.3, .52, .86]) {
          animation.currentTime = animation.effect.getTiming().duration * fraction;
          const box = fragment.getBoundingClientRect();
          const under = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
          positions.push({
            inMargin: box.right <= main.left + 1 || box.left >= main.right - 1,
            intercepts: !!under?.closest('.margin-escapes')
          });
        }
        return positions;
      }, random);
      assert(route.every(p => p.inMargin && !p.intercepts), 'Route must stay in the margin without taking input');
    }
    if (shots) await page.screenshot({path: path.join(shots, 'idle-desktop.png')});
    await page.mouse.move(400, 300);
    assert.equal(await page.locator('.margin-escape').count(), 0, 'Activity clears escapes');
    await page.locator('#motion').click();
    await page.waitForTimeout(6300);
    assert.equal(await page.locator('body.idle').count(), 0, 'Paused page stays still');
    await page.locator('#motion').click();
    await page.waitForFunction(() => document.querySelector('.margin-escape'), {timeout: 12000});
    await page.locator('[data-about="artist"]').click();
    await page.waitForTimeout(6300);
    assert.equal(await page.locator('.margin-escape').count(), 0, 'Dialog suppresses escapes');
    await page.keyboard.press('Escape');
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.waitForTimeout(6300);
    assert.equal(await page.locator('body.idle').count(), 0);
    assert.equal(await page.locator('.margin-escape').count(), 0);
    assert.equal(await page.locator('#motion').isVisible(), false);
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await page.setViewportSize({width: 375, height: 812});
    await page.locator('.sulat .art').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.margin-escape'), {timeout: 12000});
    const narrow = await page.evaluate(() => {
      const fragment = document.querySelector('.margin-escape');
      const animation = fragment.getAnimations()[0];
      animation.pause();
      animation.currentTime = animation.effect.getTiming().duration * .52;
      const r = fragment.getBoundingClientRect();
      const main = document.querySelector('main').getBoundingClientRect();
      return {
        noOverflow: document.documentElement.scrollWidth === innerWidth,
        inMargin: r.right <= main.left + 1 || r.left >= main.right - 1,
        width: parseFloat(getComputedStyle(fragment).width)
      };
    });
    assert(narrow.noOverflow && narrow.inMargin && narrow.width <= 12, 'Mobile escape fits the gutter');
    if (shots) await page.screenshot({path: path.join(shots, 'idle-mobile.png')});
    await page.setViewportSize({width: 390, height: 844});
    await page.waitForFunction(() => !document.querySelector('.margin-escape'), null, {timeout: 2000});
    assert.equal(await page.locator('.margin-escape').count(), 0, 'Resize clears old paths');
    assert.deepEqual(errors, [], 'No browser script errors');
    console.log('PASS: desktop routes, pointer transparency, activity, pause/resume, dialog, reduced motion, mobile margins, and resize.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });