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

      // --- Seamless handover: first interaction opens a WebSocket in place.
      // We pass initCommand: '' so the backend does NOT auto-type welcome over
      // the top of the blog content the user is reading.
      type SocketShape = {
        connected: boolean;
        on: (ev: string, cb: (...a: unknown[]) => void) => unknown;
        emit: (ev: string, ...a: unknown[]) => unknown;
        disconnect: () => unknown;
      };
      let socket: SocketShape | null = null;
      let warmed = false;            // socket requested (may still be connecting)
      let handedOver = false;        // fake-prompt erased; live output may now render
      const inputBuf: string[] = [];

      // Erase our 2-line fake prompt right before the backend's real output arrives,
      // otherwise the reader sees two prompts stacked. PROMPT = "portfolio ~ \r\n❯ ".
      const eraseFakePrompt = () => {
        if (handedOver) return;
        handedOver = true;
        xterm.write("\r\x1b[2K\x1b[A\r\x1b[2K");
      };

      const startLive = () => {
        if (warmed) return;
        warmed = true;
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
          socket?.emit("resize", { cols: xterm.cols, rows: xterm.rows });
        });
        socket.on("output", (data) => {
          if (typeof data !== "string") return;
          // First real output from the backend → erase our fake prompt so
          // only the live prompt is visible.
          eraseFakePrompt();
          xterm.write(data);
        });
        socket.on("disconnect", () => { warmed = false; });

        // Once connected, flush anything the user typed before the socket
        // finished opening.
        const flush = () => {
          if (!socket?.connected) return setTimeout(flush, 30);
          for (const ch of inputBuf.splice(0)) socket.emit("input", ch);
        };
        setTimeout(flush, 50);
      };

      const dataDisposable = xterm.onData((data) => {
        if (socket?.connected) {
          socket.emit("input", data);
        } else {
          inputBuf.push(data);
          startLive(); // in case warmup didn't trigger
        }
      });
      cleanups.push(() => dataDisposable.dispose());
      cleanups.push(() => {
        try { socket?.disconnect(); } catch { /* ignore */ }
      });

      // Forward future resizes once live.
      const resizeDisposable = xterm.onResize(({ cols, rows }) => {
        if (socket?.connected) socket.emit("resize", { cols, rows });
      });
      cleanups.push(() => resizeDisposable.dispose());

      // Click is our deliberate-engagement signal: most passive blog readers
      // never click the terminal, so we don't spin up a container for them.
      // Users who DO click get the container warming up while they decide
      // what to type — by the time a keystroke arrives, the backend prompt
      // has usually already landed. (mouseenter/hover was too aggressive:
      // it fires on every cursor sweep over the page.)
      const host = hostRef.current;
      const onFirstTouch = () => {
        xterm.focus();
        startLive();
      };
      host.addEventListener("click", onFirstTouch);
      cleanups.push(() => host.removeEventListener("click", onFirstTouch));

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
