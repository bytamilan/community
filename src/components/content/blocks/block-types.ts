export type BlockType = 
  | 'text'
  | 'heading'
  | 'image'
  | 'code'
  | 'quote'
  | 'bullet-list'
  | 'numbered-list'
  | 'divider'
  | 'callout';

export interface BaseBlock {
  id: string;
  type: BlockType;
  parentId?: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
  };
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  content: string;
  level: 1 | 2 | 3;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  url: string;
  caption?: string;
  alt?: string;
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  content: string;
  language?: string;
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  content: string;
  attribution?: string;
}

export interface ListItemBlock extends BaseBlock {
  content: string;
  checked?: boolean;
}

export interface ListBlock extends BaseBlock {
  type: 'bullet-list' | 'numbered-list';
  items: ListItemBlock[];
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  content: string;
  variant: 'info' | 'warning' | 'error' | 'success';
  icon?: string;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
}

export type Block =
  | TextBlock
  | HeadingBlock
  | ImageBlock
  | CodeBlock
  | QuoteBlock
  | ListBlock
  | CalloutBlock
  | DividerBlock;