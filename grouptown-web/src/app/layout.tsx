import type { Metadata } from 'next';
import { Arimo } from 'next/font/google';

import { Providers } from '@/components/providers';

import './globals.css';

const arimo = Arimo({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-arimo',
});

export const metadata: Metadata = {
  title: 'GroupTown | Collective Ownership & Property Programs',
  description: 'Collective ownership and property programmes for the Grouptown platform.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
          rel="stylesheet"
        />
      </head>
      <body className={arimo.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
