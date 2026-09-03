import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "driver.js/dist/driver.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://crak.app"),
  title: {
    default: "CRAK — Referrals that reward everyone",
    template: "%s | CRAK",
  },
  description:
    "Launch customer referral campaigns, fund rewards and track every payout from one simple workspace.",
  openGraph: {
    title: "CRAK — Turn customers into your growth engine",
    description:
      "Referral campaigns, automated rewards and transparent payouts for ambitious African businesses.",
    type: "website",
    images: [{ url: "/images/crak-social-preview.png", width: 1200, height: 630, alt: "CRAK — Referrals that reward everyone" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CRAK — Turn customers into your growth engine",
    description: "Referral campaigns, automated rewards and transparent payouts for ambitious African businesses.",
    images: ["/images/crak-social-preview.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
