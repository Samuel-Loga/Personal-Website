'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

// Lexical Core
import {
  $getSelection,
  $isRangeSelection,
  LexicalEditor as LexicalEditorType,
  FORMAT_TEXT_COMMAND,
  $createParagraphNode,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  NodeKey,
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

// Lexical Nodes & Commands
import { HeadingNode, QuoteNode, $createQuoteNode, $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { ListItemNode, ListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, $isListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode, $createCodeNode } from '@lexical/code';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { AutoLinkNode, LinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $getNearestNodeOfType } from '@lexical/utils';

// Lexical HTML
import { $generateHtmlFromNodes } from '@lexical/html';

// --- Components ---

// Toolbar component for formatting options
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] = useState('paragraph');
  const [isLink, setIsLink] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Link check
      const parent = anchorNode.getParent();
      if ($isLinkNode(parent) || $isLinkNode(anchorNode)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      }
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload: unknown, newEditor: LexicalEditorType) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, updateToolbar]);

  const formatHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode(headingSize));
        }
      });
    } else {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $wrapNodes(selection, () => $createParagraphNode());
            }
        });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'ul') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'ol') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  const formatCode = () => {
    if (blockType !== 'code') {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $wrapNodes(selection, () => $createCodeNode());
            }
        });
    } else {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $wrapNodes(selection, () => $createParagraphNode());
            }
        });
    }
  };

  const insertLink = useCallback(() => {
    if (!isLink) {
      const url = prompt('Enter the URL:');
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  // NOTE: Proper image handling requires a custom Lexical node.
  // This is a placeholder to show where the functionality would go.
  const insertImage = () => {
    alert('Image insertion requires a custom Lexical node, which is an advanced topic. This button is a placeholder.');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-300 dark:border-gray-600 rounded-t-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
        <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
        </button>
        <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Italic">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
        </button>
        <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Underline">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>
        </button>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-500 mx-1"></div>
        <button onClick={formatBulletList} className={`p-2 rounded ${blockType === 'ul' ? 'bg-gray-300 dark:bg-gray-500' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Bulleted List">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </button>
        <button onClick={formatNumberedList} className={`p-2 rounded ${blockType === 'ol' ? 'bg-gray-300 dark:bg-gray-500' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Numbered List">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
        </button>
        <button onClick={formatCode} className={`p-2 rounded ${blockType === 'code' ? 'bg-gray-300 dark:bg-gray-500' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Code Block">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        </button>
        <button onClick={insertLink} className={`p-2 rounded ${isLink ? 'bg-gray-300 dark:bg-gray-500' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Insert Link">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
        </button>
        <button onClick={insertImage} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Insert Image (Placeholder)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </button>
    </div>
  );
}

interface LexicalEditorProps {
  onChange: (htmlString: string) => void;
}

// The main Lexical Editor component
function LexicalEditor({ onChange }: LexicalEditorProps) {
  const initialConfig = {
    namespace: 'MyEditor',
    theme: {
      ltr: 'text-left',
      rtl: 'text-right',
      paragraph: 'mb-2',
      quote: 'border-l-4 border-zinc-300 pl-4 italic my-4',
      heading: {
        h1: 'text-3xl font-bold mb-4',
        h2: 'text-2xl font-semibold mb-3',
        h3: 'text-xl font-semibold mb-2',
      },
      list: {
        ul: 'list-disc list-inside my-4 pl-4',
        ol: 'list-decimal list-inside my-4 pl-4',
      },
      link: 'text-teal-500 hover:underline',
      code: 'bg-blue-600/20 border border-zinc-700 text-sm font-mono p-6 my-4 block overflow-x-auto rounded-md',
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
    ],
  };

  const handleOnChange = (_editorState: any, editor: LexicalEditorType) => {
    editor.update(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      onChange(htmlString);
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
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
        <OnChangePlugin onChange={handleOnChange} />
      </div>
    </LexicalComposer>
  );
}


// The main page component for creating a new post
export default function NewPostPage() {
  const router = useRouter()

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

    const strippedContent = content.replace(/<(.|\n)*?>/g, '').trim();
    if (!strippedContent) {
        setMessage('❌ Error: Content cannot be empty.');
        setLoading(false);
        return;
    }

    const { error } = await supabase.from('posts').insert([
      {
        title,
        slug,
        content,
        cover_image: coverImage,
        created_by: 'Samuel Loga',
        status,
        excerpt,
        category,
      },
    ])

    setLoading(false)

    if (error) {
      setMessage(`❌ Error: ${error.message}`)
    } else {
      setMessage('✅ Post submitted successfully!')
      setTitle('');
      setSlug('');
      setContent('<p><br></p>'); // Reset Lexical content
      setCoverImage('');
      setExcerpt('');
      setCategory('');
      setStatus('draft');
    }
  }

  return (
    <section className="px-4 sm:px-6 w-full pt-30 pb-10 bg-[#181818] relative" >
      <div className="max-w-6xl mx-auto relative bg-white dark:bg-gray-900 shadow-lg rounded-lg p-8">

        <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-white">📝 Create New Blog Post</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-x-8">
          
          {/* Left Column for Inputs */}
          <div className="lg:col-span-1 flex flex-col gap-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                id="title"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
              <input
                id="slug"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image URL</label>
              <input
                id="coverImage"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <input
                id="category"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt</label>
              <textarea
                id="excerpt"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white min-h-[120px]"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                id="status"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* Right Column for Content Editor and Actions */}
          <div className="lg:col-span-2 flex flex-col gap-y-4 mt-6 lg:mt-0">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
              <LexicalEditor onChange={setContent} />
            </div>

            <div className="flex items-center gap-8 mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600/20 text-white border border-zinc-700 rounded-md hover:bg-blue-900/20 transition inline-flex"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Post'}
              </button>
              {message && (
                <p className={`text-sm self-end pb-1 ${message.startsWith('❌') ? 'text-red-500' : 'text-green-500'}`}>
                  {message}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
