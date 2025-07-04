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

type Props = {
  params: {
    slug: string
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params

//export default async function PostPage(props: { params: { slug: string } }) {
  //const { slug } = props.params

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