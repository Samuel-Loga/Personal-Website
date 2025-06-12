'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { TechnicalSkillsCard, SoftSkillsCard } from './SkillsCards'

export default function Skills() {
  const [showSoftSkills, setShowSoftSkills] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Flip every 8s, but only if NOT hovered
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) setShowSoftSkills(prev => !prev)
    }, 8000)
    return () => clearInterval(interval)
  }, [isHovered])

  const handleToggle = () => {
    setShowSoftSkills(prev => !prev)
  }

  return (
    <section
      id="skills"
      className="w-full pt-12 pb-12 md:pt-14 md:pb-10 bg-gray-900 text-white px-4 sm:px-6 md:px-8"
    >
      <div className='max-w-7xl mx-auto'>
        <div>
          <p className="max-w-2xl mx-auto px-4 sm:px-6 mb-12 text-sm md:text-base text-center italic">As a Cybersecurity Engineer and Full-Stack Developer, I bring together deep technical skills with strong communication and problem-solving abilities, whether securing systems or building full-featured web applications.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-0 md:gap-12">
          {/* Left image: overlaps on mobile */}
          <div className="md:w-1/2 flex justify-center relative z-20 -mb-16 md:my-[10px] md:ml-[-3%]">
            <Image
              src="/images/IMG4.jpg"
              width={400}
              height={400}
              alt="Technical Illustration"
              className="object-cover w-2/2 md:w-2/3 max-w-[400px] sm:max-w-[400px] md:max-w-none rounded-t-xl md:rounded-full"
              priority
            />
          </div>

          {/* Right side – cards + toggle */}
          <div className="md:w-1/2 w-full flex flex-col items-center md:ml-[-6%] pt-16 md:pt-0">
            {/* card container */}
            <div
              className="relative w-full min-h-[360px] overflow-visible"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <AnimatePresence mode="wait">
                {!showSoftSkills ? (
                  <motion.div
                    key="tech"
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  >
                    <TechnicalSkillsCard />
                  </motion.div>
                ) : (
                  <motion.div
                    key="soft"
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  >
                    <SoftSkillsCard />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* toggle button always below the cards */}
            <div className="w-full flex justify-center mt-20 md:mt-12 z-30">
              <button
                onClick={handleToggle}
                className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-all"
              >
                {showSoftSkills ? (
                  <>
                    <FaChevronLeft className="text-teal-400" />
                    View Technical Skills
                  </>
                ) : (
                  <>
                    Switch to Soft Skills
                    <FaChevronRight className="text-teal-400" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/*<div className="pt-20 text-center max-w-xl mx-auto text-base sm:text-lg text-zinc-300 px-4 sm:px-6 leading-relaxed">
          <p>
            On the development side, I build fast, scalable, and user-friendly web and mobile applications that help you stand out and grow.
          </p>
        </div>*/}
      </div>
    </section>
  )
}
