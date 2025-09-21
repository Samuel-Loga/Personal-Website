// /lib/lexicalConfig.ts

import { InitialConfigType } from '@lexical/react/LexicalComposer';

// Lexical Nodes
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ImageNode } from '@/components/editor/ImageNode';
import { ImagePlaceholderNode } from '@/components/editor/ImagePlaceholderNode';

export const editorConfig: InitialConfigType = {
  namespace: 'MyEditor',
  theme: {
    root: 'font-inter text-sm', // Apply Inter font to the editor content
    paragraph: 'mb-2',
    quote: 'border-l-4 border-gray-300 pl-4 italic my-4',
    heading: {
      h1: 'text-3xl font-bold mb-4',
      h2: 'text-2xl font-semibold mb-3',
      h3: 'text-xl font-semibold mb-2',
    },
    list: {
      ul: 'list-disc list-outside my-4 pl-8',
      ol: 'list-decimal list-outside my-4 pl-8',
    },
    listitem: 'mb-2',
    link: 'text-teal-600 hover:underline',
    code: 'bg-zinc-700/50 text-sm p-4 my-4 block overflow-x-auto rounded-md',
    image: 'block my-4',
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
      strikethrough: 'line-through',
      code: 'bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono',
    },
  },
  onError(error: Error) {
    throw error;
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    ImageNode,
    ImagePlaceholderNode,
  ],
};