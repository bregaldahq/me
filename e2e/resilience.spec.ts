import { expect, test } from '@playwright/test';

test('renderer allocation failure after a successful probe uses the static fallback', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (this.isConnected && String(args[0]).startsWith('webgl')) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  let loaded = false;
  page.on('response', (response) => {
    if (/\/orbit-scene-[^/]+\.js/.test(response.url())) loaded = true;
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect.poll(() => loaded).toBe(true);
  await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
    'data-motion',
    'static',
  );
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('the opening waits on its own background while the choreography downloads', async ({
  page,
}) => {
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let blocked = false;
  await page.route(/\/ScrollTrigger-[^/]+\.js/, async (route) => {
    blocked = true;
    await gate;
    await route.continue();
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => blocked).toBe(true);
    await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
      'data-motion',
      'loading',
    );
    // The hero waits on its own background: there is no stand-in picture left
    // to swap out, and the copy stays readable throughout.
    await expect(page.locator('#work-title')).toBeVisible();
    await expect(page.locator('[data-orbit-fallback]')).toHaveCount(0);
  } finally {
    release();
  }
  await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
    'data-motion',
    'ready',
  );
});

for (const chunk of ['orbit-scene', 'ScrollTrigger']) {
  test(`a failed ${chunk} download falls back to the readable static page`, async ({
    page,
  }) => {
    let blocked = 0;
    await page.route(new RegExp(`/${chunk}-[^/]+\\.js`), async (route) => {
      blocked++;
      await route.abort();
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => blocked).toBeGreaterThan(0);
    await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
      'data-motion',
      'static',
    );
    await expect(page.locator('canvas')).toHaveCount(0);
    // Without the scene the hero is typographic; the reading below it is what
    // has to survive, and it does.
    await expect(page.locator('#work-title')).toBeVisible();
    await expect(page.locator('[data-artifact-reveal]').first()).toHaveCSS(
      'opacity',
      '1',
    );
  });
}

for (const mode of ['save-data', 'no-webgl'] as const) {
  test(`${mode} keeps every piece of content without a renderer`, async ({
    page,
  }) => {
    await page.addInitScript((mode) => {
      if (mode === 'save-data')
        Object.defineProperty(navigator, 'connection', {
          value: {
            saveData: true,
            addEventListener() {},
            removeEventListener() {},
          },
          configurable: true,
        });
      else {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          this: HTMLCanvasElement,
          ...args: Parameters<typeof original>
        ) {
          if (String(args[0]).startsWith('webgl')) return null;
          return original.apply(this, args);
        } as typeof original;
      }
    }, mode);
    const sceneRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/orbit-scene.tsx'))
        sceneRequests.push(request.url());
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
      'data-motion',
      'static',
    );
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.locator('#work-title')).toBeVisible();
    await expect(page.locator('article')).toHaveCount(4);
    expect(sceneRequests).toEqual([]);
  });
}

test('context loss falls back once and does not recreate the renderer', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
    'data-motion',
    'ready',
  );
  await page.locator('canvas').evaluate((canvas) => {
    const gl = (canvas as HTMLCanvasElement).getContext('webgl2');
    if (!gl?.getExtension('WEBGL_lose_context'))
      throw new Error('Test browser cannot simulate context loss');
    gl.getExtension('WEBGL_lose_context')!.loseContext();
  });
  await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
    'data-motion',
    'static',
  );
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('link', { name: '04 ChaosSQL' }).click();
  await expect(
    page.getByRole('heading', { name: 'Turn chaos into a test.' }),
  ).toBeInViewport();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('[data-artifact-reveal]').last()).toHaveCSS(
    'opacity',
    '1',
  );
});

test('changing motion preference restores a fully readable static page', async ({
  page,
}) => {
  await page.goto('/#project-aeternis-log', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
    'data-motion',
    'ready',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-orbit-story]')).toHaveAttribute(
    'data-motion',
    'static',
  );
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('[data-artifact-reveal]').first()).toHaveCSS(
    'transform',
    'none',
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('the continuous scene stays active through contact and on return', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('canvas')).toHaveAttribute('data-active', 'true');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('canvas')).toHaveAttribute('data-active', 'true');
  await page.locator('#work').scrollIntoViewIfNeeded();
  await expect(page.locator('canvas')).toHaveAttribute('data-active', 'true');
});

test('without JavaScript the original content and project links remain', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('article')).toHaveCount(4);
  await expect(
    page.getByRole('link', { name: 'View ChaosSQL on GitHub' }),
  ).toHaveAttribute('href', 'https://github.com/bregaldahq/chaossql');
  await expect(
    page.getByRole('heading', { name: 'Let’s build something thoughtful.' }),
  ).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await context.close();
});
