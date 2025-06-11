'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { FaExternalLinkAlt } from 'react-icons/fa'

// <p>
//    Without robust protection, it's not a question of <strong>if</strong> your institution will be attacked, but <strong>when</strong>.
//  </p>

const experiences = [
  {
    title: 'Cybersecurity Engineer',
    company: 'MAREN',
    period: 'Nov 2024 – Present',
    type: 'Full time',
    description:
      'Part of a team conducting vulnerability assessments for systems and networks, and investigating security incidents. ',
    responsibilities: [
      'Deploy security tools to protect systems and networks from potential threats.',
      'Detect and analyze weaknesses in systems/networks to mitigate security risks.',
      'Configuring IP and port-based firewall rules to secure Linux servers.',
      'Investigate incidents to determine cause, impact, and scope.',
      'Report findings and recommendations from incident investigations.',
    ],
    logo: '/images/maren.png',
    banner: '/images/cyber2.jpg',
    link: 'https://www.maren.ac.mw',
  },
  {
    title: 'ICT Associate',
    company: 'Ntha Foundation',
    period: 'Jan 2024 - Nov 2024',
    type: 'Full time',
    description:
      'Supported digital transformation initiatives, maintained IT systems, and contributed to tech training workshops and content development.',
    responsibilities: [
      'Managed and updated websites using WordPress.',
      'Managed enterprise productivity and collaboration systems.',
      'Led deployment and maintenance of DSA LMS to facilitate digital learning.',
      'Created content to support DSA learning initiatives.',
      'Contributed to business strategies and processes for organizational growth',
    ],
    logo: '/images/nf.webp',
    banner: '/images/cyber.png',
    link: 'https://www.nthafoundation.org',
  },
]

const ExperienceSection = () => {
  const [expandedCards, setExpandedCards] = useState<number[]>([])

  const toggleCard = (index: number) => {
    setExpandedCards((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    )
  }

  return (
    <section id="experience" className="px-4 sm:px-6 w-full pt-0 pb-14 bg-[#181818] text-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-semibold mb-5 text-white text-center">Talking About Work</h2>
        <p className='max-w-2xl mx-auto px-4 sm:px-6 mb-12 mt-6 text-sm md:text-base text-center italic'>I had a previlege to work for these great brands where I have developed professionally spanning cybersecurity, web development, and machine learning research.</p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {experiences.map((exp, index) => {
            const isExpanded = expandedCards.includes(index)
            const visibleResponsibilities = isExpanded
              ? exp.responsibilities
              : exp.responsibilities.slice(0, 2)

            return (
              <div
                key={index}
                className="bg-zinc-800 rounded-lg shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-xl"
              >
                {/* Top Banner Image */}
                <div className="w-full h-40 relative">
                  <Image
                    src={exp.banner}
                    alt={`${exp.company} Group`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base md:text-lg font-bold transition-colors duration-300 group-hover:text-teal-500">
                      {exp.title}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-teal-700/30 border border-teal-500 text-teal-300 rounded-full">
                      {exp.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image
                        src={exp.logo}
                        alt={`${exp.company} Logo`}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                      <p className="text-sm text-zinc-400">{exp.company}</p>
                    </div>
                    {exp.link && (
                      <a
                        href={exp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-500 hover:text-white"
                      >
                        <FaExternalLinkAlt size={14} />
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500">{exp.period}</p>
                  <p className="text-sm text-zinc-300">{exp.description}</p>

                  <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                    {visibleResponsibilities.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>

                  {exp.responsibilities.length > 2 && (
                    <button
                      onClick={() => toggleCard(index)}
                      className="text-xs text-teal-400 hover:underline"
                    >
                      {isExpanded ? 'View Less' : 'View More'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ExperienceSection
