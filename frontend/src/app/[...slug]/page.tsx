import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isValidPath, getPageMetadata } from '@/lib/routes';
import Home from '../page';

type Params = { slug?: string[] };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const pathname = '/' + (slug ?? []).join('/');
  const m = getPageMetadata(pathname);
  return {
    title: m.title,
    description: m.description,
    openGraph: { title: m.title, description: m.description, url: `https://tim.waldin.net${pathname}`, siteName: 'twaldin', type: 'website' },
    twitter: { card: 'summary', title: m.title, description: m.description },
  };
}

export default async function CatchAll({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const pathname = '/' + (slug ?? []).join('/');
  if (!isValidPath(pathname)) notFound();
  return <Home />;
}
