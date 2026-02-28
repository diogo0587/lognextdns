import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ClientTracker from '@/components/ClientTracker';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LogNextDNS',
  description: 'Network monitoring with Kubiks observability',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.OTEL_SERVICE_NAME = 'lognextdns';
              window.KUBIKS_ENDPOINT = '/api/logs';
            `,
          }}
        />
      </head>
      <body className={`${geist.variable} ${geistMono.variable}`}>
        <ClientTracker />
        {children}
      </body>
    </html>
  );
}
