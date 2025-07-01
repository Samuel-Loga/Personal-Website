'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'
import { FaTh, FaList } from 'react-icons/fa'
import Image from 'next/image'

type Post = {
  id: string
  title: string
  slug: string
  excerpt?: string
  cover_image?: string
  created_at: string
  category?: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching posts:', error)
    else setPosts(data as Post[])

    setLoading(false)
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto mt-28 py-12">
      {/* Search & View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-1/3 px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center gap-2">
          <button onClick={() => setView('grid')} className={`${view === 'grid' ? 'text-blue-600' : 'text-zinc-500'}`}>
            <FaTh size={18} />
          </button>
          <button onClick={() => setView('list')} className={`${view === 'list' ? 'text-blue-600' : 'text-zinc-500'}`}>
            <FaList size={18} />
          </button>
        </div>
      </div>

      {/* Post Container */}
      {loading ? (
        <p className="text-center text-zinc-500">Loading...</p>
      ) : filteredPosts.length === 0 ? (
        <p className="text-center text-zinc-500">No posts found.</p>
      ) : (
        <div
          className={
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
              : 'flex flex-col gap-6'
          }
        >
          {filteredPosts.map(post => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="border border-zinc-200 rounded-lg overflow-hidden shadow hover:shadow-lg transition-all bg-white"
            >
              {post.cover_image && (
                <div className="relative w-full h-48">
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
              )}
              <div className="p-4">
                <span className="text-xs text-blue-500 uppercase tracking-wide">{post.category || 'General'}</span>
                <h2 className="mt-1 font-semibold text-lg text-zinc-800">{post.title}</h2>
                <p className="text-sm text-zinc-500 mb-2">{format(new Date(post.created_at), 'MMM d, yyyy')}</p>
                <p className="text-sm text-zinc-700 line-clamp-3">{post.excerpt || 'No summary available.'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
