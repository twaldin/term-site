"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BlogMarkdown,
  BlogBlockProps,
  BG,
  FG,
  DIM,
  BRIGHT_CYAN,
  CODE_BORDER,
} from '@/lib/markdown-components';
import { terminalConfig } from '@/config/terminal-theme';

// ANSI fake prompt matching the backend's zsh / oh-my-posh prompt
const ANSI_PROMPT =
  '\x1b[38;2;204;36;29mportfolio \x1b[38;2;251;241;199m~ \r\n\x1b[38;2;204;36;29m❯ \x1b[0m';

const CHAR_WIDTH_RATIO = 0.6;
const MOBILE_BREAKPOINT = 768;

async function loadNerdFont(): Promise<void> {
  try {
    const reg = new FontFace(
      'JetBrainsMono Nerd Font Mono',
      'url(/fonts/JetBrainsMonoNerdFontMono-Regular.woff2) format("woff2")',
      { weight: 'normal', style: 'normal' },
    );
    const bold = new FontFace(
      'JetBrainsMono Nerd Font Mono',
      'url(/fonts/JetBrainsMonoNerdFontMono-Bold.woff2) format("woff2")',
      { weight: 'bold', style: 'normal' },
    );
    await Promise.all([reg.load(), bold.load()]);
    document.fonts.add(reg);
    document.fonts.add(bold);
  } catch {
    /* fallback to system monospace */
  }
}

interface Props {
  slug: string;
  title: string;
  date?: string;
  body: string;
  allSlugs: string[];
}

