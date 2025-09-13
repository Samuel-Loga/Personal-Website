'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ThumbsUp, ThumbsDown } from 'react-feather';

type Comment = {
  id: string;
  post_id: string;
  username: string;
  email: string;
  comment: string;
  created_at: string;
};

type Reply = {
  id: string;
  comment_id: string;
  username: string;
  email: string;
  reply_text: string;
  created_at: string;
};

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
];

// Assign consistent color based on username
function getAvatarColor(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function CommentSection({ postId }: { postId: string }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState('');

  const [reactionCounts, setReactionCounts] = useState<
    Record<string, { likes: number; dislikes: number }>
  >({});

  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [replyFormData, setReplyFormData] = useState<
    Record<string, { username: string; email: string; reply_text: string }>
  >({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  /** Fetch comments */
  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data as Comment[]);
    } else {
      console.error('Error fetching comments:', error?.message);
    }
  }, [postId]);

  /** Fetch reactions */
  const fetchReactions = useCallback(async () => {
    const { data, error } = await supabase.from('reactions').select('comment_id, type');

    if (!error && data) {
      const counts: Record<string, { likes: number; dislikes: number }> = {};
      data.forEach((r) => {
        if (!counts[r.comment_id]) counts[r.comment_id] = { likes: 0, dislikes: 0 };
        if (r.type === 'like') counts[r.comment_id].likes += 1;
        if (r.type === 'dislike') counts[r.comment_id].dislikes += 1;
      });
      setReactionCounts(counts);
    } else {
      console.error('Error fetching reactions:', error?.message);
    }
  }, []);

  /** Fetch replies */
  const fetchReplies = useCallback(async () => {
    const { data, error } = await supabase
      .from('replies')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      const grouped: Record<string, Reply[]> = {};
      data.forEach((reply) => {
        if (!grouped[reply.comment_id]) grouped[reply.comment_id] = [];
        grouped[reply.comment_id].push(reply);
      });
      setReplies(grouped);
    } else {
      console.error('Error fetching replies:', error?.message);
    }
  }, []);

  /** Load initial data */
  useEffect(() => {
    const savedUsername = localStorage.getItem('comment_username');
    const savedEmail = localStorage.getItem('comment_email');

    if (savedUsername) setUsername(savedUsername);
    if (savedEmail) setEmail(savedEmail);

    const init = async () => {
      await fetchComments();
      await fetchReactions();
      await fetchReplies();
    };
    init();
  }, [fetchComments, fetchReactions, fetchReplies]);

  /** Handle comment form submission */
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username || !email || !comment) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('comments').insert([
      {
        post_id: postId,
        username,
        email,
        comment,
      },
    ]);

    if (insertError) {
      console.error('Error inserting comment:', insertError.message);
      setError('Failed to post comment. Please try again.');
    } else {
      localStorage.setItem('comment_username', username);
      localStorage.setItem('comment_email', email);

      setComment('');
      await fetchComments();
    }
    setLoading(false);
  };

  /** Handle reply form changes */
  const handleReplyChange = (commentId: string, field: string, value: string) => {
    setReplyFormData((prev) => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        [field]: value,
      },
    }));
  };

  /** Submit a reply */
  const handleReplySubmit = async (commentId: string) => {
    const form = replyFormData[commentId];
    if (!form?.username || !form?.email || !form?.reply_text) {
      alert('Please fill in all reply fields');
      return;
    }

    const { error } = await supabase.from('replies').insert([
      {
        comment_id: commentId,
        username: form.username,
        email: form.email,
        reply_text: form.reply_text,
      },
    ]);

    if (error) {
      console.error('Error inserting reply:', error.message);
      alert('Failed to post reply');
      return;
    }

    setReplyFormData((prev) => ({
      ...prev,
      [commentId]: { username: '', email: '', reply_text: '' },
    }));

    setReplyingTo(null);
    await fetchReplies();
  };

  /** Handle reactions (like/dislike) */
  const handleReaction = async (commentId: string, type: 'like' | 'dislike') => {
    const reacted = JSON.parse(localStorage.getItem('reacted_comments') || '{}');
    const previousReaction = reacted[commentId];

    // Undo same reaction
    if (previousReaction === type) {
      await supabase.from('reactions').delete().match({ comment_id: commentId, type });
      delete reacted[commentId];
      localStorage.setItem('reacted_comments', JSON.stringify(reacted));

      setReactionCounts((prev) => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          [type + 's' as 'likes' | 'dislikes']: Math.max(0, (prev[commentId]?.[type + 's' as 'likes' | 'dislikes'] || 1) - 1),
        },
      }));
      return;
    }

    // Remove opposite reaction first
    if (previousReaction) {
      await supabase.from('reactions').delete().match({ comment_id: commentId, type: previousReaction });
    }

    // Add new reaction
    await supabase.from('reactions').insert([{ comment_id: commentId, type }]);

    reacted[commentId] = type;
    localStorage.setItem('reacted_comments', JSON.stringify(reacted));

    setReactionCounts((prev) => ({
      ...prev,
      [commentId]: {
        likes: type === 'like' ? (prev[commentId]?.likes || 0) + 1 : prev[commentId]?.likes || 0,
        dislikes: type === 'dislike' ? (prev[commentId]?.dislikes || 0) + 1 : prev[commentId]?.dislikes || 0,
      },
    }));
  };

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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getAvatarColor(c.username)}`}>
                {c.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-200">{c.username}</p>
                <p className="text-xs text-zinc-400">
                  {new Date(c.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                  })}
                </p>
              </div>
            </div>

            {/* Comment Body */}
            <p className="text-sm text-zinc-300 leading-relaxed mb-3">{c.comment}</p>

            {/* Reactions & Reply */}
            <div className="flex items-center gap-6 text-sm">
              {/* Like */}
              <button
                onClick={() => handleReaction(c.id, 'like')}
                className={`flex items-center gap-1 pr-2 py-1 rounded-md transition-colors duration-300 ${
                  JSON.parse(localStorage.getItem('reacted_comments') || '{}')[c.id] === 'like'
                    ? 'text-teal-500 bg-teal-900/30'
                    : 'text-zinc-400 hover:text-teal-400 hover:bg-teal-900/20'
                }`}
              >
                <ThumbsUp size={16} />
                <span>{reactionCounts[c.id]?.likes || 0}</span>
              </button>

              {/* Dislike */}
              <button
                onClick={() => handleReaction(c.id, 'dislike')}
                className={`flex items-center gap-1 pr-2 py-1 rounded-md transition-colors duration-300 ${
                  JSON.parse(localStorage.getItem('reacted_comments') || '{}')[c.id] === 'dislike'
                    ? 'text-red-500 bg-red-900/30'
                    : 'text-zinc-400 hover:text-red-400 hover:bg-red-900/20'
                }`}
              >
                <ThumbsDown size={16} />
                <span>{reactionCounts[c.id]?.dislikes || 0}</span>
              </button>

              {/* Reply Toggle */}
              <button
                onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                className="ml-auto text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Reply
              </button>
            </div>

            {/* Display Replies */}
            {replies[c.id] && (
              <div className="ml-6 mt-4 space-y-3">
                {replies[c.id].map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start gap-3 bg-zinc-800/40 p-3 rounded-md text-zinc-300 border border-zinc-700"
                  >
                    {/* Reply Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getAvatarColor(r.username)}`}>
                      {r.username.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-zinc-200">{r.username}</p>
                      <p className="text-xs text-zinc-400">
                        {new Date(r.created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true,
                        })}
                      </p>
                      <p className="mt-1">{r.reply_text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Form */}
            {replyingTo === c.id && (
              <div className="mt-4 ml-6 space-y-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full p-2 rounded bg-zinc-800 text-zinc-200 border border-zinc-600"
                  value={replyFormData[c.id]?.username || ''}
                  onChange={(e) => handleReplyChange(c.id, 'username', e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full p-2 rounded bg-zinc-800 text-zinc-200 border border-zinc-600"
                  value={replyFormData[c.id]?.email || ''}
                  onChange={(e) => handleReplyChange(c.id, 'email', e.target.value)}
                />
                <textarea
                  placeholder="Write your reply..."
                  className="w-full px-3 py-2 text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800"
                  rows={2}
                  value={replyFormData[c.id]?.reply_text || ''}
                  onChange={(e) => handleReplyChange(c.id, 'reply_text', e.target.value)}
                />
                <button
                  onClick={() => handleReplySubmit(c.id)}
                  className="px-4 py-1 bg-teal-600/20 text-teal-400 rounded-md hover:bg-teal-900/30 text-sm transition-colors"
                >
                  Submit Reply
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comment Form */}
      <h3 className="text-xl font-semibold mb-4 text-zinc-300">Leave a Comment</h3>
      <form onSubmit={handleSubmitComment} className="space-y-4 mb-6">
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
  );
}
