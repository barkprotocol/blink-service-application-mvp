import React from 'react';
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Syne, Poppins } from "next/font/google";
import { ToastProvider } from '@/components/ui/toast';
import { ThemeProvider } from 'next-themes';
import { WalletProvider } from '@/components/ui/wallet-provider';
import { InfoBar } from '@/components/ui/layout/info-bar';
import "./styles/globals.css";
import './styles/fonts.css'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
});

const poppins = Poppins({
  weight: ['300', '400', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "BARK BLINKS",
  description: "Solana Actions & Blinks dApp",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${syne.variable} ${poppins.variable} antialiased font-sans bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="flex flex-col min-h-screen">
            <WalletProvider>
              <ToastProvider>
                <InfoBar />
                <main className="flex-grow">{children}</main>
                <footer className="text-center py-4 bg-white text-sm text-gray-500 dark:text-gray-400">
                  &copy; {new Date().getFullYear()} BARK Protocol. All rights reserved.
                </footer>
              </ToastProvider>
            </WalletProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}