import { describe, expect, it } from 'vitest';
import { PROJECTS } from './project-data';

describe('project destinations', () => {
  it('pairs the four stories with distinct repository and artifact destinations', () => {
    expect(PROJECTS.map((p) => [p.id, p.repository, p.artifact])).toEqual([
      [
        'reconcileflow',
        'https://github.com/bregaldahq/reconcileflow',
        'reconciliation',
      ],
      [
        'aeternis-log',
        'https://github.com/bregaldahq/aeternis-log',
        'merkle-proof',
      ],
      [
        'workshop-api',
        'https://github.com/bregaldahq/oficina-mecanica-tech-challenge',
        'service-order',
      ],
      [
        'chaossql',
        'https://github.com/bregaldahq/chaossql',
        'concurrency-trace',
      ],
    ]);
    expect(new Set(PROJECTS.map((p) => p.id)).size).toBe(4);
  });
});
