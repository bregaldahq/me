import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`one continuous planetary journey through the full portfolio at ${width}px`, async ({
    page,
    browserName,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const story = page.locator('[data-orbit-story]');
    await expect(story).toHaveAttribute('data-motion', 'ready');
    await expect(page.locator('[data-orbit-canvas]')).toHaveCSS('opacity', '1');
    await page
      .locator('canvas')
      .evaluate((node) => node.setAttribute('data-persistent', 'true'));
    await page.screenshot({
      path: `reports/journey-opening-${width}-${browserName}.png`,
    });
    for (const [id, phase] of [
      ['project-reconcileflow', 'reconcileflow'],
      ['project-aeternis-log', 'aeternis-log'],
      ['project-workshop-api', 'workshop-api'],
      ['project-chaossql', 'chaossql'],
      ['studio', 'studio'],
    ] as const) {
      await page.locator(`#${id}`).evaluate((node) =>
        window.scrollTo({
          top: node.getBoundingClientRect().top + scrollY - 76,
          behavior: 'instant',
        }),
      );
      await expect(story).toHaveAttribute('data-journey-chapter', phase);
      await expect(page.locator('canvas')).toHaveAttribute(
        'data-persistent',
        'true',
      );
      await page.waitForTimeout(700);
      await page.screenshot({
        path: `reports/journey-${phase}-${width}-${browserName}.png`,
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.evaluate(() =>
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'instant',
      }),
    );
    await expect(story).toHaveAttribute('data-journey-chapter', 'contact');
    await page.screenshot({
      path: `reports/journey-destination-${width}-${browserName}.png`,
    });
    await page.locator('#project-aeternis-log').evaluate((node) =>
      window.scrollTo({
        top: node.getBoundingClientRect().top + scrollY - 76,
        behavior: 'instant',
      }),
    );
    await expect(story).toHaveAttribute('data-journey-chapter', 'aeternis-log');
    await expect(page.locator('canvas')).toHaveAttribute(
      'data-persistent',
      'true',
    );
    expect(errors).toEqual([]);
  });
}
