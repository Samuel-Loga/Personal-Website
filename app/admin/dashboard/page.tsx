'use client'

import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Mail, PlusCircle, Edit, Trash2, Newspaper, MessageSquare, Folder, Users, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// --- Type Definitions ---
type Post = {
  id: string; // uuid
  title: string;
  status?: 'Published' | 'Draft';
  content: string;
  cover_image: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  excerpt: string;
  categories: { name: string } | null; 
  // For the UI, we will need to calculate these
  comments_count?: number;
  likes_count?: number;
};

type Comment = {
  id: string; // uuid
  username: string;
  email: string;
  comment: string;
  created_at: string;
  post_id: string;
  // For the UI
  post_title?: string;
  status?: 'Published' | 'Unpublished'; // Assuming you add this field for moderation
};

type Category = {
  id: string; // UUID is a string
  name: string;
  description: string | null;
  post_count?: number;
};

type Subscriber = {
    id: number;
    email: string;
    created_at: string;
};

type Status = 'Published' | 'published' | 'Draft' | 'draft' | 'Unpublished' | 'unpublished' | 'pending' | 'confirmed';

type FetchedComment = Comment & {
  posts: { title: string };
};

// --- Main Dashboard Component ---
export default function AdminDashboardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]); // Assuming a subscribers table
  const [loading, setLoading] = useState(true);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // --- Logout Handler ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- Set Page Title ---
  useEffect(() => {
    document.title = 'Admin Dashboard | Samuel Loga Portfolio';
  }, []);


  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [postsRes, commentsRes, categoriesRes, subscribersRes] = await Promise.all([
        supabase.from('posts').select('*, categories(name)'),
        supabase.from('comments').select('*, posts(title)'),
        supabase.from('categories').select('*, posts(count)'),
        supabase.from('subscribers').select('*').order('created_at', { ascending: false })
      ]);
      if (postsRes.data) setPosts(postsRes.data);
      if (commentsRes.data) setComments((commentsRes.data as any[]).map(c => ({...c, post_title: c.posts?.title || 'N/A'})));
      if (categoriesRes.data) setCategories(categoriesRes.data.map((cat: any) => ({ ...cat, post_count: cat.posts[0]?.count ?? 0 })));
      if (subscribersRes.data) setSubscribers(subscribersRes.data as Subscriber[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // --- Navigation Handlers ---
  const handleAddNewPost = () => { 
    router.push('/admin/new');
  };

  const handleEditPost = (id: string) => {
    router.push(`/admin/edit/${id}`);
  };

  // --- CRUD Handlers ---
  const handleDeletePost = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      const { error } = await supabase.from('posts').delete().match({ id });
      if (error) {
        alert(`Error deleting post: ${error.message}`);
      } else {
        setPosts(posts.filter(p => p.id !== id));
        alert('Post deleted successfully.');
      }
    }
  };

  const handleUpdateCommentStatus = async (id: string, newStatus: 'Published' | 'Unpublished') => {
    // NOTE: You need to add a 'status' column to your 'comments' table in Supabase.
    // For now, this will only update the local state.
    // const { error } = await supabase.from('comments').update({ status: newStatus }).match({ id });
    // if(error) alert(`Error updating comment: ${error.message}`);
    setComments(comments.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };
  
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const categoryData = { name: newCategoryName, description: newCategoryDescription };
    let error, data;
    if (editingCategory) {
      ({ data, error } = await supabase.from('categories').update(categoryData).eq('id', editingCategory.id).select('*, posts(count)').single());
    } else {
      ({ data, error } = await supabase.from('categories').insert(categoryData).select('*, posts(count)').single());
    }
    if (error) {
      alert(`Error: ${error.message}`);
    } else if(data) {
      const processedCategory = { ...data, post_count: data.posts[0]?.count ?? 0 };
      if (editingCategory) {
        setCategories(categories.map(c => c.id === editingCategory.id ? processedCategory : c));
      } else {
        setCategories([...categories, processedCategory]);
      }
      setIsCategoryModalOpen(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure? This will un-categorize associated posts.')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) setCategories(categories.filter(c => c.id !== id));
      else alert(`Error: ${error.message}`);
    }
  };
  
  const openCategoryModal = (category: Category | null = null) => {
    setEditingCategory(category);
    setNewCategoryName(category ? category.name : '');
    setNewCategoryDescription(category ? category.description || '' : '');
    setIsCategoryModalOpen(true);
  };

  // Removed duplicate sendNewsletter function to resolve redeclaration error.

  const handleDeleteSubscriber = async (id: number) => {
      if (window.confirm('Are you sure you want to remove this subscriber?')) {
          const { error } = await supabase.from('subscribers').delete().match({ id });
          if (error) {
              alert(`Error removing subscriber: ${error.message}`);
          } else {
              setSubscribers(subscribers.filter(s => s.id !== id));
              alert('Subscriber removed.');
          }
      }
  };

  {/* --- Newsletter Sending Handler (with Edge Function) --- */}
  const sendNewsletter = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newsletterSubject || !newsletterContent) {
          alert('Please fill in both the subject and content.');
          return;
      }
      if (subscribers.length === 0) {
          alert('There are no subscribers to send to.');
          return;
      }

      setIsSending(true);

      // Invoke the Supabase Edge Function named 'send-newsletter'
      const { error } = await supabase.functions.invoke('send-newsletter', {
          body: {
              subject: newsletterSubject,
              content: newsletterContent,
          },
      });

      setIsSending(false);

      if (error) {
          alert(`Error sending newsletter: ${error.message}`);
      } else {
          alert('Newsletter has been sent successfully!');
          setNewsletterSubject('');
          setNewsletterContent('');
      }
  };  

  if (loading) {
    return <div className="bg-gray-900 text-white flex justify-center items-center min-h-screen">Loading Dashboard...</div>;
  }

  return (
    <div className="bg-zinc-800 min-h-screen p-4 sm:p-6 lg:p-8 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto pt-24">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl text-zinc-200 font-bold tracking-tight sm:pt">Admin Dashboard | Activity Overview</h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Welcome back. Here&apos;s an overview of your blog.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-zinc-300 py-2 px-4 border border-zinc-700 rounded-md hover:bg-zinc-700 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        {/* Stat Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
              title="Total Posts" 
              value={posts.length} 
              icon={<Newspaper size={24} className="text-teal-400" />} 
              color="teal"
          />
          <StatCard 
              title="Total Comments" 
              value={comments.length} 
              icon={<MessageSquare size={24} className="text-sky-400" />} 
              color="sky"
          />
          <StatCard 
              title="Post Categories" 
              value={categories.length} 
              icon={<Folder size={24} className="text-amber-400" />} 
              color="amber"
          />
          <StatCard 
              title="Newsletter Subscribers" 
              value={subscribers.length} 
              icon={<Users size={24} className="text-indigo-400" />} 
              color="indigo"
          />
      </section>

        {/* Engagement Chart (Using placeholder data) */}
        <section className="bg-gray-900 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl text-zinc-300 font-semibold mb-4">Content Engagement</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[{name: 'Posts', count: posts.length}, {name: 'Comments', count: comments.length}]}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                    <Bar dataKey="count" fill="#8884d8" name="Total" />
                </BarChart>
            </ResponsiveContainer>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
                {/* Posts Management */}
                <ManagementSection 
                    title="Manage Posts"
                    button={
                        <button onClick={handleAddNewPost} className="flex items-center gap-2 text-sm text-white py-2 px-3 border border-zinc-700 rounded-md bg-blue-900/40 hover:bg-blue-900/20 transition inline-flex">
                            <PlusCircle size={16} /> Add New Post
                        </button>
                    }
                >
                  <DataTable
                    headers={['Title', 'Category', '# Comments', 'Created On', 'Updated On', 'Status' ,'Actions']}
                    rows={posts.map((post, index) => (
                      <tr 
                        key={post.id}
                        className={`hover:bg-teal-900/20 ${index % 2 === 0 ? 'bg-transparent' : 'bg-zinc-800/50'}`}
                      >
                        <td className="px-4 py-3 text-zinc-300"><p className="truncate w-32" title={post.title}>{post.title}</p></td>
                        <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                                {post.categories?.name || 'Uncategorized'}
                        </td>
                        <td className="px-4 py-3 text-zinc-300">{post.comments_count}</td>
                        <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">{new Date(post.created_at).toLocaleDateString('en-US', {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, })} </td> 
                        <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">{new Date(post.updated_at).toLocaleDateString('en-US', {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, })} </td>
                        <td className="px-4 py-3 whitespace-nowrap"><StatusPill status={post.status || 'Published'} /></td>
                        <td className="px-4 py-3"><ItemActions onEdit={() => handleEditPost(post.id)} onDelete={() => handleDeletePost(post.id)} /></td>
                      </tr>
                    ))}
                  />
                </ManagementSection>

                {/* Comments Management */}
                <ManagementSection title="Moderate Comments">
                    <DataTable
                      headers={['Author', 'Email', 'Comment', 'In Response To', 'Posted On', 'Status', 'Actions']}
                      rows={comments.map((comment, index) => (
                        <tr key={comment.id}
                          className={`hover:bg-teal-900/20 ${index % 2 === 0 ? 'bg-transparent' : 'bg-zinc-800/50'}`}
                        >
                          <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">{comment.username}</td>
                          <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">{comment.email}</td>
                          <td className="px-4 py-3 text-zinc-300"><p className="truncate w-40" title={comment.comment}>{comment.comment}</p></td>
                          <td className="px-4 py-3 text-zinc-300"><p className="truncate w-40" title={comment.post_title}>{comment.post_title}</p></td>
                          <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">{new Date(comment.created_at).toLocaleDateString('en-US', {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, })} </td>  
                          <td className="px-4 py-3"><StatusPill status={comment.status || 'Published'} /></td>
                          <td className="px-4 py-3"><ItemActions onEdit={() => handleUpdateCommentStatus(comment.id, comment.status === 'Published' ? 'Unpublished' : 'Published')} editLabel={comment.status === 'Published' ? 'Unpublish' : 'Publish'} onDelete={() => alert(`Deleting comment ${comment.id}`)} /></td>
                        </tr>
                      ))}
                    />
                </ManagementSection>


                {/* Subscribers Management */}
                <ManagementSection title={`Manage Subscribers (${subscribers.length})`}>
                  <DataTable
                    headers={['Email Address', 'Subscribed On', 'Actions']}
                    rows={subscribers.map((sub, index) => (
                      <tr 
                        key={sub.id}
                        // --- Zebra Striping ---
                        className={`hover:bg-teal-900/20 ${index % 2 === 0 ? 'bg-transparent' : 'bg-zinc-800/50'}`}
                      >
                        <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">{sub.email}</td>
                        <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">{new Date(sub.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true,
                              })}</td>
                        <td className="px-4 py-3">
                          <ItemActions
                            onEdit={() => alert('Edit functionality can be added here.')}
                            onDelete={() => handleDeleteSubscriber(sub.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  />
                </ManagementSection>
            </div>

            <div className="space-y-8">
                {/* Categories Management */}
                <ManagementSection
                    title="Manage Categories"
                    button={<button onClick={() => openCategoryModal()} className="flex items-center gap-2 text-sm text-white py-2 px-3 border border-zinc-700 rounded-md bg-blue-900/40 hover:bg-blue-900/20 transition inline-flex"><PlusCircle size={16} /> Add New</button>}
                >
                    <div className="space-y-3">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                                <div>
                                    <p className="font-medium">{cat.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{cat.post_count} posts</p>
                                </div>
                                <ItemActions onEdit={() => openCategoryModal(cat)} onDelete={() => alert(`Deleting category ${cat.name} requires a batch update.`)} />
                            </div>
                        ))}
                    </div>
                </ManagementSection>

                {/* Newsletter Section */}
                <ManagementSection title="Send Newsletter">
                    <form onSubmit={sendNewsletter} className="space-y-4">
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
                            <input type="text" id="subject" value={newsletterSubject} onChange={e => setNewsletterSubject(e.target.value)} className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800" />
                        </div>
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium mb-2">Content</label>
                            <textarea id="content" rows={6} value={newsletterContent} onChange={e => setNewsletterContent(e.target.value)} className="w-full text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800"></textarea>
                        </div>
                        <button type="submit" className="w-full flex justify-center items-center gap-2 px-6 py-2 bg-blue-600/20 text-white border border-zinc-700 rounded-md hover:bg-blue-900/20 transition inline-flex">
                            {isSending ? 'Sending...' : <><Mail size={18} /> Send to {subscribers.length} Subscribers</>}
                        </button>
                    </form>
                </ManagementSection>
            </div>
        </div>
      </div>
      
      {/* Category Modal */}
      {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">{editingCategory ? 'Edit' : 'Add'} Category</h3>
                  <form onSubmit={handleCategorySubmit}>
                      <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mb-4"
                          placeholder="Category Name"
                          required
                      />
                      <div className="flex justify-end gap-3">
                          <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="py-2 px-4 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                          <button type="submit" className="py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700">{editingCategory ? 'Update' : 'Create'}</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}

// --- Reusable UI Components with Types ---

type StatCardProps = { title: string; value: number | string; icon: React.ReactNode; color: 'teal' | 'sky' | 'amber' | 'indigo'; };
const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  // Map the color prop to specific Tailwind CSS classes
  const colorClasses: Record<string, string> = {
    teal: 'bg-teal-900/50',
    sky: 'bg-sky-900/50',
    amber: 'bg-amber-900/50',
    indigo: 'bg-indigo-900/50',
  };

  return (
    <div className={`p-6 rounded-lg shadow-md flex items-center gap-4 ${colorClasses[color]}`}>
      <div className="bg-zinc-800 p-3 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-300">{title}</p>
        <p className="text-2xl text-white font-bold">{value}</p>
      </div>
    </div>
  );
};

