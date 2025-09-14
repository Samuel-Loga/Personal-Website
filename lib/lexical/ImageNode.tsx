// IMPORTANT: For JSX to work correctly, this file should be renamed to ImageNode.tsx
// If you are still seeing JSX-related errors after renaming, please ensure your tsconfig.json
// has "jsx": "react-jsx" or "jsx": "preserve" under the "compilerOptions" section.

import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  EditorConfig,
  LexicalCommand,
  NodeKey,
  SerializedLexicalNode,
  Spread,
  createCommand,
} from 'lexical';
import React, { JSX } from 'react';

// Define the type for the serialized (JSON) version of the node
export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
  },
  SerializedLexicalNode
>;

// The custom React component to render the image in the editor
function ImageComponent({ src, alt }: { src: string; alt: string; }): JSX.Element {
  return <img src={src} alt={alt} className="my-4 rounded-lg shadow-md max-w-full mx-auto" />;
}

// The custom Lexical Node class
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

  // Methods for serialization (saving to JSON)
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

  // Methods for converting from/to DOM (for pasting HTML)
  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
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

  exportDOM() {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__alt);
    return { element };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  // The method that renders the React component
  decorate(): JSX.Element {
    return <ImageComponent src={this.__src} alt={this.__alt} />;
  }
}

// Helper function to create an ImageNode
export function $createImageNode(src: string, altText: string): ImageNode {
  return new ImageNode(src, altText);
}

// Command to insert an image into the editor
export const INSERT_IMAGE_COMMAND: LexicalCommand<string> = createCommand();
