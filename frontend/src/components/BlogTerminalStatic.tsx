"use client";

import { useEffect, useRef } from "react";
import { terminalConfig } from "../config/terminal-theme";

// Match the live Terminal's sizing math so captured-at-140-cols content fits.
const CONTENT_WIDTH = 139;
const CHAR_WIDTH_RATIO = 0.6;
const SAFETY_MARGIN = 0.95;
const MIN_FONT_SIZE = 6;
const MAX_FONT_SIZE = 24;

// ANSI rendition of the zsh / oh-my-posh pure-modified prompt:
//   red "portfolio"  light "~ "  \n  red "❯ "
// Colors lifted from dotfiles/zsh/pure-modified.omp.json.
const RED = "\x1b[38;2;204;36;29m";
const LFG = "\x1b[38;2;251;241;199m";
const RESET = "\x1b[0m";
const PROMPT = `${RED}portfolio ${LFG}~ \r\n${RED}❯ ${RESET}`;

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

  useEffect(() => {
    if (!hostRef.current) return;
    let disposed = false;
    const cleanups: Array<() => void> = [];

    // Parallelize font + xterm + socket.io downloads.
    Promise.all([
      loadNerdFont(),
      import("@xterm/xterm"),
      import("@xterm/addon-fit"),
      import("@xterm/addon-web-links"),
      import("socket.io-client"),
    ]).then(([, xtermMod, fitMod, linksMod, ioMod]) => {
      if (disposed || !hostRef.current) return;
      const { Terminal } = xtermMod;
      const { FitAddon } = fitMod;
      const { WebLinksAddon } = linksMod;
      const { io } = ioMod;

      const fontSize = calculateFontSize(hostRef.current);
      const xterm = new Terminal({ ...terminalConfig, fontSize });
      const fit = new FitAddon();
      xterm.loadAddon(fit);

      const openLink = (_e: MouseEvent, href: string) =>
        window.open(href, "_blank", "noopener,noreferrer");
      xterm.loadAddon(new WebLinksAddon(openLink));
      xterm.options.linkHandler = { activate: openLink, allowNonHttpProtocols: true };

      xterm.open(hostRef.current);

      // OSC 9998 scroll-to-top — captured ANSI emits this after the post body renders.
      const oscScrollTop = xterm.parser.registerOscHandler(9998, () => {
        try { xterm.scrollToTop(); } catch { /* best-effort */ }
        return true;
      });
      cleanups.push(() => oscScrollTop.dispose());

      // Strip OSC 9999 — URL sync belongs to the live terminal, not the cold page.
      const oscNoop = xterm.parser.registerOscHandler(9999, () => true);
      cleanups.push(() => oscNoop.dispose());

      // Fit to viewport after layout settles.
      setTimeout(() => fit.fit(), 50);
      setTimeout(() => fit.fit(), 200);

      // --- Playback: real prompt + typewriter command + captured blog ANSI + real prompt.
      const cmd = `blog ${slug}`;
      xterm.write(PROMPT);

      let i = 0;
      const typeNext = () => {
        if (disposed) return;
        if (i < cmd.length) {
          xterm.write(cmd[i]);
          i++;
          setTimeout(typeNext, 60);
        } else {
          xterm.write("\r\n");
          setTimeout(() => {
            if (disposed) return;
            xterm.write(ansi);
            // Backend's captured output includes the blog body; end with a
            // fresh prompt so the idle state matches a live terminal.
            setTimeout(() => xterm.write(`\r\n${PROMPT}`), 80);
          }, 120);
        }
      };
      setTimeout(typeNext, 300);

      // --- Seamless handover: first keystroke opens a WebSocket in place.
      // We explicitly pass initCommand: '' so the backend does NOT auto-type
      // welcome over the top of the blog content the user is looking at.
      type SocketShape = {
        connected: boolean;
        on: (ev: string, cb: (...a: unknown[]) => void) => unknown;
        emit: (ev: string, ...a: unknown[]) => unknown;
        disconnect: () => unknown;
      };
      let socket: SocketShape | null = null;
      let liveActive = false;
      const inputBuf: string[] = [];

      const startLive = () => {
        if (liveActive) return;
        liveActive = true;
        const url =
          typeof window !== "undefined"
            ? `${window.location.protocol}//${window.location.host}`
            : "";

        socket = io(url, {
          transports: ["websocket", "polling"],
          timeout: 10000,
          reconnection: true,
          upgrade: true,
          rememberUpgrade: true,
          auth: { initCommand: "" },
        }) as unknown as SocketShape;

        socket.on("connect", () => {
          // Send current terminal size so the backend PTY sizes correctly.
          socket?.emit("resize", { cols: xterm.cols, rows: xterm.rows });
        });
        socket.on("output", (data) => {
          if (typeof data === "string") xterm.write(data);
        });
        socket.on("disconnect", () => { liveActive = false; });

        // Hand over previously-buffered keystrokes once the socket is open.
        const flush = () => {
          if (!socket?.connected) return setTimeout(flush, 30);
          for (const ch of inputBuf.splice(0)) socket.emit("input", ch);
        };
        setTimeout(flush, 50);
      };

      const dataDisposable = xterm.onData((data) => {
        if (liveActive && socket?.connected) {
          socket.emit("input", data);
        } else {
          inputBuf.push(data);
          startLive();
        }
      });
      cleanups.push(() => dataDisposable.dispose());
      cleanups.push(() => {
        try { socket?.disconnect(); } catch { /* ignore */ }
      });

      // Forward future resizes too, once the live session is attached.
      const resizeDisposable = xterm.onResize(({ cols, rows }) => {
        if (liveActive && socket?.connected) socket.emit("resize", { cols, rows });
      });
      cleanups.push(() => resizeDisposable.dispose());

      // Click to focus.
      const onClick = () => xterm.focus();
      const host = hostRef.current;
      host.addEventListener("click", onClick);
      cleanups.push(() => host.removeEventListener("click", onClick));

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
  }, [slug, ansi]);

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
