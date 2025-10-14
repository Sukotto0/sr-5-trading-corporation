'use client'
import { type Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import NavbarLoggedIn from "@/components/navbarloggedin";
import NavbarDefault from "@/components/navbardefault";
import { usePathname } from "next/navigation";

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
    <ClerkProvider>
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
          <div className="grow w-full">{children}</div>
          {/* Footer */}
          {!pathname.startsWith("/admin") && <Footer />}
        </body>
      </html>
    </ClerkProvider>
  );
}
