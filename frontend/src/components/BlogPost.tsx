import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

// Gruvbox Dark — exact hex values that xterm's terminalTheme uses so the
// mobile HTML view is visually identical to the desktop xterm view.
const BG = '#1d2021';
const FG = '#ebdbb2';
const DIM = '#928374';
const RED = '#cc241d';
const BRIGHT_RED = '#fb4934';
const BRIGHT_GREEN = '#b8bb26';
const BRIGHT_YELLOW = '#fabd2f';
const BRIGHT_BLUE = '#83a598';
const BRIGHT_CYAN = '#8ec07c';
const YELLOW = '#d79921';
const CODE_BG = '#282828';      // Gruvbox "soft" background, subtle contrast to hard BG
const CODE_BORDER = '#3c3836';

const components: Components = {
  // Headings match mdcat's bold blue for h1 and slightly dimmer hues for h2/h3.
  h1: ({ children }) => (
    <h1 style={{ color: BRIGHT_BLUE, fontWeight: 'bold', fontSize: '1.5rem', lineHeight: 1.25, marginTop: '1.5rem', marginBottom: '0.75rem' }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ color: BRIGHT_YELLOW, fontWeight: 'bold', fontSize: '1.125rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ color: BRIGHT_GREEN, fontWeight: 'bold', fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p style={{ color: FG, marginBottom: '1rem', lineHeight: 1.55 }}>{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: BRIGHT_CYAN, textDecoration: 'underline', textUnderlineOffset: 2 }}
    >
      {children}
    </a>
  ),
  code: ({ children, className }) => {
    // Fenced code with no language specifier has no `language-` className,
    // so detect block mode by content (multi-line) too. Otherwise a `````
    // prompt with no lang tag gets inline styling and never wraps.
    const content = String(children ?? '');
    const isBlock = className?.startsWith('language-') || content.includes('\n');
    if (isBlock) {
      // NOTE: whitespace-pre-wrap instead of pre — lines wrap on mobile so
      // the block never pushes the page wider than the viewport. overflow-
      // wrap:anywhere lets very long tokens (URLs, slugs) break as needed.
      return (
        <code
          style={{
            display: 'block',
            background: CODE_BG,
            color: BRIGHT_YELLOW,
            border: `1px solid ${CODE_BORDER}`,
            borderRadius: 4,
            padding: '12px 14px',
            fontSize: '0.85rem',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
          }}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        style={{
          background: CODE_BG,
          color: BRIGHT_YELLOW,
          padding: '1px 6px',
          borderRadius: 3,
          fontSize: '0.9em',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        }}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre style={{ marginBottom: '1rem' }}>{children}</pre>,
  blockquote: ({ children }) => (
    <blockquote
      style={{
        borderLeft: `2px solid ${DIM}`,
        paddingLeft: '1rem',
        color: DIM,
        fontStyle: 'italic',
        margin: '1rem 0',
      }}
    >
      {children}
    </blockquote>
  ),
  ul: ({ children }) => <ul style={{ listStyle: 'disc', listStylePosition: 'outside', marginBottom: '1rem', paddingLeft: '1.5rem', color: FG }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ listStyle: 'decimal', listStylePosition: 'outside', marginBottom: '1rem', paddingLeft: '1.5rem', color: FG }}>{children}</ol>,
  li: ({ children }) => <li style={{ color: FG, marginBottom: '0.25rem' }}>{children}</li>,
  hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${CODE_BORDER}`, margin: '1.5rem 0' }} />,
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', marginBottom: '1rem', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead style={{ borderBottom: `1px solid ${DIM}` }}>{children}</thead>,
  th: ({ children }) => (
    <th style={{ textAlign: 'left', color: BRIGHT_YELLOW, padding: '8px 12px', fontWeight: 'bold' }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{ color: FG, padding: '8px 12px', borderBottom: `1px solid ${CODE_BORDER}` }}>{children}</td>
  ),
  strong: ({ children }) => <strong style={{ color: '#fbf1c7', fontWeight: 'bold' }}>{children}</strong>,
  em: ({ children }) => <em style={{ color: DIM, fontStyle: 'italic' }}>{children}</em>,
};

interface Props {
  slug: string;
  title: string;
  date?: string;
  body: string;
}

export default function BlogPost({ slug, title, date, body }: Props) {
  const terminalSlug = slug.replace(/ /g, '%20');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        color: FG,
        fontFamily: '"JetBrainsMono Nerd Font Mono", "JetBrainsMono Nerd Font", "JetBrains Mono", ui-monospace, monospace',
      }}
    >
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '24px 14px' }}>
        {/* zsh / oh-my-posh pure-modified prompt — red user, light path, newline, red ❯ */}
        <div style={{ fontSize: '0.9rem', marginBottom: '1.25rem', userSelect: 'none' }}>
          <span style={{ color: RED }}>tim.waldin.net </span>
          <span style={{ color: '#fbf1c7' }}>~ </span>
          <br />
          <span style={{ color: RED }}>❯ </span>
          <span style={{ color: FG }}>blog {slug}</span>
        </div>

        {/* Post header — matches mdcat's styling (big blue title, dim date) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ color: BRIGHT_BLUE, fontWeight: 'bold', fontSize: '1.5rem', lineHeight: 1.25, marginBottom: '0.25rem' }}>
            {title}
          </h1>
          {date && <div style={{ color: DIM, fontStyle: 'italic', fontSize: '0.9rem' }}>{date}</div>}
        </div>

        {/* Rendered content */}
        <div style={{ marginBottom: '2rem' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {body}
          </ReactMarkdown>
        </div>

        {/* Footer — mdcat's navigation line at the bottom of a rendered post */}
        <div style={{ borderTop: `1px solid ${CODE_BORDER}`, paddingTop: '1rem', marginTop: '1.5rem', fontSize: '0.85rem', color: DIM }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <strong style={{ color: FG, fontWeight: 'bold' }}>navigation</strong>
            <span> — </span>
            <Link href="/" style={{ color: BRIGHT_CYAN, textDecoration: 'underline', marginRight: '1rem' }}>welcome</Link>
            <Link href="/t/blog" style={{ color: BRIGHT_CYAN, textDecoration: 'underline', marginRight: '1rem' }}>blog</Link>
            <Link href="/t/projects" style={{ color: BRIGHT_CYAN, textDecoration: 'underline', marginRight: '1rem' }}>projects</Link>
            <Link href="/t/resume" style={{ color: BRIGHT_CYAN, textDecoration: 'underline' }}>resume</Link>
          </div>
          <Link
            href={`/t/blog/${terminalSlug}`}
            style={{
              display: 'inline-block',
              color: BRIGHT_GREEN,
              border: `1px solid ${BRIGHT_GREEN}`,
              padding: '4px 10px',
              fontSize: '0.8rem',
              marginTop: '0.5rem',
            }}
          >
            ▸ open in terminal
          </Link>
        </div>

        {/* Idle prompt line — blinking cursor below the content */}
        <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', userSelect: 'none' }}>
          <span style={{ color: RED }}>tim.waldin.net </span>
          <span style={{ color: '#fbf1c7' }}>~ </span>
          <br />
          <span style={{ color: RED }}>❯ </span>
          <span
            style={{
              display: 'inline-block',
              width: '0.6em',
              height: '1em',
              background: FG,
              verticalAlign: 'text-bottom',
              animation: 'blogCursor 1s steps(1) infinite',
            }}
          />
        </div>
        <style>{`@keyframes blogCursor { 0%,50% { opacity: 1 } 51%,100% { opacity: 0 } }`}</style>
      </div>
    </div>
  );
}
