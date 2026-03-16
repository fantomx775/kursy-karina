import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { MainTopSpacer } from "@/components/MainTopSpacer";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kursy Karina Koziara",
  description: "Profesjonalne kursy stylizacji brwi od Kariny Koziara",
  icons: {
    apple: "/logo/sygnet-header.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className={`${montserrat.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider>
            <Providers>
              <AppHeader />
              <main>
                <MainTopSpacer>{children}</MainTopSpacer>
              </main>
              <AppFooter />
            </Providers>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
