import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PortfolioPage } from './portfolio-page';

describe('portfolio reading and navigation', () => {
  it('renders every project in order with its own GitHub destination', () => {
    render(<PortfolioPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /thoughtful tools/i }),
    ).toBeVisible();
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(4);
    expect(
      articles.map(
        (a) => within(a).getByRole('heading', { level: 2 }).textContent,
      ),
    ).toEqual([
      'Logic you can inspect.',
      'Proof that outlives the data.',
      'A business, modeled end to end.',
      'Turn chaos into a test.',
    ]);
    for (const article of articles) {
      expect(
        within(article).getByRole('link', { name: /view .* on github/i }),
      ).toHaveAttribute('target', '_blank');
    }
  });

  it('preserves deep links and the three primary contact opportunities', () => {
    const { container } = render(<PortfolioPage />);
    const destinations = [
      ...container.querySelectorAll('[data-orbit-project]'),
    ];
    expect(destinations).toHaveLength(4);
    for (const link of destinations) {
      expect(
        container.querySelector(link.getAttribute('href')!),
      ).not.toBeNull();
    }
    const links = screen.getAllByRole('link', { name: 'Connect on LinkedIn' });
    expect(links).toHaveLength(3);
    for (const link of links) {
      expect(link).toHaveAttribute(
        'href',
        'https://www.linkedin.com/in/ricardomeneguzzibregalda',
      );
    }
    expect(container.querySelector('#studio')).not.toBeNull();
    expect(container.querySelector('#contact')).not.toBeNull();
  });
});
