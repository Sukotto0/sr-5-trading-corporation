import { ClerkProvider, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import QueryProviders from "@/components/providers/QueryProviders";
import Navigation from "@/components/navbar";
import { type Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SR-5 Trading Corporation",
  description:
    "This website is still under development. Stay tuned for updates!",
};

// description: "Empowering growth, innovation, and collaboration across all fields. Innovation That Inspires. We push boundaries and deliver outstanding experiences.",
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

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
            <Navigation />
          </div>
          {/* Main Content */}
          <QueryProviders>
            <div className="grow w-full">{children}</div>
          </QueryProviders>
          {/* Footer */}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
