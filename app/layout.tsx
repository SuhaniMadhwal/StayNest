import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';

export const metadata: Metadata = {
  title: 'StayNest | Holiday Homes & Apartment Rentals in India',
  description: 'Book unique villas, mountain cabins, beachfront stays, and heritage havelis across India with StayNest.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-900">
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
