import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/shared/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/nav-bar";
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const metadata: Metadata = {
  title: {
    default: 'Ride with uber & Request a ride 24/7',
    template: "%s",
    absolute: ''
  },
  description: 'A modern ride-sharing application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` antialiased`}
      >
        <div className="w-full flex flex-col gap-y-8 relative min-h-screen">
          <QueryProvider>
            <Header />
            <main role="main" className="flex-grow">
              <div className="max-w-screen-2xl mx-auto px-4 relative">
                {children}
                <Toaster />
              </div>
            </main>
            <Footer />
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
