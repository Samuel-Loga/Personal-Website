// /components/editor/ImageNode.ts

import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  LexicalCommand,
  NodeKey,
  SerializedLexicalNode,
  Spread,
  createCommand,
} from 'lexical';
import React, { JSX } from 'react';

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
  },
  SerializedLexicalNode
>;

function ImageComponent({ src, alt }: { src: string; alt: string; }): JSX.Element {
  return <img src={src} alt={alt} className="my-4 rounded-lg shadow-md max-w-full mx-auto" />;
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __alt: string;

  static getType(): string { return 'image'; }
  static clone(node: ImageNode): ImageNode { return new ImageNode(node.__src, node.__alt, node.__key); }
  constructor(src: string, altText: string, key?: NodeKey) { super(key); this.__src = src; this.__alt = altText; }
  static importJSON(serializedNode: SerializedImageNode): ImageNode { return $createImageNode(serializedNode.src, serializedNode.altText); }
  exportJSON(): SerializedImageNode { return { src: this.__src, altText: this.__alt, type: 'image', version: 1 }; }
  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: (domNode: Node): DOMConversionOutput | null => {
          const img = domNode as HTMLImageElement;
          const { alt, src } = img;
          if (src) { return { node: $createImageNode(src, alt) }; }
          return null;
        },
        priority: 0,
      }),
    };
  }
  exportDOM() { const element = document.createElement('img'); element.setAttribute('src', this.__src); element.setAttribute('alt', this.__alt); return { element }; }
  createDOM(): HTMLElement { const div = document.createElement('div'); div.style.display = 'contents'; return div; }
  updateDOM(): false { return false; }
  decorate(): JSX.Element { return <ImageComponent src={this.__src} alt={this.__alt} />; }
}

export function $createImageNode(src: string, altText: string): ImageNode { return new ImageNode(src, altText); }
export const INSERT_IMAGE_COMMAND: LexicalCommand<string> = createCommand();