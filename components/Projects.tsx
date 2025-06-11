'use client'

import React, { useState, useEffect } from 'react'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink, BadgeCheck, Loader2, Hourglass } from 'lucide-react'

interface Project {
  title: string
  year: string
  type: string
  status: 'Completed' | 'In Progress' | 'Planned'
  description: string
  url: string
}

const projects: Project[] = [
  {
    title: 'Code Sync',
    year: '2025',
    type: 'Web / AI',
    status: 'Planned',
    url: '',
    description: 'A collaborative coding platform powered by AI suggestions and real-time sync.',
  },
  {
    title: 'Zonse Online Store',
    year: '2025',
    type: 'Web',
    status: 'In Progress',
    url: '',
    description: 'A modern e-commerce platform connecting Malawi to the global market.',
  },
  {
    title: 'Personal Website',
    year: '2025',
    type: 'Web',
    status: 'In Progress',
    url: '',
    description: 'This very website — built to showcase projects, skills, and career journey.',
  },
  {
    title: 'Digital Skills for Africa',
    year: '2024',
    type: 'Web',
    status: 'Completed',
    url: 'https://digitalskillsforafrica.com/',
    description: 'A learning platform developed with the aim to bridge the digital divide in Africa.',
  },
  {
    title: 'Unified Electronic Identification System',
    year: '2023',
    type: 'Manage IDs',
    status: 'Completed',
    url: '',
    description: 'A platform for secure identity management and authentication.',
  },
  {
    title: 'Deepfake AI-Powered Mobile App',
    year: '2023',
    type: 'Mobile / AI',
    status: 'Completed',
    url: '',
    description: 'A project that detects deepfakes using machine learning models.',
  },
  {
    title: 'Detect Fraud in Mobile Money Transaction',
    year: '2023',
    type: 'AI / Fintech',
    status: 'Completed',
    url: '',
    description: 'AI-powered fraud detection system targeting mobile money platforms.',
  },
]

export default function Projects() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    loop: true,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
    created() {
      setLoaded(true)
    },
    slides: {
      perView: 4,
      spacing: 16,
    },
    breakpoints: {
      '(max-width: 1024px)': {
        slides: { perView: 2, spacing: 16 },
      },
      '(max-width: 640px)': {
        slides: { perView: 1, spacing: 16 },
      },
    },
  })

  useEffect(() => {
    const interval = setInterval(() => {
      instanceRef.current?.next()
    }, 10000)
    return () => clearInterval(interval)
  }, [instanceRef])

  const statusIcon = {
    Completed: <BadgeCheck className="text-green-500 w-4 h-4" />,
    'In Progress': <Loader2 className="animate-spin text-yellow-500 w-4 h-4" />,
    Planned: <Hourglass className="text-zinc-400 w-4 h-4" />,
  }

  const statusColor = {
    Completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    Planned: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300',
  }

  return (
    <section id="projects" className="px-4 sm:px-6 w-full py-10 md:py-14 bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto">

        {/* Header & Nav */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white text-center">What I have Done</h2>
          {loaded && (
            <div className="flex gap-4">
              <button onClick={() => instanceRef.current?.prev()} className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => instanceRef.current?.next()} className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition">
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        <p className="text-sm md:text-base my-8 text-center italic">
          A showcase of my work across cybersecurity, web development, and
          <br className="hidden md:inline" /> machine learning, demonstrating practical solutions to real-world problems.
        </p>

        {/* Carousel */}
        <div ref={sliderRef} className="keen-slider">
          {projects.map((project, index) => (
            <div className="keen-slider__slide" key={index}>
              <motion.div
                className="bg-zinc-800 group border border-zinc-700 rounded-lg p-6 shadow-lg space-y-3 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.05 }}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-base md:text-lg font-bold transition-colors duration-300 group-hover:text-teal-500">
                    {project.title}
                  </h3>
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white">
                    <ExternalLink size={14} />
                  </a>
                </div>
                <p className="text-sm text-zinc-300">{project.description}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full">{project.type}</span>
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full ${statusColor[project.status]}`}>
                    {statusIcon[project.status]} {project.status}
                  </span>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Closing Quote 
        <div className="phrases text-center max-w-xl mx-auto px-4 pt-12">
          <p className="italic text-sm md:text-base text-zinc-300">
            "Each project is not just a line of code — it's a step toward a more secure, intelligent, and connected future."
          </p>
        </div> */}
      </div>
    </section>
  )
}