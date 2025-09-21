// /components/editor/ImagePlaceholderNode.tsx

import { DecoratorNode, NodeKey, LexicalNode, SerializedLexicalNode } from 'lexical';
import { JSX } from 'react';

// A simple SVG spinner component
function Spinner() {
  return (
    <svg
      className="animate-spin h-10 w-10 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

export class ImagePlaceholderNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return 'image-placeholder';
  }

  static clone(node: ImagePlaceholderNode): ImagePlaceholderNode {
    return new ImagePlaceholderNode(node.__key);
  }
  
  // Method to save the node's state to JSON
  exportJSON(): SerializedLexicalNode {
    return {
      type: 'image-placeholder',
      version: 1,
    };
  }

  // Static method to create a new node from JSON
  static importJSON(_serializedNode: SerializedLexicalNode): ImagePlaceholderNode {
    return $createImagePlaceholderNode();
  }
  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.style.display = 'contents';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <div className="flex justify-center items-center my-4 p-8 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
        <Spinner />
      </div>
    );
  }
}

export function $createImagePlaceholderNode(): ImagePlaceholderNode {
  return new ImagePlaceholderNode();
}

export function $isImagePlaceholderNode(node: LexicalNode | null | undefined): node is ImagePlaceholderNode {
    return node instanceof ImagePlaceholderNode;
}