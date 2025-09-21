'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'
import { FaTh, FaList } from 'react-icons/fa'
import Image from 'next/image'

// --- Custom Hook for Debouncing ---
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

// --- Type Definition ---
type Post = {
  id: string
  title: string
  slug: string
  excerpt?: string
  cover_image?: string
  created_at: string
  category?: string
}

// --- New Reusable PostCard Component ---
function PostCard({ post, view }: { post: Post; view: 'grid' | 'list' }) {
  if (view === 'list') {
    // --- List View Layout ---
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg shadow hover:shadow-lg transition-all bg-[#101828]"
      >
        {post.cover_image && (
          <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover rounded-md"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          </div>
        )}
        <div className="flex-grow">
          <span className="text-xs md:text-sm text-teal-600">{post.category || 'General'}</span>
          <h2 className="mt-1 font-semibold text-lg text-zinc-300">{post.title}</h2>
          <p className="mt-1 text-xs text-zinc-400 mb-2">
            {format(new Date(post.created_at), 'MMMM d, yyyy')}
          </p>
          <p className="text-sm text-zinc-400 line-clamp-2">{post.excerpt || 'No summary available.'}</p>
        </div>
      </Link>
    )
  }

  // --- Grid View Layout ---
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex flex-col rounded-lg overflow-hidden shadow hover:shadow-lg transition-all bg-[#101828]"
    >
      {post.cover_image && (
        <div className="relative w-full h-48">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs md:text-sm text-teal-600">{post.category || 'General'}</span>
        <h2 className="mt-1 font-semibold text-base text-zinc-300 flex-grow">{post.title}</h2>
        <p className="mt-2 text-xs text-zinc-400">
          {format(new Date(post.created_at), 'MMM d, yyyy')}
        </p>
      </div>
    </Link>
  )
}

// --- Main Blog Page Component ---
export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      // If the user is searching, add the text filter
      if (debouncedSearch) {
        query = query.ilike('title', `%${debouncedSearch}%`)
      }

      // Execute the query
      const { data, error } = await query

      if (error) {
        console.error('Error fetching posts:', error)
        setError('Could not fetch posts. Please try again later.')
        setPosts([])
      } else {
        setPosts(data as Post[])
      }

      setLoading(false)
    }

    loadPosts()
  }, [debouncedSearch]) // Re-run this effect when the debounced search term changes

  return (
    <section className="px-4 sm:px-6 w-full py-12 pb-10 bg-zinc-800 relative min-h-screen">
      <div className="max-w-6xl mx-auto mt-18 relative">
        <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap mb-8">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[350px] text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-md ${view === 'grid' ? 'bg-teal-800 text-white' : 'text-zinc-500 hover:bg-zinc-700'}`}
              title="Grid View"
            >
              <FaTh size={20} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-md ${view === 'list' ? 'bg-teal-800 text-white' : 'text-zinc-500 hover:bg-zinc-700'}`}
              title="List View"
            >
              <FaList size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-zinc-500 py-9">Loading posts...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-9">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-zinc-500 py-9">No posts found.</p>
        ) : (
          <div
            className={
              view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'
                : 'flex flex-col gap-6'
            }
          >
            {posts.map((post) => (
              <PostCard key={post.id} post={post} view={view} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}