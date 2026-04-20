import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

const components: Components = {
  h1: ({ children }) => <h1 className="text-green-400 text-xl font-bold mt-6 mb-3">{children}</h1>,
  h2: ({ children }) => <h2 className="text-green-400 text-lg font-bold mt-5 mb-2 border-b border-gray-800 pb-1">{children}</h2>,
  h3: ({ children }) => <h3 className="text-green-300 font-bold mt-4 mb-2">{children}</h3>,
  p: ({ children }) => <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
      {children}
    </a>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-');
    return isBlock
      ? <code className="block bg-gray-900 text-cyan-300 rounded px-4 py-3 overflow-x-auto text-sm whitespace-pre">{children}</code>
      : <code className="bg-gray-900 text-cyan-300 rounded px-1.5 py-0.5 text-sm">{children}</code>;
  },
  pre: ({ children }) => <pre className="mb-4">{children}</pre>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-green-700 pl-4 text-gray-400 italic my-4">{children}</blockquote>
  ),
  ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1 ml-2">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1 ml-2">{children}</ol>,
  li: ({ children }) => <li className="text-gray-300">{children}</li>,
  hr: () => <hr className="border-gray-800 my-6" />,
  table: ({ children }) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-gray-700">{children}</thead>,
  th: ({ children }) => <th className="text-left text-green-400 px-3 py-2 font-medium">{children}</th>,
  td: ({ children }) => <td className="text-gray-300 px-3 py-2 border-b border-gray-900">{children}</td>,
  strong: ({ children }) => <strong className="text-gray-100 font-semibold">{children}</strong>,
  em: ({ children }) => <em className="text-gray-400 italic">{children}</em>,
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
    <div className="min-h-screen bg-black text-gray-300 font-mono">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* fake prompt header */}
        <div className="text-gray-600 text-sm mb-6 select-none">
          <span className="text-green-600">portfolio@twaldin</span>
          <span className="text-gray-600">:</span>
          <span className="text-blue-500">~</span>
          <span className="text-gray-600"> $ </span>
          <span className="text-white">blog {slug}</span>
        </div>

        {/* post header */}
        <div className="mb-8">
          <h1 className="text-green-400 text-2xl font-bold leading-tight mb-2">{title}</h1>
          {date && <div className="text-gray-600 text-sm">{date}</div>}
        </div>

        {/* content */}
        <div className="mb-12">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {body}
          </ReactMarkdown>
        </div>

        {/* footer nav */}
        <div className="border-t border-gray-900 pt-6 text-sm text-gray-600">
          <div className="mb-3">
            <span className="text-gray-700">navigation — </span>
            <Link href="/" className="text-cyan-700 hover:text-cyan-500 mr-4">welcome</Link>
            <Link href="/t/blog" className="text-cyan-700 hover:text-cyan-500 mr-4">blog</Link>
            <Link href="/t/projects" className="text-cyan-700 hover:text-cyan-500 mr-4">projects</Link>
            <Link href="/t/resume" className="text-cyan-700 hover:text-cyan-500">resume</Link>
          </div>
          <Link
            href={`/t/blog/${terminalSlug}`}
            className="inline-block mt-2 text-green-700 hover:text-green-500 border border-green-900 hover:border-green-700 px-3 py-1 text-xs transition-colors"
          >
            ▸ open in terminal
          </Link>
        </div>

        {/* idle prompt */}
        <div className="mt-8 text-gray-700 text-sm select-none">
          <span className="text-green-800">portfolio@twaldin</span>
          <span className="text-gray-800">:</span>
          <span className="text-blue-900">~</span>
          <span className="text-gray-800"> $ </span>
          <span className="animate-pulse">▌</span>
        </div>
      </div>
    </div>
  );
}