type ManagementSectionProps = { title: string; children: ReactNode; button?: ReactNode | null; };
const ManagementSection = ({ title, children, button = null }: ManagementSectionProps) => (
    <div className="bg-zinc-700/50 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-zinc-300 font-semibold">{title}</h2>
            {button}
        </div>
        {children}
    </div>
);

type DataTableProps = { headers: string[]; rows: ReactNode[]; };
const DataTable = ({ headers, rows }: { headers: string[]; rows: React.ReactNode[] }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900">
      <table className="w-full text-sm">
        {/* Table Header with Teal Accent */}
        <thead className="bg-teal-900/30">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 font-semibold text-teal-400 text-left whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body with updated dividers */}
        <tbody className="divide-y divide-zinc-800">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="text-center text-zinc-500 py-10"
              >
                No items to display.
              </td>
            </tr>
          ) : (
            rows
          )}
        </tbody>
      </table>
    </div>
  );
};

type StatusPillProps = { status: Status; };
const StatusPill = ({ status }: StatusPillProps) => {
  // Gracefully handle null or undefined status
  if (!status) return null;

  // 1. Format the status to be consistent (e.g., "published" -> "Published")
  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  const baseClasses = "text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block";
  
  // 2. The keys here remain in Title Case, as this is our standard
  const statusClasses: Record<string, string> = {
    Published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    Unpublished: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    // Adding statuses for subscribers for consistency
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    pending: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  };
  
  return (
    // 3. Use the formattedStatus for both the style lookup and the displayed text
    <span className={`${baseClasses} ${statusClasses[formattedStatus] || ''}`}>
      {formattedStatus}
    </span>
  );
};

type ItemActionsProps = { onEdit: () => void; onDelete: () => void; editLabel?: string; };
const ItemActions = ({ onEdit, onDelete, editLabel = 'Edit' }: ItemActionsProps) => (
    <div className="flex items-center gap-2 text-gray-500">
        <button onClick={onEdit} className="hover:text-blue-500" title={editLabel}><Edit size={16} /></button>
        <button onClick={onDelete} className="hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
    </div>
);
