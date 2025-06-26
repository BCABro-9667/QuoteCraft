'use client';

import { AuthProvider } from '@/context/auth-context';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 bg-background p-4 md:p-6 lg:p-8">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </AuthProvider>
  );
}
