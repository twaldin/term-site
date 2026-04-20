import type { Metadata } from "next";
import "./globals.css";

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
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          href="/fonts/JetBrainsMonoNerdFontMono-Bold.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
