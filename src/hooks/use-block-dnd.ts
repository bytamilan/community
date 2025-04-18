import { useState, useCallback } from 'react';
import { Block } from '@/components/content/blocks/block-types';

export function useBlockDragAndDrop(
  blocks: Block[],
  onChange: (blocks: Block[]) => void
) {
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  const handleDragStart = useCallback((blockId: string) => {
    setDraggedBlockId(blockId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    const draggingBlock = blocks.find(b => b.id === draggedBlockId);
    const targetBlock = blocks.find(b => b.id === blockId);
    
    if (!draggingBlock || !targetBlock || draggingBlock.id === targetBlock.id) {
      return;
    }

    const draggedIdx = blocks.indexOf(draggingBlock);
    const targetIdx = blocks.indexOf(targetBlock);
    
    const newBlocks = [...blocks];
    newBlocks.splice(draggedIdx, 1);
    newBlocks.splice(targetIdx, 0, draggingBlock);
    
    onChange(newBlocks);
  }, [blocks, draggedBlockId, onChange]);

  const handleDragEnd = useCallback(() => {
    setDraggedBlockId(null);
  }, []);

  return {
    draggedBlockId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}