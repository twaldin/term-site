import Link from 'next/link';

const BG = '#1d2021';
const BORDER = '#3c3836';
const BRAND = '#cc241d';
const LINK = '#8ec07c';
const DIM = '#928374';

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
      <Link href="/" style={{ color: BRAND, textDecoration: 'none', fontWeight: 'bold' }}>
        tim.waldin.net
      </Link>
      <nav style={{ display: 'flex', gap: '12px', alignItems: 'center', color: DIM }}>
        <span>navigation —</span>
        <Link href="/" style={linkStyle}>home</Link>
        <Link href="/t/blog" style={linkStyle}>blog</Link>
        <Link href="/t/projects" style={linkStyle}>projects</Link>
        <Link href="/t/resume" style={linkStyle}>resume</Link>
      </nav>
    </header>
  );
}
