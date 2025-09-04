"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { terminalConfig } from "../config/terminal-theme";

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
    const [, setIsReady] = useState(false);

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
          
          console.log('Nerd Fonts loaded successfully');
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

          // Calculate dynamic font size to ensure ASCII art fits
          const asciiWidth = 139; // Width of ASCII art in characters (tim@waldin.net)
          
          // Get more accurate available space measurement
          const viewportWidth = window.innerWidth;
          const documentWidth = document.documentElement.clientWidth;
          const containerWidth = terminalRef.current!.clientWidth;
          const containerRect = terminalRef.current!.getBoundingClientRect();
          
          // Use the most restrictive width (accounting for browser chrome/sidebars)
          const actualWidth = Math.min(viewportWidth, documentWidth, containerWidth, containerRect.width);
          
          console.log(`Viewport: ${viewportWidth}px, Document: ${documentWidth}px, Container: ${containerWidth}px, Rect: ${containerRect.width}px, Using: ${actualWidth}px`);
          
          // Minimal padding for very tight spaces
          const padding = Math.min(10, actualWidth * 0.02); // 2% padding or 10px, whichever is smaller
          const usableWidth = actualWidth - padding;
          
          // Calculate font size with more aggressive sizing to fill screen
          // Use a more accurate ratio for monospace fonts
          const charWidthRatio = 0.6; // More accurate estimate for character width
          const safetyMargin = 0.95; // Use 95% of calculated space for better screen utilization
          const theoreticalFontSize = Math.floor((usableWidth / asciiWidth) / charWidthRatio);
          const conservativeFontSize = Math.floor(theoreticalFontSize * safetyMargin);
          const dynamicFontSize = Math.max(6, Math.min(24, conservativeFontSize)); // Increased min/max
          
          // Create dynamic config with calculated font size
          const dynamicConfig = {
            ...terminalConfig,
            fontSize: dynamicFontSize
          };
          
          console.log(`Space: ${actualWidth}px, Usable: ${usableWidth}px, Theoretical: ${theoreticalFontSize}px, Conservative: ${conservativeFontSize}px, Final: ${dynamicFontSize}px`);
          
          // Initialize xterm.js with dynamic config
          const xterm = new Terminal(dynamicConfig);

          // Initialize fit addon
          const fitAddon = new FitAddon();
          xterm.loadAddon(fitAddon);

          // Initialize web links addon for clickable URLs
          const webLinksAddon = new WebLinksAddon();
          xterm.loadAddon(webLinksAddon);

          // Open terminal
          xterm.open(terminalRef.current!);

          // Store references
          xtermRef.current = xterm;
          fitAddonRef.current = fitAddon;

          // Handle terminal input
          const dataDisposable = xterm.onData((data) => {
            console.log(
              "xterm.js onData received:",
              JSON.stringify(data),
              "char codes:",
              data.split("").map((c) => c.charCodeAt(0)),
            );
            onData(data);
          });

          // Handle terminal resize
          const resizeDisposable = xterm.onResize(({ cols, rows }) => {
            console.log("Terminal resized to:", cols, "x", rows);
            onResize(cols, rows);
          });

          // Fit terminal after a short delay to ensure DOM is ready
          setTimeout(() => {
            fitAddon.fit();
            // Send initial resize to backend
            const { cols, rows } = xterm;
            console.log("Initial terminal size:", cols, "x", rows);
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
            // Handle tab key for completion
            if (event.key === 'Tab' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
              // Let the tab go through, but we'll handle the response properly
              // The issue is likely in how the shell responds to tab completion
              // Don't prevent default here - let normal tab completion work
            }
            else if ((event.ctrlKey || event.metaKey) && event.key === "v") {
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
              // Recalculate font size on resize
              const asciiWidth = 139;
              const viewportWidth = window.innerWidth;
              const documentWidth = document.documentElement.clientWidth;
              const containerWidth = terminalRef.current.clientWidth;
              const containerRect = terminalRef.current.getBoundingClientRect();
              const actualWidth = Math.min(viewportWidth, documentWidth, containerWidth, containerRect.width);
              const padding = Math.min(10, actualWidth * 0.02);
              const usableWidth = actualWidth - padding;
              const charWidthRatio = 0.6;
              const safetyMargin = 0.95;
              const theoreticalFontSize = Math.floor((usableWidth / asciiWidth) / charWidthRatio);
              const conservativeFontSize = Math.floor(theoreticalFontSize * safetyMargin);
              const newFontSize = Math.max(6, Math.min(24, conservativeFontSize));
              
              // Update font size if it changed significantly
              const currentFontSize = xterm.options.fontSize || dynamicConfig.fontSize;
              if (Math.abs(currentFontSize - newFontSize) > 1) {
                xterm.options.fontSize = newFontSize;
                console.log(`Resized - New font size: ${newFontSize}px`);
              }
              
              fitAddon.fit();
              }
            }, 150); // 150ms debounce
          };

          window.addEventListener("resize", handleResize);
          setIsReady(true);

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
        console.log("Terminal component cleanup triggered");
        cleanupFunctions.forEach((cleanup) => {
          try {
            cleanup();
          } catch (error) {
            console.error("Error during terminal cleanup:", error);
          }
        });
        xtermRef.current = null;
        fitAddonRef.current = null;
        setIsReady(false);
      };
    }, [onData, onResize]);

    // Method to write data to terminal
    const writeToTerminal = (data: string) => {
      if (xtermRef.current) {
        xtermRef.current.write(data);
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

