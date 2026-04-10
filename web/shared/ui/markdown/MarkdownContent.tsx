"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { cn } from "@shared/lib";
import { Dot } from "lucide-react";

const markdownComponents: Components = {
  h1: ({ className, ...props }) => <h1 className={cn(className)} {...props} />,
  h2: ({ className, ...props }) => <h2 className={cn(className)} {...props} />,
  h3: ({ className, ...props }) => <h3 className={cn(className)} {...props} />,
  p: ({ className, ...props }) => <p className={cn(className)} {...props} />,
  ul: ({ className, ...props }) => (
    <ul
      className={cn("m-0 grid gap-2 pl-5 text-sm text-text/92", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn("m-0 grid gap-2 pl-5 text-sm text-text/92", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <div className="flex items-start gap-1 ">
      <Dot className="w-6 h-6 text-accent pt-2" />
      <li className={cn("leading-7", className)} {...props} />
    </div>
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn(
        "font-medium text-accent underline underline-offset-4",
        className
      )}
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "m-0 border-l-2 border-accent/40 pl-4 text-sm italic leading-7 text-muted",
        className
      )}
      {...props}
    />
  ),

  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "overflow-x-auto rounded-2xl border border-border bg-panel-solid p-4 text-[13px] text-text",
        className
      )}
      {...props}
    />
  ),
  img: ({ className, alt, ...props }) => (
    <img
      className={cn(
        "w-full rounded-2xl border border-border object-cover",
        className
      )}
      alt={alt ?? "route content image"}
      {...props}
    />
  ),
};

export function MarkdownContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
