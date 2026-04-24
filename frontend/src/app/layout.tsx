import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { terminalTheme } from "@/config/terminal-theme";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: terminalTheme.background,
};

export const metadata: Metadata = {
  title: "twaldin portfolio",
  description: "Interactive terminal portfolio - Timothy Waldin",
  // TTI optimization: critical resources preload hint
  other: {
    "critical": "true",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          :root {
            --color-bg: ${terminalTheme.background};
            --color-fg: ${terminalTheme.foreground};
            --color-red: ${terminalTheme.red};
            --color-green: ${terminalTheme.green};
            --color-dim: ${terminalTheme.brightBlack};
            --color-border: ${terminalTheme.brightBlack};
          }
        `}</style>
        {/* Start the Nerd Font download with the HTML parse so xterm's
            FontFace call doesn't trigger a cold fetch. `crossorigin=anonymous`
            matches the fetch mode xterm/@font-face use — without it the
            browser keeps the preload and the real load as separate requests
            and emits "preloaded but not used" warnings. */}
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
      <body>
        <SiteHeader />
        <main style={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column', background: terminalTheme.background }}>
          {children}
        </main>
      </body>
    </html>
  );
}
