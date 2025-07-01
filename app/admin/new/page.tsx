'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function NewPostPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  //const [, setCreatedBy] = useState('Samuel Loga')
  const [status, setStatus] = useState('draft')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

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
      router.push('/admin/new') // remain on the same page after submission
    }
  }

  return (
    <section className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-2xl font-bold mb-6 text-zinc-900">📝 Create New Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Slug (URL identifier)</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-md"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Cover Image URL</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-md"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Category</label>
          <textarea
            className="w-full px-4 py-2 border rounded-md min-h-[180px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Excerpt</label>
          <textarea
            className="w-full px-4 py-2 border rounded-md min-h-[180px]"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Content</label>
          <textarea
            className="w-full px-4 py-2 border rounded-md min-h-[180px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Status</label>
          <select
            className="w-full px-4 py-2 border rounded-md"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Post'}
        </button>

        {message && <p className="mt-4 text-sm">{message}</p>}
      </form>
    </section>
  )
}
// This code defines a page for creating new blog posts in an admin dashboard.
// It includes a form with fields for title, slug, cover image URL, content, and