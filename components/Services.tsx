'use client'
import React from 'react'
import { ShieldCheck, BrainCircuit, Code2 } from 'lucide-react'
import { motion } from 'framer-motion'

const services = [
  {
    title: 'Cybersecurity Services',
    icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
    description:
      'Protecting digital assets through threat detection, vulnerability assessments, incident response, and secure system design.',
  },
  {
    title: 'Machine Learning & Data Analysis',
    icon: <BrainCircuit className="w-8 h-8 text-green-500" />,
    description:
      'Building intelligent systems that learn from data — from fraud detection and predictive analytics to natural language processing.',
  },
  {
    title: 'Web & Software Development',
    icon: <Code2 className="w-8 h-8 text-purple-500" />,
    description:
      'Designing and developing full-stack web applications that are fast, secure, and user-centric — from concept to deployment.',
  },
]

export default function Services() {
  return (
    <section id="services" className="bg-gray-950 text-white pb-16 pt-4 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-white text-center">What I Offer</h2>
          <p className="mt-4 text-zinc-300 max-w-2xl mx-auto text-sm md:text-base italic"> 
            I combine cybersecurity expertise, intelligent automation, and clean web design to deliver secure, scalable, and impactful digital solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 shadow-md hover:shadow-xl group transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-base md:text-lg font-bold transition-colors duration-300 group-hover:text-teal-500 mb-2">{service.title}</h3>
              <p className="text-sm text-zinc-400">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
