'use client'
import { useState, useEffect, useCallback } from 'react'
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

// Tailwind color classes for avatar backgrounds
const avatarColors = [
  'bg-teal-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-pink-600',
  'bg-red-600',
  'bg-yellow-600',
  'bg-green-600',
  'bg-indigo-600',
  'bg-orange-600',
  'bg-rose-600',
]

// Function to assign a consistent color based on username
function getAvatarColor(username: string) {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
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

  const fetchComments = useCallback(async () => {
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
  }, [postId])

  const fetchReactions = useCallback(async () => {
    const { data, error } = await supabase.from('reactions').select('comment_id, type')

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
  }, [])

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

      const previousKey = (previousReaction + 's') as 'likes' | 'dislikes'

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

      const key = (type + 's') as 'likes' | 'dislikes'

      setReactionCounts((prev) => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          [key]: (prev[commentId]?.[key] || 0) + 1,
        },
      }))
    } else {
      console.error('Failed to insert reaction:', error.message)
    }
  }

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
  }, [fetchComments, fetchReactions])

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
        comment,
      },
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

      {/* Comments Section */}
      <h3 className="text-xl font-semibold mb-6 text-zinc-200">Comments</h3>

      <div className="space-y-6 mb-8">
        {comments.map((c) => (
          <div
            key={c.id}
            className="p-4 bg-zinc-700/50 border border-zinc-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            {/* Comment Header */}
            <div className="flex items-center gap-3 mb-3">
              {/* Dynamic Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getAvatarColor(c.username)}`}>
                {c.username.charAt(0).toUpperCase()}
              </div>

              {/* Name and Date */}
              <div>
                <p className="text-sm font-semibold text-zinc-200">
                  {c.username}
                </p>
                <p className="text-xs text-zinc-400">
                  {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Comment Body */}
            <p className="text-sm text-zinc-300 leading-relaxed mb-3">
              {c.comment}
            </p>

            {/* Reactions & Reply */}
            <div className="flex items-center gap-6 text-sm">
              {/* Like Button */}
              <button
                onClick={() => handleReaction(c.id, 'like')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors duration-300 ${
                  JSON.parse(localStorage.getItem('reacted_comments') || '{}')[c.id] === 'like'
                    ? 'text-teal-500 bg-teal-900/30'
                    : 'text-zinc-400 hover:text-teal-400 hover:bg-teal-900/20'
                }`}
              >
                <ThumbsUp size={16} />
                <span>{reactionCounts[c.id]?.likes || 0}</span>
              </button>

              {/* Dislike Button */}
              <button
                onClick={() => handleReaction(c.id, 'dislike')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors duration-300 ${
                  JSON.parse(localStorage.getItem('reacted_comments') || '{}')[c.id] === 'dislike'
                    ? 'text-red-500 bg-red-900/30'
                    : 'text-zinc-400 hover:text-red-400 hover:bg-red-900/20'
                }`}
              >
                <ThumbsDown size={16} />
                <span>{reactionCounts[c.id]?.dislikes || 0}</span>
              </button>

              {/* Reply Button (Future Feature) */}
              <button
                onClick={() => alert(`Replying to ${c.username}`)}
                className="ml-auto text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Form */}
      <h3 className="text-xl font-semibold mb-4 text-zinc-300">Leave a Comment</h3>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="text"
          placeholder="Your name"
          className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Your email (won’t be shown)"
          className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          placeholder="Your comment"
          className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600/20 text-white border border-zinc-700 rounded-md hover:bg-blue-900/20 transition inline-flex"
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Submit Comment'}
        </button>
      </form>

    </div>
  )
}
