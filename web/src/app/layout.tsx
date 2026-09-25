import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://listify.web'),
  alternates: {
    canonical: '/'
  },
  title: 'Listify Web - Kayıt Olmadan, Anında Liste Oluştur ve Paylaş',
  description: 'Üyeliksiz, local-first çalışan, 48 saatlik canlı eşitleme ve akıllı kategorizasyon sunan modern alışveriş ve yapılacaklar listesi uygulaması.',
  keywords: ['alışveriş listesi', 'yapılacaklar listesi', 'to-do list', 'local-first', 'no-auth', 'pwa', 'akıllı market listesi', 'canlı senkronizasyon'],
  authors: [{ name: 'Listify Web' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Listify'
  },
  openGraph: {
    title: 'Listify Web - Kayıt Olmadan, Anında Liste Oluştur ve Paylaş',
    description: 'Üyeliksiz, local-first çalışan, 48 saatlik canlı eşitleme ve akıllı kategorizasyon sunan modern alışveriş ve yapılacaklar listesi.',
    url: 'https://listify.web',
    siteName: 'Listify Web',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Listify Web - Kayıt Olmadan, Anında Liste Oluştur ve Paylaş'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Listify Web - Üyeliksiz & Local-First Liste Uygulaması',
    description: 'Şifresiz, anında liste oluşturun ve tek linkle market arkadaşınızla canlı senkronize edin.',
    images: ['/og-image.jpg']
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/manifest.json'
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#071018' },
    { media: '(prefers-color-scheme: light)', color: '#f6faf9' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" data-theme="dark">
      <body>
        <Header />
        <main className="container">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
