import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const siteUrl = "https://tmoyelowo.com";

export const metadata: Metadata = {
  title: {
    default: "TMOyelowo — Words & Stories",
    template: "%s | TMOyelowo",
  },
  description:
    "A creative writing space by TMOyelowo. Articles, poems, stories, and essays.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "TMOyelowo",
    title: "TMOyelowo — Words & Stories",
    description:
      "A creative writing space by TMOyelowo. Articles, poems, stories, and essays.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TMOyelowo — Words & Stories",
    description:
      "A creative writing space by TMOyelowo. Articles, poems, stories, and essays.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
