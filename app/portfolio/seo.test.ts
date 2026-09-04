import { describe, expect, it } from 'vitest';
import { STRUCTURED_DATA, SITE_URL, LINKEDIN_URL } from './seo';

describe('public identity', () => {
  it('emits linked studio and founder records on the canonical origin', () => {
    expect(SITE_URL.href).toBe('https://bregalda.com/');
    expect(STRUCTURED_DATA.map((entry) => entry['@type'])).toEqual([
      'Organization',
      'Person',
    ]);
    expect(STRUCTURED_DATA[0].founder?.name).toBe('Ricardo Bregalda');
    expect(STRUCTURED_DATA[1].sameAs).toContain(LINKEDIN_URL);
    expect(JSON.stringify(STRUCTURED_DATA)).not.toMatch(
      /inc\.|llc|ltda|corporation/i,
    );
  });
});
