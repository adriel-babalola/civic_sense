import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "../components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicSense User Dashboard",
  description: "Monitor events and fact-check politicians",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 flex justify-center`}>
        <div className="w-full bg-white min-h-screen relative pb-20 shadow-lg overflow-hidden">
          <header className="flex justify-between items-center px-6 py-4 bg-white sticky top-0 z-50 border-b border-gray-100">
            <a href="/" className="flex items-center gap-2 hover:bg-gray-100 transition-colors p-2 -ml-2 rounded-lg" title="Home (Trending News)">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <div className="font-bold text-lg flex items-center gap-2 text-black">
                <div className="w-8 h-8 rounded-full bg-blue-600"></div>
                CivicSense
              </div>
            </a>
          </header>
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
