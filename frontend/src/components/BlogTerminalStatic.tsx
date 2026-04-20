"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { terminalConfig } from "../config/terminal-theme";

// Match the live Terminal's sizing math so captured-at-140-cols content fits.
const CONTENT_WIDTH = 139;
const CHAR_WIDTH_RATIO = 0.6;
const SAFETY_MARGIN = 0.95;
const MIN_FONT_SIZE = 6;
const MAX_FONT_SIZE = 24;

function calculateFontSize(container: HTMLElement): number {
  const viewportWidth = window.innerWidth;
  const documentWidth = document.documentElement.clientWidth;
  const containerWidth = container.clientWidth;
  const containerRect = container.getBoundingClientRect();
  const actualWidth = Math.min(viewportWidth, documentWidth, containerWidth, containerRect.width);
  const padding = Math.min(10, actualWidth * 0.02);
  const usableWidth = actualWidth - padding;
  const theoretical = Math.floor((usableWidth / CONTENT_WIDTH) / CHAR_WIDTH_RATIO);
  const conservative = Math.floor(theoretical * SAFETY_MARGIN);
  return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, conservative));
}

async function loadNerdFont(): Promise<void> {
  try {
    const reg = new FontFace(
      "JetBrainsMono Nerd Font Mono",
      'url(/fonts/JetBrainsMonoNerdFontMono-Regular.woff2) format("woff2")',
      { weight: "normal", style: "normal" },
    );
    const bold = new FontFace(
      "JetBrainsMono Nerd Font Mono",
      'url(/fonts/JetBrainsMonoNerdFontMono-Bold.woff2) format("woff2")',
      { weight: "bold", style: "normal" },
    );
    await Promise.all([reg.load(), bold.load()]);
    document.fonts.add(reg);
    document.fonts.add(bold);
  } catch {
    /* fallback to system font */
  }
}

interface Props {
  slug: string;
  ansi: string;
}

export default function BlogTerminalStatic({ slug, ansi }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!hostRef.current) return;
    let disposed = false;
    const cleanups: Array<() => void> = [];

    // Parallelize font + xterm imports so we don't serialize the two big downloads.
    Promise.all([
      loadNerdFont(),
      import("@xterm/xterm"),
      import("@xterm/addon-fit"),
      import("@xterm/addon-web-links"),
    ]).then(([, xtermMod, fitMod, linksMod]) => {
      if (disposed || !hostRef.current) return;
      const { Terminal } = xtermMod;
      const { FitAddon } = fitMod;
      const { WebLinksAddon } = linksMod;

      const fontSize = calculateFontSize(hostRef.current);
      const xterm = new Terminal({ ...terminalConfig, fontSize, disableStdin: false });
      const fit = new FitAddon();
      xterm.loadAddon(fit);

      const openLink = (_e: MouseEvent, href: string) =>
        window.open(href, "_blank", "noopener,noreferrer");
      xterm.loadAddon(new WebLinksAddon(openLink));
      xterm.options.linkHandler = { activate: openLink, allowNonHttpProtocols: true };

      xterm.open(hostRef.current);

      // OSC 9998 scroll-to-top (same as live Terminal.tsx) — captured ANSI includes this.
      const oscScrollTop = xterm.parser.registerOscHandler(9998, () => {
        try { xterm.scrollToTop(); } catch { /* best-effort */ }
        return true;
      });
      cleanups.push(() => oscScrollTop.dispose());

      // Strip OSC 9999 (URL sync) — the live terminal pushes history; static doesn't need to.
      const oscNoop = xterm.parser.registerOscHandler(9999, () => true);
      cleanups.push(() => oscNoop.dispose());

      // Fit to viewport after DOM settles.
      setTimeout(() => fit.fit(), 50);
      setTimeout(() => fit.fit(), 200);

      // Fake prompt + typewriter "blog <slug>" + replay captured output.
      const prompt = "\x1b[1;32m❯\x1b[0m ";
      const cmd = `blog ${slug}`;
      xterm.write(prompt);

      let i = 0;
      const typeNext = () => {
        if (disposed) return;
        if (i < cmd.length) {
          xterm.write(cmd[i]);
          i++;
          setTimeout(typeNext, 60);
        } else {
          xterm.write("\r\n");
          // Small beat so the "Enter" feels real, then dump the captured ANSI.
          setTimeout(() => {
            if (disposed) return;
            xterm.write(ansi);
            setTimeout(() => xterm.write(`\r\n${prompt}`), 80);
          }, 120);
        }
      };
      setTimeout(typeNext, 300);

      // Any key → hand off to the live terminal.
      const dataDisposable = xterm.onData(() => {
        router.push(`/t/blog/${encodeURIComponent(slug)}`);
      });
      cleanups.push(() => dataDisposable.dispose());

      // Click to focus (xterm needs focus for scrolling/selection).
      const onClick = () => xterm.focus();
      hostRef.current.addEventListener("click", onClick);
      cleanups.push(() => hostRef.current?.removeEventListener("click", onClick));

      // Responsive re-fit.
      let resizeT: ReturnType<typeof setTimeout>;
      const onResize = () => {
        clearTimeout(resizeT);
        resizeT = setTimeout(() => {
          if (!hostRef.current) return;
          const next = calculateFontSize(hostRef.current);
          if (Math.abs((xterm.options.fontSize || fontSize) - next) > 1) {
            xterm.options.fontSize = next;
          }
          fit.fit();
        }, 150);
      };
      window.addEventListener("resize", onResize);
      cleanups.push(() => {
        clearTimeout(resizeT);
        window.removeEventListener("resize", onResize);
      });

      cleanups.push(() => xterm.dispose());
    });

    return () => {
      disposed = true;
      for (const fn of cleanups) { try { fn(); } catch { /* ignore */ } }
    };
  }, [slug, ansi, router]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: "6px 14px",
        boxSizing: "border-box",
        backgroundColor: terminalConfig.theme.background,
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <div
        ref={hostRef}
        style={{
          width: "100%",
          height: "100%",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          backgroundColor: terminalConfig.theme.background,
        }}
      />
    </div>
  );
}
