import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sizes = [
  [320, 568],
  [360, 800],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
  [2560, 1440],
];

test('a high-density phone renders above 1x and stays inside the pixel budget', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
  await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
    'data-motion',
    'ready',
  );
  const buffer = () =>
    page.locator('canvas').evaluate((node) => {
      const canvas = node as HTMLCanvasElement;
      const box = canvas.getBoundingClientRect();
      return {
        pixels: canvas.width * canvas.height,
        ratio: canvas.width / box.width,
      };
    });
  for (const size of [
    { width: 844, height: 390 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size);
    await expect.poll(async () => (await buffer()).ratio).toBeGreaterThan(1.05);
    // PIXEL_BUDGETS.low, which the phone is nowhere near spending on area alone.
    expect((await buffer()).pixels).toBeLessThanOrEqual(1_500_000);
  }
  await context.close();
});

for (const [width, height] of sizes) {
  test(`animated page fits ${width}x${height}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
      'data-motion',
      'ready',
    );
    for (const label of await page.locator('[data-orbit-project]').all())
      await expect(label).toBeInViewport();
    await page.screenshot({ path: `reports/opening-${width}.png` });
    for (const id of [
      'work',
      'project-reconcileflow',
      'project-aeternis-log',
      'project-workshop-api',
      'project-chaossql',
      'studio',
      'contact',
    ]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test('mobile rotation keeps one canvas and allows native touch scrolling', async ({
  browser,
  baseURL,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Touch dispatch uses the Chromium DevTools protocol; other engines exercise viewport resizing separately.',
  );
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
    'data-motion',
    'ready',
  );
  await page
    .locator('canvas')
    .evaluate((node) => node.setAttribute('data-original', 'true'));
  await page.locator('#project-aeternis-log').scrollIntoViewIfNeeded();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('canvas')).toHaveAttribute('data-original', 'true');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .locator('[data-project-artifact="merkle-proof"]')
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'reports/motion-mobile-artifact.png' });
  const initial = await page.evaluate(() => scrollY);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 195, y: 600 }],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: 195, y: 250 }],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(initial + 100);
  await context.close();
});

for (const width of [390, 1440]) {
  test(`accessible reading mode at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const result = await new AxeBuilder({ page }).analyze();
    expect(
      result.violations.map(({ id, nodes }) => ({
        id,
        elements: nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      })),
    ).toEqual([]);
    await expect(page.locator('h1')).toHaveCount(1);
  });
}
