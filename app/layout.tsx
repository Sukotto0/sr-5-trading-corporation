import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import NavbarDefault from '@/components/navbardefault'
import Footer from '@/components/footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SR-5 Trading Corporation',
  description: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
          <SignedOut>
            {/* Navbar */}
            <NavbarDefault />

            {/* Main Content */}
            <div className='grow w-full'>{children}</div>
            {/* Footer */}
            <Footer />
          </SignedOut>
          <SignedIn>
            {/* Navbar */}
            <NavbarDefault />

            {/* Main Content */}
            <div className='grow w-full'>{children}</div>
            {/* Footer */}
            <Footer />
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  )
}