'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { JSX } from 'react';

// Centralized Lexical Configuration
import { editorConfig } from '@/lib/lexical/lexicalConfig'; // <-- IMPORT SHARED CONFIG

// Lexical Core
import {
  $getSelection,
  $isRangeSelection,
  LexicalEditor as LexicalEditorType,
  FORMAT_TEXT_COMMAND,
  $createParagraphNode,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  EditorState,
  createCommand,
  LexicalCommand,
} from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $wrapNodes } from '@lexical/selection';

// Lexical Plugins
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';

// Lexical Nodes & Commands (some may be unused here but good for reference)
import { $createQuoteNode, $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, $isListNode, ListNode } from '@lexical/list';
import { $createCodeNode } from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $getNearestNodeOfType } from '@lexical/utils';
import { $generateHtmlFromNodes } from '@lexical/html';

// Import the custom ImageNode, but its definition should live in a separate file now
// For this example, we'll keep it here for simplicity, but ideally move ImageNode and its related functions to a file like '/components/editor/ImageNode.ts'
import { DecoratorNode, NodeKey, SerializedLexicalNode, Spread, DOMConversionMap, DOMConversionOutput } from 'lexical';

type SerializedImageNode = Spread<{ src: string; altText: string; }, SerializedLexicalNode>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __alt: string;
  static getType(): string { return 'image'; }
  static clone(node: ImageNode): ImageNode { return new ImageNode(node.__src, node.__alt, node.__key); }
  constructor(src: string, altText: string, key?: NodeKey) { super(key); this.__src = src; this.__alt = altText; }
  static importJSON(serializedNode: SerializedImageNode): ImageNode { return $createImageNode(serializedNode.src, serializedNode.altText); }
  exportJSON(): SerializedImageNode { return { src: this.__src, altText: this.__alt, type: 'image', version: 1 }; }
  static importDOM(): DOMConversionMap | null { return { img: () => ({ conversion: (domNode: Node) => { const img = domNode as HTMLImageElement; const { alt, src } = img; if (src) { return { node: $createImageNode(src, alt) }; } return null; }, priority: 0 }) }; }
  exportDOM() { const element = document.createElement('img'); element.setAttribute('src', this.__src); element.setAttribute('alt', this.__alt); return { element }; }
  createDOM(): HTMLElement { const div = document.createElement('div'); div.style.display = 'contents'; return div; }
  updateDOM(): false { return false; }
  decorate(): JSX.Element { return <img src={this.__src} alt={this.__alt} className="my-4 rounded-lg shadow-md max-w-full mx-auto" />; }
}
export function $createImageNode(src: string, altText: string): ImageNode { return new ImageNode(src, altText); }
export const INSERT_IMAGE_COMMAND: LexicalCommand<string> = createCommand();

// --- Reusable Editor Components ---

function ImageUploadPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(INSERT_IMAGE_COMMAND, (payload: string) => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertNodes([$createImageNode(payload, 'Uploaded image')]);
      }
      return true;
    }, COMMAND_PRIORITY_CRITICAL);
  }, [editor]);
  return null;
}

