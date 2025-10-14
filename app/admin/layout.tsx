'use client'
import { type Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/footer";
import NavbarLoggedIn from "@/components/navbarloggedin";
import NavbarDefault from "@/components/navbardefault";
import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";

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
    <div className="min-h-screen bg-gray-100">
            <Sidebar />

            <div className="ml-64 p-8">
                {children}
            </div>
        </div>
  );
}
