import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Bodima.lk | Kandy Student, Campus & Professional Boarding Finder (මහනුවර බෝඩිම්)',
  description:
    'Discover verified boarding rooms (bodim) and annexes across Kandy for School & A/L Tuition students, University of Peradeniya (UoP) undergraduates, Kandy National Hospital staff, and working professionals. Transparent utilities, zero broker fees, gate-specific walking distances.',
  keywords: [
    'Bodima Kandy',
    'Kandy boarding rooms',
    'Peradeniya campus bodim',
    'William Gopallawa tuition boarding',
    'Kandy national hospital annex',
    'UoP student boarding rooms',
    'Katugastota boarding',
    'Kundasale Pallekele annex',
    'Student housing Kandy Sri Lanka',
  ],
  authors: [{ name: 'Bodima Kandy Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-white transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
