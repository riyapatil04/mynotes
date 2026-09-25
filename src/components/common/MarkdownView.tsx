import ReactMarkdown from 'react-markdown';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export default function MarkdownView({ content, className = '' }: MarkdownViewProps) {
  if (!content.trim()) {
    return <p className="text-sm text-gray-400 dark:text-gray-500 italic">Nothing written yet.</p>;
  }
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
