'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

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

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setComments(data as Comment[])
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

    {/*if (insertError) {
      console.error('Insert error:', insertError)
      setError(insertError.message || 'Failed to post comment')
    }*/}
    if (insertError) {
      console.error('Insert error:', insertError)

      // Provide a simple explanation for users
      if (insertError.message.includes('violates foreign key constraint')) {
        setError('Something went wrong. Please try again later.')
      } 
      else {
        setError('Failed to post comment. Please try again.')
      }
    } 
    else {
      setUsername('')
      setEmail('')
      setComment('')
      fetchComments()
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
            <p className="text-sm text-gray-600 font-medium">{c.username} • {new Date(c.created_at).toLocaleDateString()}</p>
            <p className="text-gray-800 text-sm mt-1">{c.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
