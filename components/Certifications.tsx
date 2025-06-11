'use client'

import React, { useState, useEffect } from 'react'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const certifications = [
  {
    title: "BSc Computer Systems and Security",
    issuer: "Malawi University of Science and Technology",
    grade: "Grade: Distinction",
    date: "Sept. 2019 – Oct. 2024",
    logo: '/logos/must.png',
  },
  {
    title: "Malawi School Certificate of Education",
    issuer: "Ndirande Hill Secondary School - High School",
    grade: "Grade: 12 Points",
    date: "2014 – 2018",
    logo: '/logos/nhss.jpg',
  },
  {
    title: "Certified in Cybersecurity (CC) – Ongoing",
    issuer: "ISC2",
    grade: "Status: Exam Passed",
    date: "May 2025",
    logo: '/logos/ISC2.png',
  },
  {
    title: "Junior Cybersecurity Analyst Career Path",
    issuer: "Cisco Networking Academy",
    grade: "Scholarship: I4G x Cisco",
    date: "Sept. 2024",
    link: "https://www.credly.com/badges/0044d5d4-6611-48cf-9df9-c3b01686f8d9/public_url",
    logo: '/logos/junior-cybersecurity-analyst-career-path.png',
  },
  {
    title: "Huawei ICT Competition National Finals",
    issuer: "Huawei ICT Academy",
    grade: "Track: AI & Cloud",
    date: "Dec. 2023",
    logo: '/logos/huawei.jpg',
  },
  {
    title: "Quarter Finals - Generative AI for Africa Hackathon",
    issuer: "A2SV",
    grade: "Certificate of Achievement",
    date: "Dec. 2023",
    logo: '/logos/a2sv.jpg',
  },
  {
    title: "Online Leadership Course Certificate",
    issuer: "Aspire Institute",
    grade: "Completed",
    date: "March 2023",
    logo: '/logos/aspire.jpg',
  },
  {
    title: "StartMeUp Digital Entrepreneurship Training",
    issuer: "Dzuka Africa",
    grade: "Completed",
    date: "June 2023",
    logo: '/logos/dzuka.jpg',
  }
]

const Certifications = () => {
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
      "(max-width: 1024px)": {
        slides: { perView: 2, spacing: 16 },
      },
      "(max-width: 640px)": {
        slides: { perView: 1, spacing: 16 },
      },
    },
  })

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      instanceRef.current?.next()
    }, 10000)
    return () => clearInterval(interval)
  }, [instanceRef])

  return (
    <section id="certifications" className="px-4 sm:px-6 w-full bg-[#181818] pt-14 pb-12 md:py-14 text-white">
      <div className="max-w-6xl mx-auto">
        
        <div className="certifications">

          <p className="max-w-2xl mx-auto px-4 sm:px-6 mb-10 text-sm md:text-base text-center italic">
            I actively invest in my personal and professional development through hands-on learning, certifications, and collaborative programs.
          </p>

          <div ref={sliderRef} className="keen-slider">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="keen-slider__slide bg-[#101828] border border-zinc-700 hover:bg-zinc-800 group transition-colors rounded-lg p-5 shadow-lg space-y-2"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-base md:text-lg font-bold transition-colors duration-300 group-hover:text-teal-500">{cert.title}</h3>
                  {cert.link && (
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white"
                    >
                      <FaExternalLinkAlt size={14} />
                    </a>
                  )}
                </div>
                {/*<p className="text-sm text-zinc-300">{cert.issuer}</p>*/}
                <div className="flex items-center gap-2 group text-sm text-zinc-300">
                      <img src={cert.logo} alt="logo" className="w-6 h-6 object-contain rounded-full" />
                      <span className="text-sm text-zinc-300">{cert.issuer}</span>
                </div>
                <p className="text-xs text-zinc-400">{cert.date}</p>                
                <p className="text-sm text-zinc-400">{cert.grade}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 md:mt-14 flex justify-center">
            
            {loaded && (
              <div className="flex gap-10">
                <button
                  onClick={() => instanceRef.current?.prev()}
                  className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => instanceRef.current?.next()}
                  className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="hidden">
            {loaded && instanceRef.current && (
              <div className="flex justify-center gap-2 mt-6">
                {[...Array(instanceRef.current.track.details.slides.length).keys()].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => instanceRef.current?.moveToIdx(idx)}
                    className={`w-8 h-8 text-sm font-medium rounded-full border transition ${
                      currentSlide === idx
                        ? 'bg-white text-black border-white'
                        : 'bg-zinc-800 text-white border-zinc-600 hover:bg-zinc-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/*<div className='pt-14 phrases'>
          <p>
            I configure and deploy cutting-edge security tools to keep your data safe, your networks locked down, and your mind at ease.
          </p>
        </div>*/}

      </div>

    </section>
  )
}

export default Certifications