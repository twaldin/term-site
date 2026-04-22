import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "twaldin portfolio",
  description: "Interactive terminal portfolio - Timothy Waldin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Start the 1MB Nerd Font download with the HTML parse, not after JS mounts.
            Cuts ~400-500ms off TTI — without this the FontFace API call in xterm
            init is the first request that triggers the font download. */}
        <link
          rel="preload"
          as="font"
          href="/fonts/JetBrainsMonoNerdFontMono-Regular.woff2"
          type="font/woff2"
        />
        <link
          rel="preload"
          as="font"
          href="/fonts/JetBrainsMonoNerdFontMono-Bold.woff2"
          type="font/woff2"
        />
      </head>
      <body>
        <SiteHeader />
        <main style={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column', background: '#1d2021' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
