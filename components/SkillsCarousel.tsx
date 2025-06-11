"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa'
import { TechnicalSkillsCard, SoftSkillsCard } from './SkillsCards'

const SkillsCarousel = () => {
  const [showSoftSkills, setShowSoftSkills] = useState(false)
  const [autoSlide, setAutoSlide] = useState(true)

  // Auto toggle every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoSlide) setShowSoftSkills(prev => !prev)
    }, 8000)
    return () => clearInterval(interval)
  }, [autoSlide])

  const handleToggle = () => {
    setShowSoftSkills(prev => !prev)
    setAutoSlide(false) // Stop auto sliding on manual interaction
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 md:flex items-center gap-12">
      {/* Left side image */}
      <div className="md:w-1/2 mb-8 md:mb-0 flex justify-center">
        <Image
          src="/images/user4.png"
          width={400}
          height={400}
          alt="Tech Illustration"
          className="object-contain max-h-[400px]"
          priority
        />
      </div>

      {/* Right side content */}
      <div className="md:w-1/2 relative flex flex-col items-center">
        <div className="w-full transition-all duration-500">
          {showSoftSkills ? <SoftSkillsCard /> : <TechnicalSkillsCard />}
        </div>

        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className="mt-6 flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-all"
        >
          {showSoftSkills ? (
            <>
              <FaChevronLeft className="text-white" />
              View Technical Skills
            </>
          ) : (
            <>
              Switch to Soft Skills
              <FaChevronRight className="text-white" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default SkillsCarousel
