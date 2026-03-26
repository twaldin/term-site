"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { terminalConfig } from "../config/terminal-theme";

const CONTENT_WIDTH = 139; // Max terminal content width in characters
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
    const xtermRef = useRef<import("@xterm/xterm").Terminal | null>(null);
    const fitAddonRef = useRef<import("@xterm/addon-fit").FitAddon | null>(null);
    const outputBufferRef = useRef<string[]>([]);

    useEffect(() => {
      if (!terminalRef.current || typeof window === "undefined") return;

      // Cleanup any existing terminal first
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
        fitAddonRef.current = null;
      }

      let cleanupFunctions: (() => void)[] = [];

      // Ensure Nerd Font is loaded before initializing terminal
      const loadFonts = async () => {
        try {
          // Create font face objects for the fonts we need
          const nerdFont = new FontFace(
            'JetBrainsMono Nerd Font Mono',
            'url(/fonts/JetBrainsMonoNerdFontMono-Regular.ttf)',
            { weight: 'normal', style: 'normal' }
          );
          
          const nerdFontBold = new FontFace(
            'JetBrainsMono Nerd Font Mono',
            'url(/fonts/JetBrainsMonoNerdFontMono-Bold.ttf)',
            { weight: 'bold', style: 'normal' }
          );

          // Load the fonts
          await nerdFont.load();
          await nerdFontBold.load();
          
          // Add them to the document
          document.fonts.add(nerdFont);
          document.fonts.add(nerdFontBold);
          
        } catch (error) {
          console.warn('Failed to load Nerd Fonts, falling back to system fonts:', error);
        }
      };

      // Load fonts first, then initialize terminal
      loadFonts().then(() => {
        // Dynamic import to avoid SSR issues
        import("@xterm/xterm").then(({ Terminal }) => {
          import("@xterm/addon-fit").then(({ FitAddon }) => {
            import("@xterm/addon-web-links").then(({ WebLinksAddon }) => {
              // CSS is imported via next.config or global CSS

            // Check if component is still mounted
            if (!terminalRef.current) return;

          const dynamicFontSize = calculateFontSize(terminalRef.current);
          const dynamicConfig = {
            ...terminalConfig,
            fontSize: dynamicFontSize
          };
          
          // Initialize xterm.js with dynamic config
          const xterm = new Terminal(dynamicConfig);

          // Initialize fit addon
          const fitAddon = new FitAddon();
          xterm.loadAddon(fitAddon);

          // Custom link handler for OSC 8 hyperlinks and mailto support
          const handleLinkActivate = (_event: MouseEvent, text: string) => {
            window.open(text, '_blank', 'noopener,noreferrer');
          };

          const webLinksAddon = new WebLinksAddon(handleLinkActivate);
          xterm.loadAddon(webLinksAddon);

          xterm.options.linkHandler = {
            activate: handleLinkActivate,
            allowNonHttpProtocols: true,
          };

          // Open terminal
          xterm.open(terminalRef.current!);

          // Store references
          xtermRef.current = xterm;
          fitAddonRef.current = fitAddon;

          // Flush any buffered output that arrived before xterm was ready
          if (outputBufferRef.current.length > 0) {
            for (const chunk of outputBufferRef.current) {
              xterm.write(chunk);
            }
            outputBufferRef.current = [];
          }

          // Handle terminal input
          const dataDisposable = xterm.onData(onData);

          // Handle terminal resize
          const resizeDisposable = xterm.onResize(({ cols, rows }) => {
            onResize(cols, rows);
          });

          // Fit terminal after a short delay to ensure DOM is ready
          setTimeout(() => {
            fitAddon.fit();
            const { cols, rows } = xterm;
            onResize(cols, rows);
          }, 100);

          // Focus terminal and handle clicks
          xterm.focus();

          // Add click handler to ensure focus
          const handleClick = () => {
            xterm.focus();
          };

          const currentTerminalElement = terminalRef.current!;
          currentTerminalElement.addEventListener("click", handleClick);

          // Add clipboard integration
          const handlePaste = async (event: ClipboardEvent) => {
            event.preventDefault();
            try {
              const text = await navigator.clipboard.readText();
              xterm.paste(text);
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

          // Add keyboard shortcuts for copy/paste and tab handling
          const handleKeyDown = async (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "v") {
              event.preventDefault();
              try {
                const text = await navigator.clipboard.readText();
                xterm.paste(text);
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

          // Debounced resize handler to prevent too frequent updates
          let resizeTimeout: NodeJS.Timeout;
          const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
              if (terminalRef.current && xterm && fitAddon) {
              const newFontSize = calculateFontSize(terminalRef.current);
              const currentFontSize = xterm.options.fontSize || dynamicConfig.fontSize;
              if (Math.abs(currentFontSize - newFontSize) > 1) {
                xterm.options.fontSize = newFontSize;
              }
              fitAddon.fit();
              }
            }, 150); // 150ms debounce
          };

          window.addEventListener("resize", handleResize);

          // Additional resize after component is fully ready
          setTimeout(() => {
            fitAddon.fit();
            const { cols, rows } = xterm;
            onResize(cols, rows);
          }, 200);

          // Store cleanup functions
          cleanupFunctions = [
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
            () => xterm.dispose(),
          ];
            });
          });
        });
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
          // Trigger resize event to notify backend
          const { cols, rows } = xtermRef.current;
          onResize(cols, rows);
        }
      },
    }), [onResize]);

    return (
      <div
        ref={terminalRef}
        className="w-full h-full"
        style={{
          width: "100vw",
          height: "100vh",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          backgroundColor: terminalConfig.theme.background,
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
    );
  },
);

Terminal.displayName = "Terminal";
export default Terminal;

