import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
import { vi } from 'vitest';
// jsdom has no media-query engine. Reading/navigation tests exercise static mode;
// real motion and preference changes are covered in Playwright.
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: query === '(prefers-reduced-motion: reduce)',
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {
    return true;
  },
}));
