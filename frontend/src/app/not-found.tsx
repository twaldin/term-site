import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: '404 — twaldin' };

export default function NotFound() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d0d0d',
      fontFamily: 'monospace',
      color: '#e0e0e0',
      padding: '2rem',
    }}>
      <p style={{ color: '#ff5f57', fontSize: '1.1rem', margin: 0 }}>
        bash: command not found
      </p>
      <p style={{ color: '#6c6c6c', fontSize: '0.9rem', marginTop: '0.5rem' }}>
        404 — that path doesn&apos;t exist
      </p>
      <Link
        href="/"
        style={{ color: '#57c7ff', marginTop: '1.5rem', textDecoration: 'none', fontSize: '0.9rem' }}
      >
        ← cd /
      </Link>
    </div>
  );
}
