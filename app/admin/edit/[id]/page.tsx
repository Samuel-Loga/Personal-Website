// /app/admin/edit/[id]/page.tsx

'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { editorConfig } from '@/lib/lexical/lexicalConfig';
import { EditorContent } from '@/components/editor/EditorContent';

type Category = {
  id: string; // UUID is a string
  name: string;
};

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('draft');
  const [excerpt, setExcerpt] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      setLoading(true);
      //const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
      const [postRes, categoriesRes] = await Promise.all([
        supabase.from('posts').select('*').eq('id', id).single(),
        supabase.from('categories').select('id, name').order('name'),
      ]);

      // Populate categories dropdown
      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      if (postRes.error) {
        setMessage(`❌ Error: ${postRes.error.message}`);
      } else if (postRes.data) {
        const data = postRes.data;
        setTitle(data.title);
        setSlug(data.slug);
        setInitialContent(data.content);
        setContent(data.content);
        setCoverImage(data.cover_image || '');
        setStatus(data.status);
        setExcerpt(data.excerpt || '');
        // Pre-select the post's current category in the dropdown
        if (data.category_id) {
          setCategoryId(data.category_id);
        }
      }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('posts')
      .update({ title, slug, content, cover_image: coverImage, status, excerpt, category_id: categoryId, updated_at: new Date().toISOString() })
      .match({ id });

    setLoading(false);
    if (error) {
      setMessage(`❌ Error updating post: ${error.message}`);
    } else {
      setMessage('✅ Post updated successfully!');
      setTimeout(() => setMessage(''), 10000);
    }
  };

  if (loading && !initialContent) {
    return <div className="bg-gray-900 text-white flex justify-center items-center min-h-screen">Loading post for editing...</div>;
  }

  return (
    <section className="bg-zinc-800 min-h-screen p-4 sm:p-6 lg:p-8 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto pt-25">
        <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-white">✍️ Edit Post</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-x-8">
          
          <div className="lg:col-span-1 flex flex-col gap-y-4">
            <div><label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label><input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" /></div>
            <div><label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug</label><input id="slug" type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" /></div>
            <div><label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Image URL</label><input id="coverImage" type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" /></div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                id="category"
                className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800 bg-zinc-800"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                disabled={categories.length === 0}
              >
                {categories.length === 0 ? (
                  <option value="">Loading categories...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div><label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Excerpt</label><textarea id="excerpt" value={excerpt} rows={5} onChange={(e) => setExcerpt(e.target.value)} required className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" /></div>
            <div><label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label><select id="status" value={status} onChange={(e) => setStatus(e.target.value as 'published' | 'draft')} className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800"><option value="draft">Draft</option><option value="published">Published</option></select></div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-y-6 mt-6 lg:mt-0">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
              {initialContent && (
                  <LexicalComposer initialConfig={editorConfig}>
                      <EditorContent onChange={setContent} initialHtml={initialContent} />
                  </LexicalComposer>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button type="submit" disabled={loading} className="px-8 py-2 bg-[#364153] text-white border border-zinc-500 rounded-md hover:bg-blue-900/20 transition inline-flex">
                {loading ? 'Updating...' : 'Update Post'}
              </button>
              {message && <p className={`text-sm ${message.startsWith('❌') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}