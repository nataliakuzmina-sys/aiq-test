import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AIQ — индекс ИИ-зоркости',
  description:
    'Отличите контент, созданный ИИ и человеком? Пройдите тест, получите балл AIQ и диплом для соцсетей',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={montserrat.variable}>
      <body className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
        <SiteHeader />
        <div className="flex flex-col">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