function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [activeEditor, setActiveEditor] = useState(editor);
    const [blockType, setBlockType] = useState('paragraph');
    const [isLink, setIsLink] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
  
    const updateToolbar = useCallback(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
        const elementKey = element.getKey();
        const elementDOM = activeEditor.getElementByKey(elementKey);
  
        const parent = anchorNode.getParent();
        setIsLink($isLinkNode(parent) || $isLinkNode(anchorNode));
  
        if (elementDOM !== null) {
          if ($isListNode(element)) {
            const parentList = $getNearestNodeOfType(anchorNode, ListNode);
            const type = parentList ? parentList.getTag() : (element as ListNode).getTag();
            setBlockType(type);
          } else {
            const type = $isHeadingNode(element) ? element.getTag() : element.getType();
            setBlockType(type);
          }
        }
      }
    }, [activeEditor]);
  
    useEffect(() => {
      return editor.registerCommand(SELECTION_CHANGE_COMMAND, (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      }, COMMAND_PRIORITY_CRITICAL);
    }, [editor, updateToolbar]);
  
    const formatHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => blockType !== headingSize ? $createHeadingNode(headingSize) : $createParagraphNode());
        }
      });
    };
    
    const formatQuote = () => {
      editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
              $wrapNodes(selection, () => blockType !== 'quote' ? $createQuoteNode() : $createParagraphNode());
          }
      });
    };
  
    const formatCode = () => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => blockType !== 'code' ? $createCodeNode() : $createParagraphNode());
        }
      });
    };
  
    const insertLink = useCallback(() => {
      if (!isLink) {
        const url = prompt('Enter the URL:');
        if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      } else {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      }
    }, [editor, isLink]);
  
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('blog-images').upload(fileName, file);
      if (error) { alert(`Error uploading image: ${error.message}`); return; }
      const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      if (publicUrl) { editor.dispatchCommand(INSERT_IMAGE_COMMAND, publicUrl); }
      if (fileInputRef.current) { fileInputRef.current.value = ''; }
    };
  
    return (
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-300 dark:border-gray-600 rounded-t-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
        {/* All your buttons are the same as before */}
        <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} style={{ display: 'none' }} />
        <button type="button" onClick={() => formatHeading('h1')} className={`p-2 rounded ${blockType === 'h1' ? 'bg-gray-300 dark:bg-gray-500' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Heading 1">H1</button>
        <button type="button" onClick={() => formatHeading('h2')} className={`p-2 rounded ${blockType === 'h2' ? 'bg-gray-300 dark:bg-gray-500' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Heading 2">H2</button>
        <button type="button" onClick={() => formatHeading('h3')} className={`p-2 rounded ${blockType === 'h3' ? 'bg-gray-300 dark:bg-gray-500' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Heading 3">H3</button>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-500 mx-1"></div>
        <button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Bold"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg></button>
        <button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Italic"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg></button>
        <button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Underline"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg></button>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-500 mx-1"></div>
        <button type="button" onClick={formatQuote} className={`p-2 rounded ${blockType === 'quote' ? 'bg-gray-300 dark:bg-gray-500' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Quote"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 7 4 8 8 8Z"/><path d="M14 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 7 4 8 8 8Z"/></svg></button>
        <button type="button" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} className={`p-2 rounded ${blockType === 'ul' ? 'bg-gray-300 dark:bg-gray-500' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Bulleted List"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></button>
        <button type="button" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} className={`p-2 rounded ${blockType === 'ol' ? 'bg-gray-300 dark:bg-gray-500' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Numbered List"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg></button>
        <button type="button" onClick={formatCode} className={`p-2 rounded ${blockType === 'code' ? 'bg-gray-300 dark:bg-gray-500' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Code Block"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg></button>
        <button type="button" onClick={insertLink} className={`p-2 rounded ${isLink ? 'bg-gray-300 dark:bg-gray-500' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Insert Link"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg></button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Insert Image"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></button>
      </div>
    );
}

// The new reusable Editor component that contains all the plugins
function Editor({ onChange }: { onChange: (htmlString: string) => void; }) {
    const [editor] = useLexicalComposerContext();
    const handleOnChange = (editorState: EditorState) => {
        editor.update(() => {
            const htmlString = $generateHtmlFromNodes(editor, null);
            onChange(htmlString);
        });
    };

    return (
        <>
            <ToolbarPlugin />
            <div className="relative bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-b-md flex-grow">
                <RichTextPlugin
                    contentEditable={<ContentEditable className="p-4 h-full min-h-[400px] outline-none" />}
                    placeholder={<div className="absolute top-4 left-4 text-gray-400 pointer-events-none">Enter your content...</div>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
            </div>
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <ImageUploadPlugin />
            <OnChangePlugin onChange={handleOnChange} />
        </>
    );
}


// --- Main Page Component ---
export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [status, setStatus] = useState('draft')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!title.trim()) {
        setMessage('❌ Error: Title cannot be empty.');
        setLoading(false);
        return;
    }

    const strippedContent = content.replace(/<(.|\n)*?>/g, '').trim();
    if (!strippedContent) {
        setMessage('❌ Error: Content cannot be empty.');
        setLoading(false);
        return;
    }

    const { error } = await supabase.from('posts').insert([
      {
        title, slug, content,
        cover_image: coverImage, created_by: 'Samuel Loga', status, excerpt, category,
      },
    ])

    setLoading(false)

    if (error) {
      setMessage(`❌ Error: ${error.message}`)
    } else {
      setMessage('✅ Post submitted successfully!')
      setTimeout(() => setMessage(''), 10000);
      setTitle('');
      setSlug('');
      // Note: We don't reset content here as Lexical will persist. 
      // A full reset might require clearing the editor state via a command if needed.
      // For now, this is fine, or redirect the user.
      setCoverImage('');
      setExcerpt('');
      setCategory('');
      setStatus('draft');
    }
  }

  return (
    <section className="px-4 sm:px-6 w-full py-10 md:py-12 bg-zinc-800 text-white relative" >
      <div className="max-w-6xl mx-auto mt-21 text-zinc-300 relative">
        <h1 className="text-3xl font-bold mb-8 tracking-tight">Create New Blog Post 📝</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-x-8">
          
          {/* Left Column for Inputs */}
          <div className="lg:col-span-1 flex flex-col gap-y-4">
            {/* ... Your input fields for title, slug, etc. are the same ... */}
            <div><label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label><input id="title" type="text" className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" value={title} onChange={(e) => setTitle(e.target.value)} required/></div>
            <div><label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug</label><input id="slug" type="text" className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" value={slug} onChange={(e) => setSlug(e.target.value)} required/></div>
            <div><label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Image URL</label><input id="coverImage" type="text" className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" value={coverImage} onChange={(e) => setCoverImage(e.target.value)}/></div>
            <div><label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label><input id="category" type="text" className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" value={category} onChange={(e) => setCategory(e.target.value)} required/></div>
            <div><label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Excerpt</label><textarea id="excerpt" className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" rows={5} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required/></div>
            <div><label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label><select id="status" className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" value={status} onChange={(e) => setStatus(e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></div>
          </div>

          {/* Right Column for Content Editor */}
          <div className="lg:col-span-2 flex flex-col gap-y-6 mt-6 lg:mt-0">
            <div className="flex-grow">
              <label className="block text-sm font-semibold text-zinc-300 dark:text-gray-300 mb-2">Content</label>
              
              <LexicalComposer initialConfig={editorConfig}>
                <div className="relative border border-gray-300 dark:border-gray-600 rounded-md h-full flex flex-col">
                  <Editor onChange={setContent} />
                </div>
              </LexicalComposer>

            </div>
            <div className="flex items-center gap-4">
              <button type="submit" className="px-8 py-2 bg-[#364153] text-white border border-zinc-500 rounded-md hover:bg-blue-900/20 transition inline-flex" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Post'}
              </button>
              {message && <p className={`text-sm self-end pb-1 ${message.startsWith('❌') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}