export default function BlogUnifiedPage({ slug, title, date, body, allSlugs }: Props) {
  const [blocks, setBlocks] = useState<BlogBlockProps[]>([{ slug, title, date, body }]);

  const hostRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<import('@xterm/xterm').Terminal | null>(null);
  const socketRef = useRef<{
    connected: boolean;
    on: (ev: string, cb: (...a: unknown[]) => void) => unknown;
    emit: (ev: string, ...a: unknown[]) => unknown;
    disconnect: () => unknown;
  } | null>(null);
  const warmedRef = useRef(false);
  const handedOverRef = useRef(false);
  const inputBufRef = useRef<string[]>([]);
  const cmdBufRef = useRef('');
  const grownRef = useRef(false);
  const allSlugsRef = useRef(allSlugs);

  useEffect(() => {
    allSlugsRef.current = allSlugs;
  }, [allSlugs]);

  useEffect(() => {
    if (!hostRef.current || typeof window === 'undefined') return;
    let disposed = false;
    const cleanups: Array<() => void> = [];

    Promise.all([
      loadNerdFont(),
      import('@xterm/xterm'),
      import('@xterm/addon-web-links'),
      import('socket.io-client'),
    ]).then(([, xtermMod, linksMod, ioMod]) => {
      if (disposed || !hostRef.current) return;
      const { Terminal } = xtermMod;
      const { WebLinksAddon } = linksMod;
      const { io } = ioMod;

      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const fontSize = isMobile ? 13 : 14;

      // cols: fit within the maxWidth container minus all horizontal padding
      const parentEl = hostRef.current.parentElement;
      const parentWidth = parentEl ? parentEl.clientWidth : window.innerWidth;
      const outerPaddingH = 28; // outer container 14px * 2
      const hostPaddingH = 24;  // host div 12px * 2
      const usableWidth = Math.max(200, parentWidth - outerPaddingH - hostPaddingH);
      const charWidth = fontSize * CHAR_WIDTH_RATIO;
      const cols = Math.max(40, Math.floor(usableWidth / charWidth));

      const xterm = new Terminal({
        ...terminalConfig,
        cols,
        rows: 3,
        fontSize,
        scrollback: 1000,
        disableStdin: false,
      });

      const openLink = (_e: MouseEvent, href: string) =>
        window.open(href, '_blank', 'noopener,noreferrer');
      xterm.loadAddon(new WebLinksAddon(openLink));
      xterm.options.linkHandler = { activate: openLink, allowNonHttpProtocols: true };

      xterm.open(hostRef.current);
      xtermRef.current = xterm;

      // Write the initial fake prompt
      xterm.write(ANSI_PROMPT);

      // ── Grow xterm on first keypress ──────────────────────────────────
      const growXterm = () => {
        if (grownRef.current) return;
        grownRef.current = true;
        xterm.resize(cols, 20);
        setTimeout(() => {
          hostRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }, 50);
      };

      // ── Erase fake prompt before first backend output ─────────────────
      const eraseFakePrompt = () => {
        if (handedOverRef.current) return;
        handedOverRef.current = true;
        xterm.write('\r\x1b[2K\x1b[A\r\x1b[2K');
      };

      // ── Open WebSocket (once) ─────────────────────────────────────────
      const startLive = () => {
        if (warmedRef.current) return;
        warmedRef.current = true;
        const url = `${window.location.protocol}//${window.location.host}`;
        const socket = io(url, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          upgrade: true,
          rememberUpgrade: true,
          auth: { initCommand: '' },
        }) as typeof socketRef.current;
        socketRef.current = socket;

        socket!.on('connect', () => {
          socket!.emit('resize', { cols: xterm.cols, rows: xterm.rows });
        });

        socket!.on('output', (data) => {
          if (typeof data !== 'string') return;
          const wasFirst = !handedOverRef.current;
          eraseFakePrompt();
          xterm.write(data);
          if (wasFirst && inputBufRef.current.length > 0 && socket!.connected) {
            for (const ch of inputBufRef.current.splice(0)) {
              socket!.emit('input', ch);
            }
          }
        });

        socket!.on('disconnect', () => {
          warmedRef.current = false;
        });
      };

      // ── Frontend blog intercept ───────────────────────────────────────
      const handleBlogIntercept = async (blogSlug: string): Promise<boolean> => {
        if (!allSlugsRef.current.includes(blogSlug)) return false;
        try {
          const res = await fetch(`/api/blog/${blogSlug}`);
          if (!res.ok) return false;
          const data = await res.json() as BlogBlockProps;
          setBlocks(prev => [...prev, { slug: data.slug, title: data.title, date: data.date, body: data.body }]);
          history.pushState(null, '', '/blog/' + blogSlug);
          xtermRef.current?.write(`\r\n${ANSI_PROMPT}`);
          return true;
        } catch {
          return false;
        }
      };

      // ── Data handler ──────────────────────────────────────────────────
      const dataDisposable = xterm.onData((data) => {
        // Grow + start WS on first keypress
        growXterm();

        if (data === '\r') {
          const buf = cmdBufRef.current;
          cmdBufRef.current = '';

          const m = buf.match(/^\s*blog\s+([a-z0-9-]+)\s*$/);
          if (m) {
            const s = socketRef.current;
            if (s?.connected) {
              // Clear backend's readline buffer silently so it doesn't execute
              s.emit('input', '\x15');
            } else {
              // Not yet flushed to backend — clear inputBuf too
              inputBufRef.current = [];
            }
            handleBlogIntercept(m[1]);
            return;
          }
          // Not a blog intercept — forward \r normally
        } else if (data === '\x7f') {
          cmdBufRef.current = cmdBufRef.current.slice(0, -1);
        } else if (data.length === 1 && data >= ' ' && data <= '~') {
          cmdBufRef.current += data;
        }

        const s = socketRef.current;
        if (s?.connected) {
          s.emit('input', data);
        } else {
          inputBufRef.current.push(data);
          startLive();
        }
      });

      cleanups.push(() => dataDisposable.dispose());
      cleanups.push(() => {
        try { socketRef.current?.disconnect(); } catch { /* ignore */ }
      });
      cleanups.push(() => xterm.dispose());
    });

    return () => {
      disposed = true;
      for (const fn of cleanups) {
        try { fn(); } catch { /* ignore */ }
      }
    };
  }, []); // stable: setBlocks (React guarantee), allSlugsRef (ref)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        color: FG,
        fontFamily:
          '"JetBrainsMono Nerd Font Mono", "JetBrainsMono Nerd Font", "JetBrains Mono", ui-monospace, monospace',
      }}
    >
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '24px 14px' }}>
        {/* Rendered blog content blocks */}
        {blocks.map((block, i) => (
          <BlogMarkdown key={`${block.slug}-${i}`} {...block} />
        ))}

        {/* Footer nav */}
        <div
          style={{
            borderTop: `1px solid ${CODE_BORDER}`,
            paddingTop: '1rem',
            marginTop: '1.5rem',
            fontSize: '0.85rem',
            color: DIM,
            marginBottom: '1.5rem',
          }}
        >
          <strong style={{ color: FG, fontWeight: 'bold' }}>navigation</strong>
          <span> — </span>
          <Link href="/" style={{ color: BRIGHT_CYAN, textDecoration: 'underline', marginRight: '1rem' }}>
            welcome
          </Link>
          <Link href="/t/blog" style={{ color: BRIGHT_CYAN, textDecoration: 'underline', marginRight: '1rem' }}>
            blog
          </Link>
          <Link href="/t/projects" style={{ color: BRIGHT_CYAN, textDecoration: 'underline', marginRight: '1rem' }}>
            projects
          </Link>
          <Link href="/t/resume" style={{ color: BRIGHT_CYAN, textDecoration: 'underline' }}>
            resume
          </Link>
        </div>

        {/* Live xterm — 3 rows initially, grows to 20 on first keypress */}
        <div
          ref={hostRef}
          style={{
            display: 'inline-block',
            padding: '8px 12px',
            minWidth: '100%',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
}
