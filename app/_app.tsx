import React from 'react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { Header } from '@/components/ui/layout/header'
import { Footer } from '@/components/ui/layout/footer'
import { Toaster } from '@/components/ui/toaster'

import '@/styles/globals.css'

const queryClient = new QueryClient()

function BarkBlinkApp({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <Head>
        <title>BARK | BLINK</title>
        <meta name="description" content="Transform your digital experience with BARK Protocol" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SessionProvider session={pageProps.session}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <Header />
              <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Component {...pageProps} />
              </main>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </React.Fragment>
  )
}

export default BarkBlinkApp