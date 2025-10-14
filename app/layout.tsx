"use client";
import { type Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import NavbarLoggedIn from "@/components/navbarloggedin";
import NavbarDefault from "@/components/navbardefault";
import { usePathname } from "next/navigation";
import QueryProviders from "@/components/providers/QueryProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <ClerkProvider
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        >
          {/* Navbar */}
          <div className="z-50">
            <SignedOut>
              {!pathname.startsWith("/admin") && <NavbarDefault />}
            </SignedOut>
            <SignedIn>
              {!pathname.startsWith("/admin") && <NavbarLoggedIn />}
            </SignedIn>
          </div>
          {/* Main Content */}
          <QueryProviders>
            <div className="grow w-full">{children}</div>
          </QueryProviders>
          {/* Footer */}
          {!pathname.startsWith("/admin") && <Footer />}
        </body>
      </html>
    </ClerkProvider>
  );
}
