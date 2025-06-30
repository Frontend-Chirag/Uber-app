import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/shared/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/nav-bar";
import Script from "next/script";

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
          <Header />
          <main role="main" className="flex-grow">
            <div className="max-w-screen-2xl mx-auto px-4 relative">
              <QueryProvider>
                {children}
                <Toaster />
              </QueryProvider>
            </div>
          </main>
          <Footer />
        </div>
          <Script
        src="https://fpjscdn.net/v3/eij6ssbKbQpoJ9r1Y7ic"
        strategy="beforeInteractive"
        async
      />
      <Script id="load-fingerprint" strategy="afterInteractive">
        {`
          window.addEventListener('DOMContentLoaded', async () => {
            if (window.FingerprintJS) {
              const fp = await window.FingerprintJS.load();
              const result = await fp.get();
              console.log('Visitor ID:', result.visitorId);
              // Optionally send to your backend here:
              // fetch('/api/save-fingerprint', {
              //   method: 'POST',
              //   headers: { 'Content-Type': 'application/json' },
              //   body: JSON.stringify({ fingerprint: result.visitorId }),
              // });
            }
          });
        `}
      </Script>
      </body>
    </html>
  );
}
