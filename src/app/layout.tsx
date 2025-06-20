import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/shared/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/shared/theme-provider";

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
        {/* <ThemeProvider
          attribute={'class'}
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
