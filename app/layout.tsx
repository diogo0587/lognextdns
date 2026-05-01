import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientTracker from '@/components/ClientTracker';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  variable: '--font-inter',
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
      <body className={inter.variable}>
        <ClientTracker />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
