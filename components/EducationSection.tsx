'use client'

import React from 'react'
import Image from 'next/image'

const educationHistory = [
  {
    degree: 'BSc Computer Systems and Security',
    institution: 'Malawi University of Science and Technology',
    period: '2019 – 2024',
    honors: 'Grade: Distinction',
    logo: '/images/must.png',
  },
  {
    degree: 'Malawi School Certificate of Education',
    institution: 'Ndirande Hill Secondary School',
    period: '2014 – 2018',
    honors: 'Grade: 12 Points',
    logo: '/images/images.jpg',
  },
]

const EducationSection = () => {
  return (
    <section
      id="education"
      className="px-4 sm:px-6 w-full py-0 pb-14 md:py-0 bg-[#181818] text-white relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Heading */}
        <h2 className="text-2xl font-semibold mb-4 text-white text-center md:text-left">Education</h2>
        <p className='mb-8 text-sm md:text-base text-center md:text-left'>
          My academic journey has provided a strong foundation in computer science, cybersecurity, and emerging technologies.
        </p>

        {/* Timeline + Image side by side */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Timeline Section */}
          <div className="w-full md:w-3/5">
            <div className="relative border-l-2 border-zinc-600 pl-6 space-y-12 md:space-y-8">
              {educationHistory.map((edu, index) => (
                <div key={index} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-[13px] w-6 h-6 bg-zinc-800 border-2 border-zinc-400 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>

                  {/* Card */}
                  <div className="bg-[#101828] border border-zinc-700 rounded-lg shadow-lg p-6 space-y-2">
                    <h3 className="text-base md:text-lg font-bold transition-colors duration-300 group-hover:text-teal-500">{edu.degree}</h3>
                    <div className="flex items-center gap-2 group text-sm text-zinc-300">
                      <img src={edu.logo} alt="logo" className="w-6 h-6 object-contain rounded-full" />
                      <span>{edu.institution}</span>
                    </div>
                    <p className="text-xs text-zinc-400">{edu.period}</p>
                    <p className="italic text-zinc-300 text-sm">{edu.honors}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image next to timeline */}
          <div className="hidden md:flex md:w-2/5 justify-center items-center">
            <Image
              src="/images/user1.png"
              alt="Education Illustration"
              width={400}
              height={400}
              className="object-contain max-h-[400px]"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default EducationSection
