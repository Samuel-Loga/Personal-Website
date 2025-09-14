// /app/admin/new/page.tsx

'use client'

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { editorConfig } from '@/lib/lexical/lexicalConfig';
import { EditorContent } from '@/components/editor/EditorContent';

export default function NewPostPage() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!title.trim() || !content.replace(/<(.|\n)*?>/g, '').trim()) {
        setMessage('❌ Error: Title and content cannot be empty.');
        setLoading(false);
        return;
    }

    const { error } = await supabase.from('posts').insert([
      {
        title, slug, content,
        cover_image: coverImage, created_by: 'Samuel Loga', status, excerpt, category,
      },
    ]);

    setLoading(false);
    if (error) {
      setMessage(`❌ Error: ${error.message}`);
    } else {
      setMessage('✅ Post submitted successfully!');
      setTimeout(() => setMessage(''), 10000);
      setTitle('');
      setSlug('');
      setContent('');
      setCoverImage('');
      setExcerpt('');
      setCategory('');
      setStatus('draft');
    }
  };

  return (
    <section className="px-4 sm:px-6 w-full py-10 md:py-12 bg-zinc-800 text-white relative">
      <div className="max-w-6xl mx-auto mt-21 text-zinc-300 relative">
        <h1 className="text-3xl font-bold mb-8 tracking-tight">Create New Blog Post 📝</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-x-8">
          
          <div className="lg:col-span-1 flex flex-col gap-y-4">
            <div><label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label><input id="title" type="text" className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" value={title} onChange={(e) => setTitle(e.target.value)} required/></div>
            <div><label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug</label><input id="slug" type="text" className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" value={slug} onChange={(e) => setSlug(e.target.value)} required/></div>
            <div><label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Image URL</label><input id="coverImage" type="text" className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" value={coverImage} onChange={(e) => setCoverImage(e.target.value)}/></div>
            <div><label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label><input id="category" type="text" className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" value={category} onChange={(e) => setCategory(e.target.value)} required/></div>
            <div><label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Excerpt</label><textarea id="excerpt" className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" rows={5} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required/></div>
            <div><label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label><select id="status" className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" value={status} onChange={(e) => setStatus(e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-y-6 mt-6 lg:mt-0">
            <div className="flex-grow">
              <label className="block text-sm font-semibold text-zinc-300 dark:text-gray-300 mb-2">Content</label>
              <LexicalComposer initialConfig={editorConfig}>
                <EditorContent onChange={setContent} />
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
  );
}