import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-innozenx max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-6 mb-3 font-display text-2xl font-semibold tracking-tight text-foreground first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-6 mb-2 font-display text-lg font-semibold tracking-tight text-foreground first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-5 mb-2 font-display text-[15px] font-semibold tracking-tight text-foreground/90">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-2.5 text-[14px] leading-relaxed text-foreground/85">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-2.5 ml-5 list-disc space-y-1.5 text-[14px] text-foreground/85 marker:text-primary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 ml-5 list-decimal space-y-1.5 text-[14px] text-foreground/85 marker:text-accent marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="text-foreground/90">{children}</em>,
          code: ({ children }) => (
            <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[12.5px] text-accent">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-lg border border-border bg-surface-2 p-3 font-mono text-[12.5px] text-foreground/90">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-primary/60 pl-3 text-foreground/80 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-5 border-border" />,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-2 hover:text-accent/80">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
