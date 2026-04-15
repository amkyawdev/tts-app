import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import PWAProvider from "@/components/PWAProvider";

export const metadata: Metadata = {
  title: "AmkyawDev TTS",
  description: "AI-powered Text to Story & Speech Application with PWA support",
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#8B5CF6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AmkyawDev TTS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <PWAProvider />
        <Sidebar />
        <main className="lg:ml-16 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
