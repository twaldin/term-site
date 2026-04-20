import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

export const BG = '#1d2021';
export const FG = '#ebdbb2';
export const DIM = '#928374';
export const RED = '#cc241d';
export const BRIGHT_GREEN = '#b8bb26';
export const BRIGHT_YELLOW = '#fabd2f';
export const BRIGHT_BLUE = '#83a598';
export const BRIGHT_CYAN = '#8ec07c';
export const CODE_BG = '#282828';
export const CODE_BORDER = '#3c3836';

export const markdownComponents: Components = {
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
    const content = String(children ?? '');
    const isBlock = className?.startsWith('language-') || content.includes('\n');
    if (isBlock) {
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
  ul: ({ children }) => (
    <ul style={{ listStyle: 'disc', listStylePosition: 'outside', marginBottom: '1rem', paddingLeft: '1.5rem', color: FG }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ listStyle: 'decimal', listStylePosition: 'outside', marginBottom: '1rem', paddingLeft: '1.5rem', color: FG }}>
      {children}
    </ol>
  ),
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

export interface BlogBlockProps {
  slug: string;
  title: string;
  date?: string;
  body: string;
}

export function BlogMarkdown({ slug, title, date, body }: BlogBlockProps) {
  return (
    <>
      <div style={{ fontSize: '0.9rem', marginBottom: '1.25rem', userSelect: 'none' }}>
        <span style={{ color: RED }}>tim.waldin.net </span>
        <span style={{ color: '#fbf1c7' }}>~ </span>
        <br />
        <span style={{ color: RED }}>❯ </span>
        <span style={{ color: FG }}>blog {slug}</span>
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: BRIGHT_BLUE, fontWeight: 'bold', fontSize: '1.5rem', lineHeight: 1.25, marginBottom: '0.25rem' }}>
          {title}
        </h1>
        {date && <div style={{ color: DIM, fontStyle: 'italic', fontSize: '0.9rem' }}>{date}</div>}
      </div>
      <div style={{ marginBottom: '2rem' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {body}
        </ReactMarkdown>
      </div>
    </>
  );
}
