import { SITE_URL } from './portfolio/seo';
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', SITE_URL).href,
  };
}
