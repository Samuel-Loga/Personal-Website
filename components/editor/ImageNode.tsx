// /components/editor/ImageNode.tsx

import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalCommand,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
  createCommand
} from 'lexical';
import React, { JSX } from 'react';

// --- Type Definitions ---
type SerializedImageNode = Spread<{
  src: string;
  altText: string;
}, SerializedLexicalNode>;

// --- Custom Image Node ---
export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __alt: string;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__alt, node.__key);
  }

  constructor(src: string, altText: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__alt = altText;
  }
  
  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText } = serializedNode;
    return $createImageNode(src, altText);
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.__src,
      altText: this.__alt,
      type: 'image',
      version: 1,
    };
  }
  
  static importDOM(): DOMConversionMap | null {
    return {
      img: (_node: Node) => ({
        conversion: (domNode: Node): DOMConversionOutput | null => {
          const img = domNode as HTMLImageElement;
          const { alt, src } = img;
          if (src) {
            return { node: $createImageNode(src, alt) };
          }
          return null;
        },
        priority: 0,
      }),
    };
  }

  exportDOM(): DOMExportOutput {
      const element = document.createElement('img');
      element.setAttribute('src', this.__src);
      element.setAttribute('alt', this.__alt);
      return { element };
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    span.style.display = 'contents';
    return span;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={this.__src}
        alt={this.__alt}
        width={800} 
        height={600} 
        style={{ width: '100%', height: 'auto' }} // Responsive
        className="my-4 rounded-lg shadow-md max-w-full mx-auto"
      />
    );
  }
}

// --- Helper Functions and Commands ---
export function $createImageNode(src: string, altText: string): ImageNode {
  return new ImageNode(src, altText);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}

export const INSERT_IMAGE_COMMAND: LexicalCommand<string> = createCommand();