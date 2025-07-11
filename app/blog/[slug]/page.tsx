// app/blog/[slug]/page.tsx
import Script from 'next/script'
import { supabase } from '@/lib/supabaseClient'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/Footer'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import CommentSectionWrapper from '@/components/CommentSectionWrapper'
import Image from 'next/image'

{/*type Post = {
  id: string
  title: string
  content: string
  created_by: string
  created_at: string
  slug: string
  status: string
  cover_image: string
  excerpt: string
  category: string
}*/}

// Removed invalid PageProps import

//export default async function PostPage({ params }: { params: { slug: string } }) {
  //const { slug } = await params;

export default async function PostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params

  // Fetch the current post
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !post) notFound()

  // Fetch categories (distinct and sorted)
  const { data: categoriesData } = await supabase
    .from('posts')
    .select('category')
    .eq('status', 'published')

  const uniqueCategories = Array.from(
    new Set((categoriesData ?? []).map((c) => c.category))
  ).slice(0, 5)

  // Fetch 3 most recent posts (excluding current)
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, created_at')
    .eq('status', 'published')
    .neq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <>
      <section id="slugBlogPage" className="px-4 sm:px-6 w-full">
        <div className="max-w-6xl mx-auto py-32 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10">
          {/* Left: Main Content */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
            <p className="text-sm text-gray-500">
              By {post.created_by} • {new Date(post.created_at).toLocaleDateString()}
            </p>

            {post.cover_image && (
              <div className="relative w-full aspect-[16/9] my-6 rounded-md overflow-hidden">
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              </div>
            )}

            <article className="prose prose-zinc max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>

            <Link href="/blog" className="block mt-10 text-blue-600 hover:underline">
              ← Back to Blog
            </Link>

            <CommentSectionWrapper postId={post.id} />
          </div>

          {/* Right: Sidebar */}
          <aside className="space-y-10 md:mt-20">
            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <ul className="space-y-2">
                {uniqueCategories.map((cat) => (
                  <li key={cat}>
                    <Link
                      href={`/blog?category=${encodeURIComponent(cat)}`}
                      className="text-sm text-gray-700 hover:text-blue-600"
                    >
                      #{cat}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/blog/categories"
                className="mt-2 inline-block text-xs text-blue-600 hover:underline"
              >
                View more →
              </Link>
            </div>

            {/* Recent Posts */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
              <div className="space-y-4">
                {recentPosts?.map((p) => (
                  <Link
                    key={p.id}
                    href={`/blog/${p.slug}`}
                    className="flex items-start gap-4 group"
                  >
                    {p.cover_image && (
                      <Image
                        src={p.cover_image}
                        alt={p.title}
                        width={64}
                        height={64}
                        className="object-cover rounded-md"
                      />
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 line-clamp-1">
                        {p.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {p.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
      <ScrollToTopButton />

      <Script id="chatbase-init" strategy="afterInteractive">
        {`
          (function(){
            if(!window.chatbase||window.chatbase("getState")!=="initialized"){
              window.chatbase=(...arguments)=>{
                if(!window.chatbase.q){window.chatbase.q=[]}
                window.chatbase.q.push(arguments)
              };
              window.chatbase=new Proxy(window.chatbase,{
                get(target,prop){
                  if(prop==="q"){return target.q}
                  return(...args)=>target(prop,...args)
                }
              })
            }
            const onLoad=function(){
              const script=document.createElement("script");
              script.src="https://www.chatbase.co/embed.min.js";
              script.id="T1jY2k7puJwXWJP4Q1FB-";
              script.domain="www.chatbase.co";
              document.body.appendChild(script)
            };
            if(document.readyState==="complete"){onLoad()}
            else{window.addEventListener("load",onLoad)}
          })();
        `}
      </Script>
    </>
  )
}

export async function generateStaticParams() {
  const { data: posts } = await supabase.from('posts').select('slug')

  return (posts ?? []).map((post) => ({
    slug: post.slug,
  }))
}



{/*

// Deleted components/CommentSection.tsx due to server client logic

'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ThumbsUp, ThumbsDown } from 'react-feather'

type Comment = {
  id: string
  post_id: string
  username: string
  email: string
  comment: string
  created_at: string
}

export default function CommentSection({ postId }: { postId: string }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [error, setError] = useState('')

  const [reactionCounts, setReactionCounts] = useState<
    Record<string, { likes: number; dislikes: number }>
  >({})

  // Combined useEffect for loading saved data and fetching from DB
  useEffect(() => {
    const savedUsername = localStorage.getItem('comment_username')
    const savedEmail = localStorage.getItem('comment_email')

    if (savedUsername) setUsername(savedUsername)
    if (savedEmail) setEmail(savedEmail)

    const init = async () => {
      await fetchComments()
      await fetchReactions()
    }

    init()
  }, [])

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch comments error:', error)
    } else {
      setComments(data as Comment[])
    }
  }

  const fetchReactions = async () => {
    const { data, error } = await supabase
      .from('reactions')
      .select('comment_id, type')

    if (!error && data) {
      const counts: Record<string, { likes: number; dislikes: number }> = {}

      data.forEach((r) => {
        const commentId = r.comment_id
        const type = r.type
        if (!counts[commentId]) counts[commentId] = { likes: 0, dislikes: 0 }
        if (type === 'like') counts[commentId].likes += 1
        if (type === 'dislike') counts[commentId].dislikes += 1
      })

      setReactionCounts(counts)
    } else {
      console.error('Fetch reactions error:', error)
    }
  }

  const handleReaction = async (commentId: string, type: 'like' | 'dislike') => {
    const reacted = JSON.parse(localStorage.getItem('reacted_comments') || '{}')
    const previousReaction = reacted[commentId]

    // Undo same reaction
    if (previousReaction === type) {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .match({ comment_id: commentId, type })

      if (!error) {
        delete reacted[commentId]
        localStorage.setItem('reacted_comments', JSON.stringify(reacted))

        const previousKey = (previousReaction + 's') as 'likes' | 'dislikes'

        setReactionCounts((prev) => ({
          ...prev,
          [commentId]: {
            ...prev[commentId],
            [previousKey]: Math.max(0, (prev[commentId]?.[previousKey] || 1) - 1),
          },
        }))
        
      } else {
        console.error('Failed to undo reaction:', error.message)
      }

      return
    }

    // Remove previous opposite reaction if any
    if (previousReaction) {
      await supabase
        .from('reactions')
        .delete()
        .match({ comment_id: commentId, type: previousReaction })

      // Convert 'like' | 'dislike' to 'likes' | 'dislikes'
      const previousKey = (previousReaction + 's') as 'likes' | 'dislikes'

      // Decrement opposite reaction count locally
      setReactionCounts((prev) => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          [previousKey]: Math.max(0, (prev[commentId]?.[previousKey] || 1) - 1),
        },
      }))
    }

    // Add new reaction
    const { error } = await supabase.from('reactions').insert([
      { comment_id: commentId, type },
    ])

    if (!error) {
      reacted[commentId] = type
      localStorage.setItem('reacted_comments', JSON.stringify(reacted))

      // Fix here: convert type ('like' | 'dislike') to state key ('likes' | 'dislikes')
      const key = (type + 's') as 'likes' | 'dislikes'

      // Increment new reaction count locally
      setReactionCounts((prev) => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          [key]: (prev[commentId]?.[key] || 0) + 1,
        },
      }))
    }  else {
      console.error('Failed to insert reaction:', error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!username || !email || !comment) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('comments').insert([
      {
        post_id: postId,
        username,
        email,
        comment
      }
    ])

    if (insertError) {
      console.error('Insert error:', insertError)

      if (insertError.message.includes('violates foreign key constraint')) {
        setError('Something went wrong. Please try again later.')
      } else {
        setError('Failed to post comment. Please try again.')
      }
    } else {
      // Save to localStorage only on success
      localStorage.setItem('comment_username', username)
      localStorage.setItem('comment_email', email)

      setUsername('')
      setEmail('')
      setComment('')
      await fetchComments()
    }

    setLoading(false)
  }

  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold mb-4">Leave a Comment</h3>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="text"
          placeholder="Your name"
          className="w-full px-4 py-2 border rounded-md"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Your email (won’t be shown)"
          className="w-full px-4 py-2 border rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          placeholder="Your comment"
          className="w-full px-4 py-2 border rounded-md"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Submit Comment'}
        </button>
      </form>

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="border-b pb-2">
            <p className="text-sm text-gray-600 font-medium">
              {c.username} • {new Date(c.created_at).toLocaleDateString()}
            </p>
            <p className="text-gray-800 text-sm mt-1">{c.comment}</p>

            {/* Reactions /}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <button
                onClick={() => handleReaction(c.id, 'like')}
                className={`flex items-center gap-1 hover:text-blue-600 ${
                  reactionCounts[c.id]?.likes && JSON.parse(localStorage.getItem('reacted_comments') || '{}')[c.id] === 'like'
                    ? 'text-blue-600 font-semibold'
                    : ''
                }`}
              >
                <ThumbsUp size={16} />
                {reactionCounts[c.id]?.likes || 0}
              </button>
              <button
                onClick={() => handleReaction(c.id, 'dislike')}
                className={`flex items-center gap-1 hover:text-red-500 ${
                  reactionCounts[c.id]?.dislikes && JSON.parse(localStorage.getItem('reacted_comments') || '{}')[c.id] === 'dislike'
                    ? 'text-red-500 font-semibold'
                    : ''
                }`}
              >
                <ThumbsDown size={16} />
                {reactionCounts[c.id]?.dislikes || 0}
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}
  
*/}



{/*

// Deleted components/CommentSectionWrapper.tsx due to server client logic

'use client'

import dynamic from 'next/dynamic'

const CommentSection = dynamic(() => import('./CommentSection'), { ssr: false })

export default function CommentSectionWrapper({ postId }: { postId: string }) {
  return <CommentSection postId={postId} />
}


*/}