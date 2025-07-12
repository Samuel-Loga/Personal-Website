// app/blog/not-found.tsx
import Link from 'next/link'

export default function BlogNotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">404 – Post Not Found</h1>
      <p className="text-gray-600 mb-6">
        Sorry, the blog post you&apos;re looking for doesn&apos;t exist or may have been unpublished.
      </p>
      <Link href="/blog" className="block mt-10 text-blue-600 hover:underline">
        ← Back to Blog
      </Link>
    </div>
  )
}
