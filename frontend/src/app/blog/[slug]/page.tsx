import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { notFound } from 'next/navigation';
import BlogPost from '@/components/BlogPost';

const POSTS_DIR = join(process.cwd(), 'blog-posts');

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body: match[2] };
}

export async function generateStaticParams() {
  if (!existsSync(POSTS_DIR)) return [];
  return readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => ({ slug: f.slice(0, -3) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = join(POSTS_DIR, `${slug}.md`);
  if (!existsSync(filePath)) return { title: 'Post not found' };
  const { meta } = parseFrontmatter(readFileSync(filePath, 'utf-8'));
  return { title: meta.title || slug };
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = join(POSTS_DIR, `${slug}.md`);
  if (!existsSync(filePath)) notFound();

  const { meta, body } = parseFrontmatter(readFileSync(filePath, 'utf-8'));

  return (
    <BlogPost
      slug={slug}
      title={meta.title || slug}
      date={meta.date}
      body={body}
    />
  );
}
