"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Terminal as XTermTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { terminalConfig } from "../config/terminal-theme";
import { attachTouchScroll } from "../lib/xterm-touch";

const MOBILE_BREAKPOINT = 768;
const MIN_FONT_SIZE = 13;
const MAX_FONT_SIZE = 28;

// Pick font size directly from viewport width. Cols fall out via xterm's
// FitAddon so box widths, figlet output, etc. scale naturally — narrow
// screens get compact columns; ultrawide monitors get a much bigger,
// readable font instead of wasting real estate on 200+ cols.
function calculateFontSize(_container: HTMLElement): number {
  const viewportWidth = window.innerWidth;
  // Mobile gets a fixed small font; desktop scales ~1px per 80px of viewport.
  const target = viewportWidth < MOBILE_BREAKPOINT
    ? 13
    : Math.round(viewportWidth / 80);
  return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, target));
}

interface TerminalProps {
  onData: (data: string) => void;
  onResize: (cols: number, rows: number) => void;
}

interface TerminalRef {
  writeToTerminal: (data: string) => void;
  clearTerminal: () => void;
  fitTerminal: () => void;
}

const Terminal = forwardRef<TerminalRef, TerminalProps>(
  ({ onData, onResize }, ref) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTermTerminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const outputBufferRef = useRef<string[]>([]);
    const dripTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cancelDripRef = useRef(false);
    const dripRemainingRef = useRef('');

    useEffect(() => {
      if (!terminalRef.current || typeof window === "undefined") return;

      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
        fitAddonRef.current = null;
      }

      let cleanupFunctions: (() => void)[] = [];

      // Init xterm immediately — don't gate on font download. The terminal
      // renders with a system fallback font first, then re-fits when the
      // Nerd Font finishes loading (preload in layout.tsx triggers the swap).
      if (!terminalRef.current) return;

      const dynamicFontSize = calculateFontSize(terminalRef.current);
      const dynamicConfig = { ...terminalConfig, fontSize: dynamicFontSize };

      const xterm = new XTermTerminal(dynamicConfig);
      const fitAddon = new FitAddon();
      xterm.loadAddon(fitAddon);

      const handleLinkActivate = (_event: MouseEvent, text: string) => {
        window.open(text, "_blank", "noopener,noreferrer");
      };
      xterm.loadAddon(new WebLinksAddon(handleLinkActivate));
      xterm.options.linkHandler = {
        activate: handleLinkActivate,
        allowNonHttpProtocols: true,
      };

      xterm.open(terminalRef.current);
      xtermRef.current = xterm;
      fitAddonRef.current = fitAddon;

      const oscUrlDisposable = xterm.parser.registerOscHandler(9999, (data) => {
        try {
          const path = '/' + data.replace(/^\/+/, '');
          if (typeof window !== 'undefined' && window.location.pathname !== path) {
            window.history.pushState(null, '', path);
          }
        } catch { return true; }
        return true;
      });

      const oscScrollTopDisposable = xterm.parser.registerOscHandler(9998, () => {
        try { xterm.scrollToTop(); } catch { /* best-effort */ }
        return true;
      });

      const oscNavigateDisposable = xterm.parser.registerOscHandler(9997, (data) => {
        try {
          const path = '/' + data.replace(/^\/+/, '');
          if (typeof window !== 'undefined') {
            window.location.assign(path);
          }
        } catch { /* malformed */ }
        return true;
      });

      // Flush buffered output that arrived before xterm was ready
      if (outputBufferRef.current.length > 0) {
        for (const chunk of outputBufferRef.current) {
          xterm.write(chunk);
        }
        outputBufferRef.current = [];
      }

      const dataDisposable = xterm.onData((data) => {
        cancelDripRef.current = true;
        if (dripTimerRef.current) {
          clearTimeout(dripTimerRef.current);
          dripTimerRef.current = null;
        }
        if (dripRemainingRef.current && xtermRef.current) {
          xtermRef.current.write(dripRemainingRef.current);
          dripRemainingRef.current = '';
        }
        onData(data);
      });
      const resizeDisposable = xterm.onResize(({ cols, rows }) => {
        onResize(cols, rows);
      });

      // Fit after one frame for DOM layout
      requestAnimationFrame(() => {
        fitAddon.fit();
        onResize(xterm.cols, xterm.rows);
      });

      // Re-fit when Nerd Font finishes loading — glyph widths change.
      document.fonts.ready.then(() => {
        if (fitAddonRef.current && xtermRef.current) {
          fitAddonRef.current.fit();
          onResize(xtermRef.current.cols, xtermRef.current.rows);
        }
      });

      xterm.focus();

      const handleClick = () => xterm.focus();
      const currentTerminalElement = terminalRef.current;
      currentTerminalElement.addEventListener("click", handleClick);

      const detachTouch = attachTouchScroll(xterm, currentTerminalElement);

      const handlePaste = async (event: ClipboardEvent) => {
        event.preventDefault();
        try {
          xterm.paste(await navigator.clipboard.readText());
        } catch (err) {
          console.warn("Failed to read clipboard:", err);
        }
      };

      const handleCopy = async () => {
        try {
          const selection = xterm.getSelection();
          if (selection) {
            await navigator.clipboard.writeText(selection);
          }
        } catch (err) {
          console.warn("Failed to write to clipboard:", err);
        }
      };

      const handleKeyDown = async (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "v") {
          event.preventDefault();
          try {
            xterm.paste(await navigator.clipboard.readText());
          } catch (err) {
            console.warn("Failed to read clipboard:", err);
          }
        } else if ((event.ctrlKey || event.metaKey) && event.key === "c") {
          const selection = xterm.getSelection();
          if (selection) {
            event.preventDefault();
            handleCopy();
          }
        }
      };

      currentTerminalElement.addEventListener("paste", handlePaste);
      currentTerminalElement.addEventListener("keydown", handleKeyDown);

      let resizeTimeout: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (terminalRef.current && xterm && fitAddon) {
            const newFontSize = calculateFontSize(terminalRef.current);
            const currentFontSize =
              xterm.options.fontSize || dynamicConfig.fontSize;
            if (Math.abs(currentFontSize - newFontSize) > 1) {
              xterm.options.fontSize = newFontSize;
            }
            fitAddon.fit();
          }
        }, 150);
      };

      window.addEventListener("resize", handleResize);

      cleanupFunctions = [
        () => {
          if (dripTimerRef.current) clearTimeout(dripTimerRef.current);
        },
        detachTouch,
        () => {
          clearTimeout(resizeTimeout);
          window.removeEventListener("resize", handleResize);
        },
        () =>
          currentTerminalElement.removeEventListener("click", handleClick),
        () =>
          currentTerminalElement.removeEventListener("paste", handlePaste),
        () =>
          currentTerminalElement.removeEventListener(
            "keydown",
            handleKeyDown,
          ),
        () => dataDisposable.dispose(),
        () => resizeDisposable.dispose(),
        () => oscUrlDisposable.dispose(),
        () => oscScrollTopDisposable.dispose(),
        () => oscNavigateDisposable.dispose(),
        () => xterm.dispose(),
      ];

      // Return cleanup function
      return () => {
        cleanupFunctions.forEach((cleanup) => {
          try {
            cleanup();
          } catch {
            // Cleanup errors are expected during unmount
          }
        });
        xtermRef.current = null;
        fitAddonRef.current = null;
      };
    }, [onData, onResize]);

    const writeToTerminal = (data: string) => {
      if (!xtermRef.current) {
        outputBufferRef.current.push(data);
        return;
      }

      const newlineCount = (data.match(/\n/g) || []).length;
      if (data.length <= 200 || newlineCount <= 3) {
        xtermRef.current.write(data);
        return;
      }

      cancelDripRef.current = false;
      const lines = data.split('\n');
      dripRemainingRef.current = data;
      let i = 0;

      const drip = () => {
        if (cancelDripRef.current || i >= lines.length || !xtermRef.current) {
          if (dripRemainingRef.current && xtermRef.current) {
            xtermRef.current.write(dripRemainingRef.current);
          }
          dripRemainingRef.current = '';
          dripTimerRef.current = null;
          return;
        }

        const line = lines[i];
        dripRemainingRef.current = lines.slice(i + 1).join('\n');
        xtermRef.current.write(i < lines.length - 1 ? line + '\n' : line);
        i++;
        dripTimerRef.current = setTimeout(drip, 20);
      };

      if (dripTimerRef.current) {
        clearTimeout(dripTimerRef.current);
      }
      drip();
    };

    const clearTerminal = () => {
      if (xtermRef.current) {
        xtermRef.current.clear();
      }
    };

    useImperativeHandle(ref, () => ({
      writeToTerminal,
      clearTerminal,
      fitTerminal: () => {
        if (fitAddonRef.current && xtermRef.current) {
          fitAddonRef.current.fit();
          const { cols, rows } = xtermRef.current;
          onResize(cols, rows);
        }
      },
    }), [onResize]);

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          margin: 0,
          padding: "6px 14px",
          boxSizing: "border-box",
          backgroundColor: terminalConfig.theme.background,
          position: "relative",
        }}
      >
        <div
          ref={terminalRef}
          className="w-full h-full"
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
  },
);

Terminal.displayName = "Terminal";
export default Terminal;
