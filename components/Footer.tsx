'use client'

import Link from 'next/link'
import { FaLinkedin, FaGithub, FaTwitter, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="flex justify-center px-4 sm:px-6 bg-[#101828] text-gray-400 py-12">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between gap-12 items-center md:items-start text-center md:text-left">

          {/* Get In Touch */}
          <div className="flex-1 text-sm">
            <h2 className="text-white text-xl font-bold mb-4">Get In Touch</h2>
            <p className="mb-4">
              I'm always interested in discussing new opportunities, collaboration, or innovative projects in cybersecurity and technology.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <FaEnvelope className="text-blue-300" />
              <span><a href="mailto:samuelloga9@gmail.com">samuelloga9@gmail.com</a></span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-0 md:mb-2">
              <FaPhoneAlt className="text-pink-300" />
              <span><a href="tel:+265997222157">(+265) 997 22 21 57</a></span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex-1 text-sm">
            <h2 className="text-white text-xl font-bold mb-4 hidden md:inline">Quick Links</h2>
            <div className="flex flex-row md:flex-col gap-6 md:gap-2 md:my-4">
              <Link href="#about" className="hover:text-white transition">About</Link>
              <Link href="#education" className="hover:text-white transition">Education</Link>
              <Link href="#experience" className="hover:text-white transition">Experience</Link>
              <Link href="#projects" className="hover:text-white transition">Projects</Link>
            </div>
          </div>

          {/* Connect With Me */}
          <div className="flex-1 text-sm">
            <h2 className="text-white text-xl font-bold mb-4 hidden md:inline">Connect With Me</h2>
            <div className="flex justify-center md:justify-start gap-4 mb-6 md:my-5">
              <a href="https://github.com/Samuel-Loga" target="_blank" rel="noopener noreferrer" className="bg-zinc-800 p-3 border border-zinc-700 rounded-lg hover:text-white transition">
                <FaGithub />
              </a>
              <a href="https://www.linkedin.com/in/samuel-loga-b963b3258" target="_blank" rel="noopener noreferrer" className="bg-zinc-800 p-3 border border-zinc-700 rounded-lg hover:text-white transition">
                <FaLinkedin />
              </a>
              <a href="mailto:samuelloga9@gmail.com" className="bg-zinc-800 p-3 border border-zinc-700 rounded-lg hover:text-white transition">
                <FaEnvelope />
              </a>
            </div>
            <p className="mt-4 md:mt-0 text-center md:text-left">
              Feel free to reach out for collaborations, job opportunities, or just to connect!
            </p>
          </div>
        </div>

        <hr className="mt-8 mb-10 border-zinc-700" />

        <div className="text-center text-sm md:text-base text-gray-500">
          © {new Date().getFullYear()}. Made with ❤️ by Samuel Loga. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
