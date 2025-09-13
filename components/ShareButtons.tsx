"use client";

import { X, Copy } from 'lucide-react';
import { FaLinkedin, FaFacebook } from 'react-icons/fa'
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function ShareButtons({ postTitle }: { postTitle: string }) {
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const blogUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(blogUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3">
      <span className='text-zinc-300'>Share on:</span>
      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(blogUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-md bg-zinc-700 hover:bg-zinc-600 transition-colors"
      >
        <FaLinkedin size={16} className="text-blue-400" />
      </a>

      {/* X (Twitter) */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(blogUrl)}&text=${encodeURIComponent(postTitle)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-md bg-zinc-700 hover:bg-zinc-600 transition-colors"
      >
        <X size={16} className="text-sky-400" />
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-md bg-zinc-700 hover:bg-zinc-600 transition-colors"
      >
        <FaFacebook size={16} className="text-blue-500" />
      </a>

      {/* Copy Link */}
      <button
        onClick={copyToClipboard}
        className="p-2 rounded-md bg-zinc-700 hover:bg-zinc-600 transition-colors"
      >
        <Copy size={18} className="text-zinc-300" />
      </button>

      {copied && <span className="text-xs text-teal-400">Copied!</span>}
    </div>
  );
}
