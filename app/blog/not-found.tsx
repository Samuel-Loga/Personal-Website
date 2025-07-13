// app/blog/not-found.tsx
import Link from 'next/link'

export default function BlogNotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-zinc-800">
      <h1 className="text-4xl font-bold text-red-500 mb-4">404 – Post Not Found</h1>
      <p className="mb-6 text-white">
        Sorry, the blog post you&apos;re looking for doesn&apos;t exist or may have been unpublished.
      </p>
      <Link href="/blog" className="block mt-10 text-teal-500 hover:underline">
        ← Back to Blog
      </Link>
    </div>
  )
}
