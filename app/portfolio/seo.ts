export const SITE_URL = new URL('https://bregalda.com');
export const SITE_TITLE =
  'Bregalda — Thoughtful tools for real technical problems';
export const SITE_DESCRIPTION =
  'Bregalda is Ricardo Bregalda’s independent software studio, building auditable data systems, developer tools, APIs, and production-ready software.';
export const LINKEDIN_URL =
  'https://www.linkedin.com/in/ricardomeneguzzibregalda';
export const GITHUB_ORG_URL = 'https://github.com/bregaldahq';
export const STRUCTURED_DATA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bregalda',
    url: SITE_URL.href,
    logo: new URL('/brand/bregalda_primary_lockup.svg', SITE_URL).href,
    founder: { '@type': 'Person', name: 'Ricardo Bregalda' },
    sameAs: [GITHUB_ORG_URL, LINKEDIN_URL],
    description: SITE_DESCRIPTION,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ricardo Bregalda',
    url: SITE_URL.href,
    worksFor: { '@type': 'Organization', name: 'Bregalda' },
    sameAs: [GITHUB_ORG_URL, LINKEDIN_URL],
    knowsAbout: [
      'Backend development',
      'Software architecture',
      'APIs',
      'Data systems',
      'Testing',
      'Distributed systems',
    ],
  },
] as const;
