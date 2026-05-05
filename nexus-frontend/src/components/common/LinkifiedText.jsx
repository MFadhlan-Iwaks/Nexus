'use client';

const urlPattern = /(https?:\/\/[^\s]+)/g;

export default function LinkifiedText({ text, className = '' }) {
  const content = String(text || '');
  const parts = content.split(urlPattern);

  return (
    <p className={`whitespace-pre-line ${className}`}>
      {parts.map((part, index) => {
        if (!part.startsWith('http://') && !part.startsWith('https://')) return part;
        return (
          <a
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-800"
          >
            {part}
          </a>
        );
      })}
    </p>
  );
}
