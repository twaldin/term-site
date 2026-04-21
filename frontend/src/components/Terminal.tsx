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

const MOBILE_CONTENT_WIDTH = 50;
const DESKTOP_CONTENT_WIDTH = 139;
const MOBILE_BREAKPOINT = 768;
const CHAR_WIDTH_RATIO = 0.6;
const SAFETY_MARGIN = 0.95;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 24;

function calculateFontSize(container: HTMLElement): number {
  const viewportWidth = window.innerWidth;
  const documentWidth = document.documentElement.clientWidth;
  const containerWidth = container.clientWidth;
  const containerRect = container.getBoundingClientRect();
  const actualWidth = Math.min(viewportWidth, documentWidth, containerWidth, containerRect.width);
  const padding = Math.min(10, actualWidth * 0.02);
  const usableWidth = actualWidth - padding;
  const targetCols = viewportWidth < MOBILE_BREAKPOINT ? MOBILE_CONTENT_WIDTH : DESKTOP_CONTENT_WIDTH;
  const theoretical = Math.floor((usableWidth / targetCols) / CHAR_WIDTH_RATIO);
  const conservative = Math.floor(theoretical * SAFETY_MARGIN);
  return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, conservative));
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

    useEffect(() => {
      if (!terminalRef.current || typeof window === "undefined") return;

      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
        fitAddonRef.current = null;
      }

      let cleanupFunctions: (() => void)[] = [];

      // Fonts are preloaded via <link> in layout.tsx and @font-face in globals.css.
      // Just wait for them to be ready — no redundant FontFace construction.
      document.fonts.ready.then(() => {
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

        // OSC 9999 — shell scripts emit `\e]9999;<path>\e\\` on entry so the
        // browser URL tracks the active command (bidirectional deep links).
        const oscUrlDisposable = xterm.parser.registerOscHandler(9999, (data) => {
          try {
            const path = '/' + data.replace(/^\/+/, '');
            if (typeof window !== 'undefined' && window.location.pathname !== path) {
              window.history.pushState(null, '', path);
            }
          } catch { /* malformed — swallow, xterm still strips the seq */ }
          return true;
        });

        // OSC 9998 — emitted by scripts after long renders (blog posts etc).
        const oscScrollTopDisposable = xterm.parser.registerOscHandler(9998, () => {
          try { xterm.scrollToTop(); } catch { /* best-effort */ }
          return true;
        });

        // OSC 9997 — `emit_navigate <path>` hands off to an HTML page
        const oscNavigateDisposable = xterm.parser.registerOscHandler(9997, (data) => {
          try {
            const path = '/' + data.replace(/^\/+/, '');
            if (typeof window !== 'undefined') {
              window.location.assign(path);
            }
          } catch { /* malformed — swallow */ }
          return true;
        });

        // Flush buffered output that arrived before xterm was ready
        if (outputBufferRef.current.length > 0) {
          for (const chunk of outputBufferRef.current) {
            xterm.write(chunk);
          }
          outputBufferRef.current = [];
        }

        const dataDisposable = xterm.onData(onData);
        const resizeDisposable = xterm.onResize(({ cols, rows }) => {
          onResize(cols, rows);
        });

        // Single rAF for DOM layout, then fit + notify backend
        requestAnimationFrame(() => {
          fitAddon.fit();
          onResize(xterm.cols, xterm.rows);
        });

        xterm.focus();

        const handleClick = () => xterm.focus();
        const currentTerminalElement = terminalRef.current;
        currentTerminalElement.addEventListener("click", handleClick);

        // Mobile touch scroll (1:1 finger tracking + momentum).
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
      });

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

    // Method to write data to terminal (buffers if xterm not ready yet)
    const writeToTerminal = (data: string) => {
      if (xtermRef.current) {
        xtermRef.current.write(data);
      } else {
        outputBufferRef.current.push(data);
      }
    };

    // Method to clear terminal
    const clearTerminal = () => {
      if (xtermRef.current) {
        xtermRef.current.clear();
      }
    };

    // Expose methods via ref
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
