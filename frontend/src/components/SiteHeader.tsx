import { terminalTheme } from '@/config/terminal-theme';

function lightenHex(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + amount);
  const g = Math.min(255, ((n >> 8) & 0xff) + amount);
  const b = Math.min(255, (n & 0xff) + amount);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

const BG     = terminalTheme.background;
const BORDER = terminalTheme.brightBlack;
const BRAND  = terminalTheme.brightMagenta;
const LINK   = lightenHex(terminalTheme.brightMagenta, 50);
const DIM    = terminalTheme.brightBlack;

export default function SiteHeader() {
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
      <a href="/" style={{ color: BRAND, textDecoration: 'none', fontWeight: 'bold' }}>
        tim.waldin.net
      </a>
      <nav style={{ display: 'flex', gap: '12px', alignItems: 'center', color: DIM }}>
        <span>navigation —</span>
        <a href="/" style={linkStyle}>home</a>
        <a href="/t/blog" style={linkStyle}>blog</a>
        <a href="/t/projects" style={linkStyle}>projects</a>
        <a href="/t/resume" style={linkStyle}>resume</a>
      </nav>
    </header>
  );
}
