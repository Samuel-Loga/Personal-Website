'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Mail } from 'lucide-react';

export default function SubscribeForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (!email) {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
        }

        // Insert the new subscriber into the 'subscribers' table
        const { error: insertError } = await supabase
            .from('subscribers')
            .insert({ email: email });

        if (insertError) {
            // Error code '23505' is for unique constraint violation (duplicate email)
            if (insertError.code === '23505') {
                setMessage("You're already subscribed. Thank you!");
            } else {
                setError('Could not subscribe. Please try again later.');
                console.error('Subscription error:', insertError.message);
            }
        } else {
            setMessage('Thanks for subscribing! 🎉');
            setEmail(''); // Clear the input on success
        }

        setLoading(false);
    };

    return (
        <div className="p-6 my-8 bg-zinc-700/50 border border-teal-800/20 rounded-lg text-center">
            <h3 className="text-xl font-bold text-zinc-100 mb-2">Subscribe to the Newsletter</h3>
            <p className="text-zinc-400 mb-4">
                Get emails from me about web development, tech, and early access to new articles.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="flex-grow text-zinc-300 px-4 py-2 border border-teal-800 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800"
                    disabled={loading}
                    required
                />
                <button
                    type="submit"
                    className="flex justify-center items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition disabled:bg-gray-500"
                    disabled={loading}
                >
                    <Mail size={16} />
                    {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
            </form>
            {message && <p className="text-green-400 mt-3">{message}</p>}
            {error && <p className="text-red-400 mt-3">{error}</p>}
        </div>
    );
}