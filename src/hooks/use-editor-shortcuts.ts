import { useEffect, useCallback } from 'react';
import { Block } from '@/components/content/blocks/block-types';

interface EditorShortcutsProps {
  onAddBlock: (type: Block['type'], afterId?: string) => void;
  onFormatText?: (blockId: string, format: string) => void;
  selectedBlockId: string | null;
  onCommandPalette: () => void;
}

export function useEditorShortcuts({
  onAddBlock,
  onFormatText,
  selectedBlockId,
  onCommandPalette,
}: EditorShortcutsProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Command/Control + / for command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      onCommandPalette();
      return;
    }

    if (!selectedBlockId) return;

    // Text formatting shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          onFormatText?.(selectedBlockId, 'bold');
          break;
        case 'i':
          e.preventDefault();
          onFormatText?.(selectedBlockId, 'italic');
          break;
        case 'u':
          e.preventDefault();
          onFormatText?.(selectedBlockId, 'underline');
          break;
      }
    }

    // Block type shortcuts with /commands
    if (e.key === '/' && selectedBlockId) {
      e.preventDefault();
      const commands = {
        'h1': () => onAddBlock('heading', selectedBlockId),
        'img': () => onAddBlock('image', selectedBlockId),
        'code': () => onAddBlock('code', selectedBlockId),
        'quote': () => onAddBlock('quote', selectedBlockId),
        'list': () => onAddBlock('bullet-list', selectedBlockId),
      };

      // Show command suggestions
      // This would be implemented in the UI layer
    }
  }, [selectedBlockId, onFormatText, onAddBlock, onCommandPalette]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    handleKeyDown,
  };
}