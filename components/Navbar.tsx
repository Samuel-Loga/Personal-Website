'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  FaGithub, FaLinkedin, FaTwitter, FaChevronDown,
  FaEnvelope, FaYoutube, FaSignal
} from 'react-icons/fa'
import { Menu, X } from 'lucide-react'

export default function Nav() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  const toggleDropdown = () => setShowDropdown(prev => !prev)

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'certifications', 'experience', 'skills', 'projects', 'services']
      let current = ''

      for (const id of sections) {
        const el = document.getElementById(id)
        if (el) {
          const top = el.offsetTop - 100
          const bottom = top + el.offsetHeight
          if (window.scrollY >= top && window.scrollY < bottom) {
            current = id
          }
        }
      }

      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className="w-full fixed top-6 z-50 flex justify-center px-4 sm:px-6">
      <div className="max-w-6xl w-full bg-[#101828] border border-zinc-700 rounded-xl px-5 py-4 shadow-lg relative flex items-center justify-between">
        
        {/* Desktop Nav Items */}
        <ul className="hidden md:flex space-x-6 font-medium text-white text-sm">
          {[
            { href: '#about', label: 'Home' },
            { href: '#certifications', label: 'Certifications' },
            { href: '#experience', label: 'Work' },
            { href: '#skills', label: 'Skills' },
            { href: '#projects', label: 'Projects' },
            { href: '#services', label: 'Services' },
            { href: '/blog', label: 'Blog' },
          ].map(({ href, label }) => (
            <li key={label}>
              <Link
                href={href}
                className={`py-4 transition-colors duration-300 ${
                  activeSection === href.replace('#', '') ? 'text-teal-500' : 'hover:text-teal-500'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
          </button>
        </div>

        {/* Profile & Dropdown */}
        <div className="relative group">
          <div
            className="group flex items-center space-x-2 cursor-pointer select-none"
            onClick={toggleDropdown}
          >
            <FaChevronDown
              className={`text-white text-xs mt-[1px] group-hover:text-teal-500 transition-colors duration-300 ${
                showDropdown ? 'rotate-180' : ''
              }`}
            />

            <span className="font-semibold text-white group-hover:text-teal-500 transition-colors duration-300">
              Samuel Loga
            </span>
            <Image
              src="/images/profile.jpg"
              alt="Samuel Loga"
              width={32}
              height={32}
              className="rounded-full border border-gray-600"
            />
          </div>

          {showDropdown && (
            <div className="absolute top-[120%] right-[-24] w-[280px] bg-[#101828] border border-zinc-700 text-sm mt-5 p-4 rounded-xl shadow-2xl z-40">
              <p className="mb-2 text-gray-300 font-medium">👨🏽‍💻 Let&apos;s Connect</p>
              <div className="flex flex-col gap-2 text-gray-400">
                <a href="https://www.linkedin.com/in/samuel-loga-b963b3258" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-teal-500"><FaLinkedin /> Connect on LinkedIn</a>
                <a href="https://github.com/Samuel-Loga" className="flex items-center gap-2 hover:text-teal-500"><FaGithub /> Github</a>
                <a href="https://x.com/Loga265?t=KeoqGcDouwYM9wEgSjNryA&s=35" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-teal-500"><FaTwitter /> Twitter</a>
                <a href="https://signal.me/#eu/2GWahwi-bhzpSKm3SQ0CBdlViJ3G7NaMjNjePz-VrwwPCQzoOW1Eobhn0ZanaZH-" className="flex items-center gap-2 hover:text-teal-500"><FaSignal /> Signal</a>
                <a href="mailto:samuelloga9@gmail.com" className="flex items-center gap-2 hover:text-teal-500"><FaEnvelope /> Send me an email</a>
                <a href="https://www.youtube.com/@Finite265" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-teal-500"><FaYoutube /> YouTube</a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full w-full px-4 sm:px-6 mt-2 sm:mt-2">
          <div className="bg-[#101828] border border-zinc-700 text-white p-4 rounded-xl shadow-xl z-40">
            <ul className="flex flex-col gap-4 font-medium text-sm">
              {[
                { href: '#about', label: 'About' },
                { href: '#certifications', label: 'Certifications' },
                { href: '#experience', label: 'Experience' },
                { href: '#skills', label: 'Skills' },
                { href: '#projects', label: 'Projects' },
                { href: '#services', label: 'Services' },
                { href: '/blog', label: 'Blog' }
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`transition-colors duration-300 ${
                      activeSection === href.replace('#', '') ? 'text-teal-500' : 'hover:text-teal-500'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </nav>
  )
}
