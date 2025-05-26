import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '404s - Create Custom 404 Pages with AI',
  description: 'Generate beautiful, custom 404 pages using AI. Get both HTML and Next.js component versions instantly.',
  keywords: ['404 pages', 'custom error pages', 'AI generator', 'Next.js', 'web development'],
  authors: [{ name: '404s Team' }],
  openGraph: {
    title: '404s - AI-Powered 404 Page Generator',
    description: 'Create unique, custom 404 pages in seconds with our AI generator',
    url: 'https://ai404s.netlify.app/',
    siteName: '404s',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '404s - AI-Powered 404 Page Generator',
    description: 'Create unique, custom 404 pages in seconds with our AI generator',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}