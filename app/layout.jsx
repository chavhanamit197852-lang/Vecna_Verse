import "./globals.css";
import { SessionProvider } from "next-auth/react";
import SponsorStrip from "@/components/SponsorStrip";

export const metadata = {
  title: "EventVerse | Campus OS",
  description:
    "The decentralized nervous system for your campus. Discover events, assemble teams, climb leaderboards.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@900,800,700,500,400&f[]=satoshi@900,700,500,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#09090b] font-sans text-zinc-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <SessionProvider>
          {children}
          <SponsorStrip />
        </SessionProvider>
      </body>
    </html>
  );
}