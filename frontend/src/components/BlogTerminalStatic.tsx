"use client";

import { useEffect, useRef } from "react";
import { terminalConfig } from "../config/terminal-theme";

// Desktop + mobile captures live at two different widths so mobile blog
// pages don't need horizontal scroll. Frontend chooses at runtime based on
// viewport — the selected cols value MUST match the capture cols so mdcat's
// tables / code blocks / lists land exactly as captured (no xterm rewrap).
const DESKTOP_COLS = 140;
const MOBILE_COLS = 48;
const MOBILE_BREAKPOINT = 768;

// Desktop: a fixed readable size. Mobile: computed so the whole 48-col
// render fits exactly in the viewport width (no horizontal scroll).
const DESKTOP_FONT_SIZE = 14;
const CHAR_WIDTH_RATIO = 0.6;

function pickRender(): { cols: number; fontSize: number } {
  if (typeof window === "undefined") return { cols: DESKTOP_COLS, fontSize: DESKTOP_FONT_SIZE };
  if (window.innerWidth >= MOBILE_BREAKPOINT) {
    return { cols: DESKTOP_COLS, fontSize: DESKTOP_FONT_SIZE };
  }
  // Mobile: target whole-render-fits-viewport. Small safety padding.
  const usable = Math.max(200, window.innerWidth - 16);
  const fontSize = Math.max(11, Math.min(18, Math.floor(usable / MOBILE_COLS / CHAR_WIDTH_RATIO)));
  return { cols: MOBILE_COLS, fontSize };
}

// ANSI rendition of the zsh / oh-my-posh pure-modified prompt.
const RED = "\x1b[38;2;204;36;29m";
const LFG = "\x1b[38;2;251;241;199m";
const RESET = "\x1b[0m";
const PROMPT = `${RED}tim.waldin.net ${LFG}~ \r\n${RED}❯ ${RESET}`;

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
  ansiMobile: string;
}

export default function BlogTerminalStatic({ slug, ansi, ansiMobile }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    let disposed = false;
    const cleanups: Array<() => void> = [];

    Promise.all([
      loadNerdFont(),
      import("@xterm/xterm"),
      import("@xterm/addon-web-links"),
      import("socket.io-client"),
    ]).then(([, xtermMod, linksMod, ioMod]) => {
      if (disposed || !hostRef.current) return;
      const { Terminal } = xtermMod;
      const { WebLinksAddon } = linksMod;
      const { io } = ioMod;

      const { cols, fontSize } = pickRender();
      const activeAnsi = cols === MOBILE_COLS ? ansiMobile : ansi;

      // Conservative upper bound for rows: captured ANSI line count + the
      // typewriter / prompt lines. We resize down to actual used rows once
      // the content finishes landing.
      const estimatedLines = (activeAnsi.match(/\r?\n/g) || []).length + 20;
      const initialRows = Math.max(80, estimatedLines);

      const xterm = new Terminal({
        ...terminalConfig,
        cols,
        rows: initialRows,
        fontSize,
        scrollback: 0,            // outer <div overflow:auto> owns scrolling
        disableStdin: false,      // keystrokes still trigger live handover
      });

      const openLink = (_e: MouseEvent, href: string) =>
        window.open(href, "_blank", "noopener,noreferrer");
      xterm.loadAddon(new WebLinksAddon(openLink));
      xterm.options.linkHandler = { activate: openLink, allowNonHttpProtocols: true };

      xterm.open(hostRef.current);

      // The outer wrapper handles scroll position; don't let the capture's
      // OSC 9998 "scroll to top" reset our scroll, and silence OSC 9999
      // URL-sync since the cold page doesn't track it.
      const oscScrollTop = xterm.parser.registerOscHandler(9998, () => true);
      const oscUrlSync = xterm.parser.registerOscHandler(9999, () => true);
      cleanups.push(() => oscScrollTop.dispose());
      cleanups.push(() => oscUrlSync.dispose());

      // --- Playback: prompt + typewriter + captured ansi + final prompt ---
      xterm.write(PROMPT);
      const cmd = `blog ${slug}`;
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
            xterm.write(activeAnsi);
            setTimeout(() => {
              if (disposed) return;
              xterm.write(`\r\n${PROMPT}`);
              // After content lands, shrink rows to match actual used height
              // so there's no giant empty area below the prompt.
              setTimeout(() => {
                if (disposed) return;
                const used = xterm.buffer.active.cursorY + xterm.buffer.active.baseY + 2;
                if (used > 5 && used < initialRows) {
                  xterm.resize(cols, used);
                }
              }, 120);
            }, 80);
          }, 120);
        }
      };
      setTimeout(typeNext, 300);

      // --- Seamless live handover on first keystroke (unchanged). ---
      type SocketShape = {
        connected: boolean;
        on: (ev: string, cb: (...a: unknown[]) => void) => unknown;
        emit: (ev: string, ...a: unknown[]) => unknown;
        disconnect: () => unknown;
      };
      let socket: SocketShape | null = null;
      let warmed = false;
      let handedOver = false;
      const inputBuf: string[] = [];

      const eraseFakePrompt = () => {
        if (handedOver) return;
        handedOver = true;
        xterm.write("\r\x1b[2K\x1b[A\r\x1b[2K");
      };

      const startLive = () => {
        if (warmed) return;
        warmed = true;
        const url = typeof window !== "undefined"
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
          socket?.emit("resize", { cols: xterm.cols, rows: xterm.rows });
        });
        socket.on("output", (data) => {
          if (typeof data !== "string") return;
          const wasFirst = !handedOver;
          eraseFakePrompt();
          xterm.write(data);
          if (wasFirst && inputBuf.length > 0 && socket?.connected) {
            for (const ch of inputBuf.splice(0)) socket.emit("input", ch);
          }
        });
        socket.on("disconnect", () => { warmed = false; });
      };

      const dataDisposable = xterm.onData((data) => {
        if (socket?.connected) socket.emit("input", data);
        else { inputBuf.push(data); startLive(); }
      });
      cleanups.push(() => dataDisposable.dispose());
      cleanups.push(() => { try { socket?.disconnect(); } catch { /* ignore */ } });

      cleanups.push(() => xterm.dispose());
    });

    return () => {
      disposed = true;
      for (const fn of cleanups) { try { fn(); } catch { /* ignore */ } }
    };
  }, [slug, ansi]);

  return (
    // Outer scroll wrapper — native browser scroll gives us butter-smooth
    // iOS momentum, proper pinch-to-zoom, and no custom touch handler to
    // maintain. Scroll is constrained to this area (not the page body).
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
        backgroundColor: terminalConfig.theme.background,
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      {/* xterm mounts at its natural 140-cols-wide canvas size. The inline-
          block shrink-wrap lets the wrapper's overflow:auto correctly
          compute horizontal scroll. */}
      <div
        ref={hostRef}
        style={{
          display: "inline-block",
          padding: "8px 12px",
          minWidth: "100%",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
