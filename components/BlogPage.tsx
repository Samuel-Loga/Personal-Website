'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'
import { FaTh, FaList, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Image from 'next/image'

const POSTS_PER_PAGE = 8; // posts per page

// Check screen size
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query); // initial value once the component mounts on the client
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches); // Update the value whenever the media query status changes
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener); // Clean up the event listener on component unmount
  }, [matches, query]);

  return matches;
}

// Hook for Debouncing
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// Type definition and reusable components
type Post = { id: string; title: string; slug: string; excerpt?: string; cover_image?: string; created_at: string; category?: string; };

// PostCard component
function PostCard({ post, view }: { post: Post; view: 'grid' | 'list' }) {
  
  if (view === 'list') { // List View Layout
    return (
      <Link href={`/blog/${post.slug}`} className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg shadow hover:shadow-lg transition-all bg-[#101828]">
        {post.cover_image && (
          <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0">
            <Image src={post.cover_image} alt={post.title} fill className="object-cover rounded-md" sizes="(max-width: 640px) 100vw, 192px" />
          </div>
        )}
        <div className="flex-grow">
          <span className="text-xs md:text-sm text-teal-600">{post.category || 'General'}</span>
          <h2 className="mt-1 font-semibold text-lg text-zinc-300">{post.title}</h2>
          <p className="mt-1 text-xs text-zinc-400 mb-2">{format(new Date(post.created_at), 'MMMM d, yyyy')}</p>
          <p className="text-sm text-zinc-300 line-clamp-3">{post.excerpt || 'No summary available.'}</p>
        </div>
      </Link>
    );
  }

  return ( // Grid View Layout
    <Link href={`/blog/${post.slug}`} className="flex flex-col rounded-lg overflow-hidden shadow hover:shadow-lg transition-all bg-[#101828]">
      {post.cover_image && (
        <div className="relative w-full h-48">
          <Image src={post.cover_image} alt={post.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" />
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs md:text-sm text-teal-600">{post.category || 'General'}</span>
        <h2 className="mt-1 font-semibold text-base text-zinc-300 flex-grow">{post.title}</h2>
        <p className="mt-2 text-xs text-zinc-400">{format(new Date(post.created_at), 'MMM d, yyyy')}</p>
        <p className="mt-2 text-xs text-zinc-300 line-clamp-3">{post.excerpt}</p>
      </div>
    </Link>
  );
}

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void; }) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) return null; // Don't show pagination if there's only one page

  return (
    <div className="flex items-center justify-center gap-4 mt-10">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 border border-zinc-700 rounded-md hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaChevronLeft size={12} />
        Previous
      </button>

      <span className="text-sm text-zinc-400">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 border border-zinc-700 rounded-md hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
        <FaChevronRight size={12} />
      </button>
    </div>
  );
}


// --- Main Blog Page Component ---
export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  // --- Logic for responsive default view
  const isDesktop = useMediaQuery('(min-width: 640px)'); // Check if the screen is larger than the 'sm' breakpoint (640px)
  const [view, setView] = useState<'grid' | 'list'>('list'); // Set the initial view state

  useEffect(() => { // Update the view when the screen size changes
    setView(isDesktop ? 'grid' : 'list');
  }, [isDesktop]);
  // ---

  const debouncedSearch = useDebounce(search, 500);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);


  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError(null);
      
      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;
      
      let query = supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (debouncedSearch) {
        query = query.ilike('title', `%${debouncedSearch}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
        setError('Could not fetch posts.');
        setPosts([]);
      } else {
        setPosts(data as Post[]);
        setTotalPosts(count ?? 0);
      }

      setLoading(false);
    };

    loadPosts();
  }, [debouncedSearch, currentPage]);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <section className="px-4 sm:px-6 w-full py-12 pb-14 bg-zinc-800 relative min-h-screen">
      <div className="max-w-6xl mx-auto mt-18 md:mt-20 relative">

        <header className="mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-zinc-100">
            Welcome to the Digital Journal!
          </h1>
        </header>
        
        {/* Header and Search/View toggle */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 sm:w-64 md:w-80 text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800"
          />
          <div className="flex items-center gap-2">
            <button onClick={() => setView('grid')} className={`p-2 rounded-md ${view === 'grid' ? 'bg-teal-800 text-white' : 'text-zinc-500 hover:bg-zinc-700'}`} title="Grid View">
              <FaTh size={20} />
            </button>
            <button onClick={() => setView('list')} className={`p-2 rounded-md ${view === 'list' ? 'bg-teal-800 text-white' : 'text-zinc-500 hover:bg-zinc-700'}`} title="List View">
              <FaList size={20} />
            </button>
          </div>
        </div>

        <p className="text-sm md:text-base text-zinc-300 max-w-3xl mb-8 md:mb-10">
          The world of technology is always moving. Here, I document my journey through the ever-evolving landscape of cybersecurity, web development, AI, and beyond. This is a space for deep dives, project stories, and reflections on the principles of our digital world.
        </p>

        {/* Post Display Area */}
        {loading ? (
          <p className="text-center text-zinc-500 py-9">Loading posts...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-9">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-zinc-500 py-9">No posts found.</p>
        ) : (
          <>
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

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </section>
  );
}