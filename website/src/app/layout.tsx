import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site-config";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "CivicSense",
    "fact-check Nigeria",
    "WhatsApp fact-check bot",
    "Nigerian misinformation",
    "verify claims",
    "civic knowledge base",
  ],
  metadataBase: new URL("https://civicsense.app"),
  openGraph: {
    type: "website",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(inter.className, "antialiased")}
        suppressHydrationWarning
      >
        <main className="flex min-h-screen flex-col">{children}</main>
      </body>
    </html>
  );
}
