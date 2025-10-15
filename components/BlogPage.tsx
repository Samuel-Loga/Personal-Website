'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'
import { FaTh, FaList, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Image from 'next/image'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

// --- This is the new Server Component that will wrap our page ---
export default function BlogPage() {
  return (
    // The Suspense boundary tells Next.js how to handle client-side data fetching
    <Suspense fallback={<BlogPageLoading />}>
      <BlogPageClient />
    </Suspense>
  )
}

// --- A simple loading component for the fallback ---
function BlogPageLoading() {
    return (
        <section className="px-4 sm:px-6 w-full py-12 pb-14 bg-zinc-800 relative min-h-screen">
            <div className="max-w-6xl mx-auto mt-18 md:mt-20 relative">
                <p className="text-center text-zinc-500 py-9">Loading...</p>
            </div>
        </section>
    );
}


// --- All of your original code is now inside this client component ---
function BlogPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category_id');

  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const isDesktop = useMediaQuery('(min-width: 640px)');
  const [view, setView] = useState<'grid' | 'list'>('list');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setView(isDesktop ? 'grid' : 'list');
  }, [isDesktop]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, categoryId]);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError(null);
      setCategoryName('');
      
      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;
      
      let query = supabase
        .from('posts')
        .select('*, categories(id, name)', { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      if (debouncedSearch) {
        query = query.ilike('title', `%${debouncedSearch}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        setError('Could not fetch posts.');
        setPosts([]);
      } else {
        setPosts(data as Post[]);
        setTotalPosts(count ?? 0);
        if (categoryId && data && data.length > 0) {
          setCategoryName(data[0].categories?.name || '');
        }
      }
      setLoading(false);
    };
    loadPosts();
  }, [debouncedSearch, currentPage, categoryId]);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const clearFilters = () => {
    router.push(pathname); 
    setSearch('');
  }

  return (
    <section className="px-4 sm:px-6 w-full py-12 pb-14 bg-zinc-800 relative min-h-screen">
      <div className="max-w-6xl mx-auto mt-18 md:mt-20 relative">
        <header className="mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-zinc-100">
            Welcome to the Digital Journal!
          </h1>
          {categoryId && !loading && (
            <div className="mt-2 text-lg text-teal-400 flex items-center gap-2">
              <span className="text-sm md:text-base">Showing posts in: <span className="font-semibold underline">{categoryName || '...'}</span></span>
              <button onClick={clearFilters} className="text-sm text-zinc-400 hover:text-white" title="Clear filter">(Clear filter)</button>
            </div>
          )}
        </header>
        
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


// --- All the helper components and types from your original file go here ---

const POSTS_PER_PAGE = 8;

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);
  return matches;
}

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

type Post = { 
  id: string; 
  title: string; 
  slug: string; 
  excerpt?: string; 
  cover_image?: string; 
  created_at: string; 
  categories: { id: string; name: string } | null; 
};

function PostCard({ post, view }: { post: Post; view: 'grid' | 'list' }) {
  const categoryName = post.categories?.name || 'Uncategorized';
  const categoryId = post.categories?.id;
  const CategoryLink = (
    <Link 
      href={`/blog?category_id=${categoryId}`}
      onClick={(e) => e.stopPropagation()}
      className="text-xs md:text-sm text-teal-600 hover:underline z-10 relative"
      title={`Filter by ${categoryName}`}
    >
      {categoryName}
    </Link>
  );

  if (view === 'list') {
    return (
      <Link href={`/blog/${post.slug}`} className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg shadow hover:shadow-lg transition-all bg-[#101828]">
        {post.cover_image && (
          <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0">
            <Image src={post.cover_image} alt={post.title} fill className="object-cover rounded-md" sizes="(max-width: 640px) 100vw, 192px" />
          </div>
        )}
        <div className="flex-grow">
          {CategoryLink}
          <h2 className="mt-1 font-semibold text-lg text-zinc-300">{post.title}</h2>
          <p className="mt-1 text-xs text-zinc-400 mb-2">{format(new Date(post.created_at), 'MMMM d, yyyy')}</p>
          <p className="text-sm text-zinc-300 line-clamp-3">{post.excerpt || 'No summary available.'}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="flex flex-col rounded-lg overflow-hidden shadow hover:shadow-lg transition-all bg-[#101828]">
      {post.cover_image && (
        <div className="relative w-full h-48">
          <Image src={post.cover_image} alt={post.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" />
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        {CategoryLink}
        <h2 className="mt-1 font-semibold text-base text-zinc-300 flex-grow">{post.title}</h2>
        <p className="mt-2 text-xs text-zinc-400">{format(new Date(post.created_at), 'MMM d, yyyy')}</p>
        <p className="mt-2 text-xs text-zinc-300 line-clamp-3">{post.excerpt}</p>
      </div>
    </Link>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void; }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-4 mt-10">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 border border-zinc-700 rounded-md hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed">
        <FaChevronLeft size={12} /> Previous
      </button>
      <span className="text-sm text-zinc-400">Page {currentPage} of {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 border border-zinc-700 rounded-md hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed">
        Next <FaChevronRight size={12} />
      </button>
    </div>
  );
}

