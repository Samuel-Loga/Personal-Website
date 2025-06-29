'use client'

import dynamic from 'next/dynamic'

const CommentSection = dynamic(() => import('./CommentSection'), { ssr: false })

export default function CommentSectionWrapper({ postId }: { postId: string }) {
  return <CommentSection postId={postId} />
}
