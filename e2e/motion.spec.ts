import { expect, test } from '@playwright/test';

test('a direct project link survives enhancement and its layout change', async ({
  page,
}) => {
  await page.goto('/#project-chaossql', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
    'data-motion',
    'ready',
  );
  await expect(
    page.getByRole('heading', { name: 'Turn chaos into a test.' }),
  ).toBeInViewport();
  await expect(page.locator('html')).toHaveAttribute(
    'data-active-project',
    'chaossql',
  );
});

test('captures the focused approach, reading, and next-planet handoff', async ({
  page,
  browserName,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
    'data-motion',
    'ready',
  );
  for (const [label, local] of [
    ['approach', 0.37],
    ['reading', 0.74],
    ['handoff', 0.95],
  ] as const) {
    await page.locator('#project-workshop-api').evaluate((node, local) => {
      const start =
        node.getBoundingClientRect().top + scrollY - innerHeight * 0.65;
      const end =
        node.nextElementSibling!.getBoundingClientRect().top +
        scrollY -
        innerHeight * 0.65;
      window.scrollTo(0, start + (end - start) * local);
    }, local);
    await expect
      .poll(() =>
        page
          .locator('#project-workshop-api')
          .evaluate((node) =>
            parseFloat(
              (node as HTMLElement).style.getPropertyValue(
                '--project-progress',
              ),
            ),
          ),
      )
      .toBeCloseTo(local, 2);
    await page.screenshot({
      path: `reports/cinematic-${label}-${browserName}.png`,
    });
  }
});

test('scroll moves one persistent planetary scene and reveals each product', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
    'data-motion',
    'ready',
  );
  const canvas = page.locator('[data-orbit-canvas] canvas');
  await expect(canvas).toHaveCount(1);
  await canvas.evaluate((node) => {
    node.setAttribute('data-original-canvas', 'true');
  });
  const first = page.locator('[data-project-cycle]').first();
  const before = await first
    .locator('[data-artifact-reveal]')
    .evaluate((node) => getComputedStyle(node).transform);
  await expect(page.locator('[data-orbit-fallback]')).toHaveCSS('opacity', '0');
  await page.screenshot({ path: 'reports/motion-opening-desktop.png' });
  for (const id of [
    'reconcileflow',
    'aeternis-log',
    'workshop-api',
    'chaossql',
  ]) {
    await page.locator(`[data-project-id="${id}"]`).evaluate((node) => {
      const next = node.nextElementSibling;
      const start =
        node.getBoundingClientRect().top + scrollY - innerHeight * 0.65;
      const end =
        (next?.getBoundingClientRect().top ??
          node.getBoundingClientRect().bottom) +
        scrollY -
        innerHeight * 0.65;
      window.scrollTo(0, start + (end - start) * 0.62);
    });
    await expect(page.locator('html')).toHaveAttribute(
      'data-active-project',
      id,
    );
    await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
      'data-story-phase',
      'artifact',
    );
    await expect(canvas).toHaveAttribute('data-original-canvas', 'true');
  }
  const after = await first
    .locator('[data-artifact-reveal]')
    .evaluate((node) => getComputedStyle(node).transform);
  expect(after).not.toBe(before);
  await page.screenshot({ path: 'reports/motion-chaossql-desktop.png' });
  expect(errors).toEqual([]);
});

test('reduced motion never loads a canvas and preserves every project', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
    'data-motion',
    'static',
  );
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('[data-project-cycle]')).toHaveCount(4);
  await expect(
    page.getByRole('link', { name: 'View ChaosSQL on GitHub' }),
  ).toBeVisible();
});
