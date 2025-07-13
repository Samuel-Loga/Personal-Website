'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

// Lexical Core
import { $getSelection, $isRangeSelection, LexicalEditor as LexicalEditorType } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

// Lexical Plugins
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';

// Lexical Nodes
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { AutoLinkNode, LinkNode } from '@lexical/link';

// Lexical HTML
import { $generateHtmlFromNodes } from '@lexical/html';

// --- Components ---

// Toolbar component for formatting options
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  
  const onClick = (format: 'bold' | 'italic' | 'underline') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.formatText(format);
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-gray-300 dark:border-gray-600 mb-2 rounded-t-md bg-gray-50 dark:bg-gray-700">
      <button onClick={() => onClick('bold')} className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">Bold</button>
      <button onClick={() => onClick('italic')} className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">Italic</button>
      <button onClick={() => onClick('underline')} className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">Underline</button>
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
      // Add any custom theme classes here
      ltr: 'text-left',
      rtl: 'text-right',
      paragraph: 'mb-2',
      quote: 'border-l-4 border-gray-300 pl-4 italic',
      heading: {
        h1: 'text-3xl font-bold mb-4',
        h2: 'text-2xl font-semibold mb-3',
        h3: 'text-xl font-semibold mb-2',
      },
      list: {
        ul: 'list-disc list-inside',
        ol: 'list-decimal list-inside',
      },
      link: 'text-blue-500 hover:underline',
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
      <div className="relative border border-gray-300 dark:border-gray-600 rounded-md">
        <ToolbarPlugin />
        <div className="relative bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-b-md">
           <RichTextPlugin
            contentEditable={<ContentEditable className="p-4 min-h-[300px] outline-none" />}
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
    <section className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-white">📝 Create New Blog Post</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input fields for title, slug, etc. remain the same */}
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
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (URL identifier)</label>
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white min-h-[100px]"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              required
            />
          </div>
          
          {/* Lexical Editor Integration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
            <LexicalEditor onChange={setContent} />
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

          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Post'}
            </button>
            {message && (
              <p className={`text-sm ${message.startsWith('❌') ? 'text-red-500' : 'text-green-500'}`}>
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
