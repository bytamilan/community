import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Block } from './blocks/block-types';
import { BlockRenderer } from './blocks/block-renderer';
import { BlockToolbar } from './blocks/block-toolbar';
import { useBlockDragAndDrop } from '@/hooks/use-block-dnd';
import { useEditorShortcuts } from '@/hooks/use-editor-shortcuts';
import { CommandPalette } from '../command-palette';
import { cn } from '@/lib/utils';
import { nanoid } from 'nanoid';
import { Plus, Type, Image as ImageIcon, Code, ListOrdered, Quote } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface EditorProps {
  initialContent?: Block[];
  onChange?: (blocks: Block[]) => void;
  readOnly?: boolean;
}

export function ContentEditor({ initialContent = [], onChange, readOnly = false }: EditorProps) {
  const { hasPermission } = useAuth();
  const [blocks, setBlocks] = useState<Block[]>(initialContent);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const handleBlocksChange = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
    onChange?.(newBlocks);
  }, [onChange]);

  const {
    draggedBlockId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useBlockDragAndDrop(blocks, handleBlocksChange);

  const handleBlockChange = useCallback((blockId: string, updatedBlock: Block) => {
    setBlocks(prevBlocks => {
      const newBlocks = prevBlocks.map(block =>
        block.id === blockId ? updatedBlock : block
      );
      onChange?.(newBlocks);
      return newBlocks;
    });
  }, [onChange]);

  const handleFormatText = useCallback((blockId: string, format: string) => {
    setBlocks(prevBlocks => {
      const newBlocks = prevBlocks.map(block => {
        if (block.id === blockId && block.type === 'text') {
          return {
            ...block,
            formatting: {
              ...block.formatting,
              [format]: !block.formatting?.[format],
            },
          };
        }
        return block;
      });
      onChange?.(newBlocks);
      return newBlocks;
    });
  }, [onChange]);

  const handleAddBlock = useCallback((type: Block['type'], afterId?: string) => {
    const newBlock: Block = {
      id: nanoid(),
      type,
      content: '',
    } as Block;

    setBlocks(prevBlocks => {
      const index = afterId ? prevBlocks.findIndex(b => b.id === afterId) : -1;
      const newBlocks = [...prevBlocks];
      if (index >= 0) {
        newBlocks.splice(index + 1, 0, newBlock);
      } else {
        newBlocks.push(newBlock);
      }
      onChange?.(newBlocks);
      return newBlocks;
    });

    setSelectedBlockId(newBlock.id);
    setCommandPaletteOpen(false);
  }, [onChange]);

  const handleDeleteBlock = useCallback((blockId: string) => {
    if (blocks.length <= 1) {
      toast.error('Cannot delete the last block');
      return;
    }

    setBlocks(prevBlocks => {
      const newBlocks = prevBlocks.filter(block => block.id !== blockId);
      onChange?.(newBlocks);
      return newBlocks;
    });
  }, [blocks.length, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, blockId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddBlock('text', blockId);
    } else if (e.key === 'Backspace' && blocks.length > 1) {
      const block : any= blocks.find(b => b.id === blockId);
      if (block && !block.content) {
        e.preventDefault();
        handleDeleteBlock(blockId);
        const prevBlock = blocks[blocks.findIndex(b => b.id === blockId) - 1];
        if (prevBlock) {
          setSelectedBlockId(prevBlock.id);
        }
      }
    }
  }, [blocks, handleAddBlock, handleDeleteBlock]);

  // Initialize keyboard shortcuts
  useEditorShortcuts({
    onAddBlock: handleAddBlock,
    onFormatText: handleFormatText,
    selectedBlockId,
    onCommandPalette: () => setCommandPaletteOpen(true),
  });

  return (
    <>
      <div className="relative min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
        {blocks.map(block => (
          <div
            key={block.id}
            className={cn(
              "group relative py-1",
              draggedBlockId === block.id && "opacity-50",
              selectedBlockId === block.id && "ring-2 ring-ring rounded-sm"
            )}
            onClick={() => setSelectedBlockId(block.id)}
            draggable={!readOnly}
            onDragStart={() => handleDragStart(block.id)}
            onDragOver={(e) => handleDragOver(e, block.id)}
            onDragEnd={handleDragEnd}
          >
            {!readOnly && (
              <BlockToolbar
                onFormatText={
                  block.type === 'text'
                    ? (format) => handleFormatText(block.id, format)
                    : undefined
                }
                onDelete={() => handleDeleteBlock(block.id)}
                onDragStart={() => handleDragStart(block.id)}
                formats={block.type === 'text' ? block.formatting : undefined}
              />
            )}

            {/* Block type selector */}
            {!readOnly && selectedBlockId === block.id && (
              <div className="absolute -right-10 top-1/2 -translate-y-1/2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => handleBlockChange(block.id, { ...block, type: 'text' })}>
                      <Type className="mr-2 h-4 w-4" />
                      Text
                    </DropdownMenuItem>
                    {hasPermission('content.upload_images') && (
                      <DropdownMenuItem onClick={() => handleBlockChange(block.id, { ...block, type: 'image' })}>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Image
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleBlockChange(block.id, { ...block, type: 'code' })}>
                      <Code className="mr-2 h-4 w-4" />
                      Code
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBlockChange(block.id, { ...block, type: 'bullet-list' })}>
                      <ListOrdered className="mr-2 h-4 w-4" />
                      List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBlockChange(block.id, { ...block, type: 'quote' })}>
                      <Quote className="mr-2 h-4 w-4" />
                      Quote
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Block content */}
            <div className="px-1">
              <BlockRenderer
                block={block}
                className={readOnly ? '' : 'cursor-text'}
              />
              {!readOnly && (
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="absolute inset-0 opacity-0"
                  onKeyDown={e => handleKeyDown(e, block.id)}
                  onInput={e => {
                    const content = e.currentTarget.textContent || '';
                    handleBlockChange(block.id, { ...block, content });
                  }}
                >
                  {block.content}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add initial block if empty */}
        {blocks.length === 0 && !readOnly && (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => handleAddBlock('text')}
          >
            Click to add content...
          </Button>
        )}
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onAddBlock={(type) => handleAddBlock(type, selectedBlockId)}
      />
    </>
  );
}