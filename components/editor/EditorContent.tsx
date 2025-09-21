// /components/editor/EditorContent.tsx

'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { JSX } from 'react';
import {
  $createImagePlaceholderNode,
  $isImagePlaceholderNode,
} from '@/components/editor/ImagePlaceholderNode'; // for spinner
import { NodeKey, $getNodeByKey } from 'lexical'; 

// Lexical Core & Plugins
import {
  $getSelection,
  $isRangeSelection,
  LexicalEditor as LexicalEditorType,
  FORMAT_TEXT_COMMAND,
  $createParagraphNode,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  EditorState,
  $getRoot,
} from 'lexical';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $wrapNodes } from '@lexical/selection';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { $createQuoteNode, $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, $isListNode, ListNode } from '@lexical/list';
import { $createCodeNode } from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $getNearestNodeOfType } from '@lexical/utils';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';

// Import the centralized ImageNode and command
import { $createImageNode, INSERT_IMAGE_COMMAND } from '@/components/editor/ImageNode';

// --- Image Upload Plugin ---
function ImageUploadPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload: string) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertNodes([$createImageNode(payload, 'Uploaded image')]);
        }
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor]);
  return null;
}

// --- Toolbar Plugin ---
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
        setActiveEditor(newEditor as LexicalEditorType);
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

      // This key will let us find and replace the placeholder later
      let nodeKey: NodeKey | null = null;


      // 1. Insert a placeholder node immediately
      editor.update(() => {
        const placeholderNode = $createImagePlaceholderNode();
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertNodes([placeholderNode]);
          nodeKey = placeholderNode.getKey();
        }
      });

      // 2. Upload the file asynchronously
      const uploadFile = async () => {
        try {
          const fileName = `${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, file);
          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(fileName);
          if (!publicUrl) throw new Error('Could not get public URL.');

          // 3. Replace the placeholder with the final image node
          editor.update(() => {
            if (nodeKey) {
              const placeholderNode = $getNodeByKey(nodeKey);
              if ($isImagePlaceholderNode(placeholderNode)) {
                const imageNode = $createImageNode(publicUrl, file.name);
                placeholderNode.replace(imageNode);
              }
            }
          });
        } catch (error) {
          console.error('Image upload failed:', error);
          // Optional: Remove the placeholder on error
          editor.update(() => {
            if (nodeKey) {
              const node = editor.getElementByKey(nodeKey);
              if (node) node.remove();
            }
          });
        } finally {
          // Reset the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      uploadFile();
    };
  
    return (
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-300 dark:border-gray-600 rounded-t-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
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

// --- Plugin to load initial state from HTML (only for edit page) ---
function InitialStatePlugin({ initialHtml }: { initialHtml: string }) {
  const [editor] = useLexicalComposerContext();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  useEffect(() => {
    if (isFirstLoad && initialHtml) {
      setIsFirstLoad(false);
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialHtml, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      });
    }
  }, [editor, initialHtml, isFirstLoad]);
  return null;
}

// --- Main reusable component for the editor's content ---
interface EditorContentProps {
  onChange: (htmlString: string) => void;
  initialHtml?: string | null;
}

export function EditorContent({ onChange, initialHtml }: EditorContentProps) {
  //const [editor] = useLexicalComposerContext();
  const handleOnChange = (editorState: EditorState, editor: LexicalEditorType) => {
      // The editor instance is passed directly to the callback, so we can use it here.
      editorState.read(() => { // Using editorState to read is a good practice
        const htmlString = $generateHtmlFromNodes(editor, null);
        onChange(htmlString);
    });
  };

  return (
    <div className="relative border border-gray-300 dark:border-gray-600 rounded-md h-full flex flex-col">
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
      {initialHtml && <InitialStatePlugin initialHtml={initialHtml} />}
    </div>
  );
}