// app/blog/[slug]/page.tsx

import { supabase } from '@/lib/supabaseClient'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Post = {
  title: string
  content: string
  created_by: string
  created_at: string
  slug: string
  status: string
  cover_image: string
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    notFound()
  }

  const post = data as Post

  return (
    <div className="max-w-3xl mx-auto py-32 px-6">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p>{post.created_by}</p>
      <p className="text-sm text-gray-500 mb-6">
        Published on {new Date(post.created_at).toLocaleDateString()}
      </p>

      {post.cover_image && (
        <img
          src={post.cover_image}
          alt={post.title}
          className="mb-6 w-full rounded-md"
        />
      )}

      <article className="prose prose-zinc max-w-none">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      <Link href="/blog" className="block mt-10 text-blue-600 hover:underline">
        ← Back to Blog
      </Link>
    </div>
  )
}
