'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'
import { FaTh } from 'react-icons/fa'
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
    <section className="px-4 sm:px-6 w-full py-12 pb-10 bg-zinc-800 relative" >
      <div className="max-w-6xl mx-auto mt-18 relative">
    
      {/* Search & View Toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap mb-8">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-[220px] sm:w-[300px] md:w-[350px] text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800"
        />
        <button
          onClick={() => setView('grid')}
          className={`rounded-md ${view === 'grid' ? 'text-teal-600' : 'text-zinc-500'}`}
        >
          <FaTh size={26} />
        </button>
      </div>

      {/* Post Container */}
      {loading ? (
        <p className="text-center text-zinc-500 py-9">Loading...</p>
      ) : filteredPosts.length === 0 ? (
        <p className="text-center text-zinc-500 py-9">No posts found.</p>
      ) : (
        <div
          className={
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
              : 'flex flex-col gap-6'
          }
        >
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="rounded-lg overflow-hidden shadow hover:shadow-lg transition-all bg-white"
            >
              {post.cover_image && (
                <div className="relative w-full h-48 bg-[#101828]">
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    className="object-cover rounded-b-lg"
                    sizes="100vw"
                  />
                </div>
              )}
              <div className="p-4 bg-[#101828]">
                <span className="text-xs md:text-sm text-teal-600">
                  {post.category || 'General'}
                </span>
                <h2 className="mt-1 font-semibold text-base text-zinc-300">{post.title}</h2>
                <p className="mt-1 text-xs text-zinc-400 mb-2">
                  {format(new Date(post.created_at), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-zinc-400 line-clamp-3">
                  {post.excerpt || 'No summary available.'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  </section>
  )
}
