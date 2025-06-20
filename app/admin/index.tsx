// app/admin/index.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function AdminDashboard() {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) setPosts(data)
    }

    fetchPosts()
  }, [])

  return (
    <section className="min-h-screen px-6 py-10 bg-[#f5f5f7] text-zinc-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Link
            href="/admin/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + New Post
          </Link>
        </div>

        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="p-4 bg-white shadow rounded border border-zinc-200"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{post.title}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {post.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
