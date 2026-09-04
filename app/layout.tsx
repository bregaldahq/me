import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import {
  SITE_URL,
  SITE_TITLE,
  SITE_DESCRIPTION,
  STRUCTURED_DATA,
} from './portfolio/seo';
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});
export const metadata = {
  metadataBase: SITE_URL,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  icons: { icon: '/brand/icone_bregalda.svg' },
  robots: { index: true, follow: true },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL.href,
    siteName: 'Bregalda',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: new URL('/og.png', SITE_URL).href,
        width: 1200,
        height: 630,
        alt: 'Bregalda — Thoughtful tools for real technical problems',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [new URL('/og.png', SITE_URL).href],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        {children}
        {STRUCTURED_DATA.map((entry) => (
          <script
            key={entry['@type']}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(entry).replace(/</g, '\\u003c'),
            }}
          />
        ))}
      </body>
    </html>
  );
}
