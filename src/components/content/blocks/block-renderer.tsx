import React, {JSX} from 'react';
import { Block } from './block-types';
import { cn } from '@/lib/utils';
import { Code, AlertCircle } from 'lucide-react';

interface BlockRendererProps {
  block: Block;
  className?: string;
}

export function BlockRenderer({ block, className }: BlockRendererProps) {
  switch (block.type) {
    case 'text':
      return (
        <p className={cn("text-base leading-7", className)}>
          <span
            className={cn({
              'font-bold': block.formatting?.bold,
              'italic': block.formatting?.italic,
              'underline': block.formatting?.underline,
              'line-through': block.formatting?.strikethrough,
            })}
          >
            {block.content}
          </span>
        </p>
      );

    case 'heading':
      const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag
          className={cn(
            "font-bold tracking-tight",
            {
              'text-4xl': block.level === 1,
              'text-3xl': block.level === 2,
              'text-2xl': block.level === 3,
            },
            className
          )}
        >
          {block.content}
        </HeadingTag>
      );

    case 'image':
      return (
        <figure className={cn("my-4", className)}>
          <img
            src={block.url}
            alt={block.alt || block.caption || ''}
            className="rounded-lg object-cover w-full"
          />
          {block.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'code':
      return (
        <div className={cn("relative my-4 rounded-lg", className)}>
          <div className="absolute right-4 top-4">
            <Code className="h-4 w-4 text-muted-foreground" />
          </div>
          <pre className="overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-sm">
            <code>{block.content}</code>
          </pre>
        </div>
      );

    case 'quote':
      return (
        <blockquote className={cn("my-4 border-l-4 pl-6 italic", className)}>
          <p>{block.content}</p>
          {block.attribution && (
            <footer className="mt-2 text-sm text-muted-foreground">
              — {block.attribution}
            </footer>
          )}
        </blockquote>
      );

    case 'bullet-list':
    case 'numbered-list':
      const ListTag = block.type === 'bullet-list' ? 'ul' : 'ol';
      return (
        <ListTag
          className={cn(
            "my-4 ml-6",
            {
              'list-disc': block.type === 'bullet-list',
              'list-decimal': block.type === 'numbered-list',
            },
            className
          )}
        >
          {block.items.map((item, index) => (
            <li key={item.id || index} className="mt-2">
              {item.content}
            </li>
          ))}
        </ListTag>
      );

    case 'callout':
      return (
        <div
          className={cn(
            "my-4 rounded-lg border p-4",
            {
              'bg-blue-50 border-blue-200': block.variant === 'info',
              'bg-yellow-50 border-yellow-200': block.variant === 'warning',
              'bg-red-50 border-red-200': block.variant === 'error',
              'bg-green-50 border-green-200': block.variant === 'success',
            },
            className
          )}
        >
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>{block.content}</div>
          </div>
        </div>
      );

    case 'divider':
      return <hr className={cn("my-4 border-t", className)} />;

    default:
      return null;
  }
}