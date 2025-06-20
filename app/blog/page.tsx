'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type Post = {
  id: number
  title: string
  slug: string
  status: 'published' | 'draft'
  created_at: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, slug, status, created_at')
          .eq('status', 'published')
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data) setPosts(data)
      } catch (err: any) {
        setError(err.message || 'Error loading posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) return <p className="p-4">Loading posts...</p>
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>

  return (
    <section className="max-w-4xl mt-28 mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      {posts.length === 0 ? (
        <p className='mt-10'>No published posts yet.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map(({ id, title, slug, created_at }) => (
            <li key={id} className="border-b pb-2">
              <Link
                href={`/blog/${slug}`}
                className="text-blue-600 hover:underline text-lg font-semibold"
              >
                {title}
              </Link>
              <p className="text-sm text-gray-500">
                {new Date(created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
