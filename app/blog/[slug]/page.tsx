// app/blog/[slug]/page.tsx
import Script from 'next/script'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/Footer'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import CommentSectionWrapper from '@/components/CommentSectionWrapper'
import Image from 'next/image'

export default async function PostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params

  // Fetch the current post
  const { data: post, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !post) notFound()

  // Fetch categories (distinct and sorted)
  const { data: categoriesData } = await supabaseAdmin
    .from('posts')
    .select('category')
    .eq('status', 'published')

  const uniqueCategories = Array.from(
    new Set((categoriesData ?? []).map((c) => c.category))
  ).slice(0, 5)

  // Fetch 3 most recent posts (excluding current)
  const { data: recentPosts } = await supabaseAdmin
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, created_at')
    .eq('status', 'published')
    .neq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <>
      <section id="slugBlogPage" className="px-4 sm:px-6 w-full bg-zinc-800">
        <div className="max-w-6xl mx-auto py-32 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10">
          {/* Left: Main Content */}
          <div>
            <h1 className="text-3xl font-bold mb-2 text-zinc-300">{post.title}</h1>
            <p className="text-sm text-gray-500 text-zinc-300">
              By {post.created_by} • {new Date(post.created_at).toLocaleDateString()}
            </p>

            {post.cover_image && (
              <div className="relative w-full aspect-[16/9] my-6 rounded-xl overflow-hidden">
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

            <article className="prose prose-zinc max-w-none text-zinc-300">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>

            <Link href="/blog" className="block mt-10 text-teal-500 hover:underline">
              ← Back to Blog
            </Link>

            <CommentSectionWrapper postId={post.id} />
          </div>

          {/* Right: Sidebar */}
          <aside className="space-y-10 md:mt-20 bg-[#101828] rounded-xl px-4 py-3">
            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-zinc-300">Categories</h3>
              <ul className="space-y-2">
                {uniqueCategories.map((cat) => (
                  <li key={cat}>
                    <Link
                      href={`/blog?category=${encodeURIComponent(cat)}`}
                      className="text-sm text-zinc-300 hover:text-teal-500"
                    >
                      #{cat}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/blog/categories"
                className="mt-3 inline-block text-xs text-teal-500 hover:underline"
              >
                View more →
              </Link>
            </div>

            {/* Recent Posts */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-zinc-300">Recent Posts</h3>
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
                      <h4 className="text-sm font-medium text-teal-500 group-hover:underline line-clamp-1">
                        {p.title}
                      </h4>
                      <p className="text-xs text-zinc-300 line-clamp-2">
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
  const { data: posts } = await supabaseAdmin.from('posts').select('slug')

  return (posts ?? []).map((post) => ({
    slug: post.slug,
  }))
}
