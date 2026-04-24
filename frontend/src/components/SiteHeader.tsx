'use client';

import Link from 'next/link';
import { terminalTheme } from '@/config/terminal-theme';

const BG     = terminalTheme.background;
const BORDER = terminalTheme.brightBlack;
const BRAND  = terminalTheme.red;
const LINK   = terminalTheme.green;
const DIM    = terminalTheme.brightBlack;

export default function SiteHeader() {
  const handleNav = (cmd: string) => (e: React.MouseEvent) => {
    const w = window as Window & { __terminalSendCommand?: (cmd: string) => void };
    if (w.__terminalSendCommand) {
      e.preventDefault();
      w.__terminalSendCommand(cmd);
    }
  };

  const linkStyle: React.CSSProperties = {
    color: LINK,
    textDecoration: 'none',
  };

  return (
    <header
      style={{
        background: BG,
        borderBottom: `1px solid ${BORDER}`,
        padding: '6px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        rowGap: '4px',
        columnGap: '12px',
        fontSize: '13px',
        fontFamily:
          '"JetBrainsMono Nerd Font Mono", "JetBrainsMono Nerd Font", "JetBrains Mono", ui-monospace, monospace',
        flexShrink: 0,
      }}
    >
      <Link href="/" onClick={handleNav('welcome')} style={{ color: BRAND, textDecoration: 'none', fontWeight: 'bold' }}>
        tim.waldin.net
      </Link>
      <nav style={{ display: 'flex', gap: '12px', alignItems: 'center', color: DIM }}>
        <span>navigation —</span>
        <Link href="/" onClick={handleNav('welcome')} style={linkStyle}>home</Link>
        <Link href="/t/blog" onClick={handleNav('blog')} style={linkStyle}>blog</Link>
        <Link href="/t/projects" onClick={handleNav('projects')} style={linkStyle}>projects</Link>
        <Link href="/t/resume" onClick={handleNav('resume')} style={linkStyle}>resume</Link>
      </nav>
    </header>
  );
}
