import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  GripVertical,
  Trash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlockToolbarProps {
  onFormatText?: (format: string) => void;
  onDelete?: () => void;
  onDragStart?: () => void;
  formats?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
  };
  className?: string;
}

export function BlockToolbar({
  onFormatText,
  onDelete,
  onDragStart,
  formats = {},
  className,
}: BlockToolbarProps) {
  return (
    <div
      className={cn(
        "absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1",
        className
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 cursor-move"
        onMouseDown={onDragStart}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </Button>
      
      {onFormatText && (
        <>
          <Button
            variant={formats.bold ? "default" : "ghost"}
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onFormatText('bold')}
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            variant={formats.italic ? "default" : "ghost"}
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onFormatText('italic')}
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button
            variant={formats.underline ? "default" : "ghost"}
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onFormatText('underline')}
          >
            <Underline className="h-3 w-3" />
          </Button>
          <Button
            variant={formats.strikethrough ? "default" : "ghost"}
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onFormatText('strikethrough')}
          >
            <Strikethrough className="h-3 w-3" />
          </Button>
        </>
      )}

      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:text-destructive"
          onClick={onDelete}
        >
          <Trash className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}