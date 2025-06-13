'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function About() {
  return (
    <section
      id="about"
      className="flex items-center justify-center px-4 sm:px-8 md:px-12 pt-22 pb-10 md:pt-24 md:pb-16 bg-zinc-800"
    >
      <div className="flex flex-col-reverse md:flex-row gap-0 md:gap-8 w-full max-w-6xl mt-0 md:mt-5">
        {/* Text Card */}
        <motion.div
          className="flex-1 bg-[#101828] mb-6 md:mb-0 p-6 sm:p-10 rounded-b-2xl md:rounded-2xl shadow-lg flex flex-col justify-between"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="pt-2 md:pt-0 text-xl md:text-3xl font-bold mb-4 md:mb-5 text-white">
              Hello, I&apos;m <span className="text-blue-300">Samuel</span> Loga
            </h2>
            <p className="text-sm md:text-base text-white mb-6">
              I&apos;m a passionate <span className="text-blue-300">Cybersecurity Engineer 🔐</span>, <span className="text-blue-300">
              Machine Learning Enthusiast 🤖</span>, and <span className="text-blue-300">Full-Stack Developer 💻</span>. I focus on 
              securing systems, applications, and networks. I also explore how AI can solve real-world problems using data-driven models. 
              And I build fast, scalable, and user-friendly web applications. <span className='hidden md:inline'>I enjoy collaborating with teams to create innovative solutions that make a positive impact.</span>
            </p>
            <h3 className="font-semibold mb-4 md:mb-6 text-white">Tech Stack:</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                'SIEM', 'Firewall', 'Nmap', 'OpenVAS',
                'VMs', 'Python', 'Pandas', 'Scikit-learn',
                'Flask', 'Supabase', 'React', 'Next.js', 
                'MySQL', 'PHP', 'WordPress', 'CSS', 'MS365 Admin', '...'
              ].map((tech, i) => (
                <span key={i} className="px-3 py-1 text-xs md:text-sm bg-teal-600/20 text-blue-300 rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-2 md:mt-4 mb-2 md:mb-0">
            <Link
              href="https://drive.google.com/uc?export=download&id=1CDYy8kJ1nJShDStDnPRuK-X2y_Amy9WM"
              className="px-6 py-3 bg-blue-600/20 text-white border border-zinc-700 rounded-md hover:bg-blue-900/20 transition inline-flex"
            >
              Download Resume
            </Link>
          </div>
        </motion.div>

        {/* Image Card */}

        <motion.div
          className="w-full md:w-1/3 flex items-center justify-center mt-10 md:mt-0"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Image
            src="/images/IMG13.jpg"
            alt="Home"
            width={400}
            height={400}
            className="block md:hidden object-cover w-3/3 md:w-4/4 max-w-[400px] sm:max-w-[400px] md:max-w-none rounded-t-xl md:rounded-xl"
          />

          <Image
            src="/images/IMG12.jpg"
            alt="Home"
            width={400}
            height={400}
            className="hidden md:block object-cover w-3/3 md:w-4/4 max-w-[400px] sm:max-w-[400px] md:max-w-none rounded-t-xl md:rounded-xl"
          />
        </motion.div>
        {/* className="object-cover w-3/4 md:w-4/4 max-w-[300px] sm:max-w-[300px] md:max-w-none rounded-t-xl md:rounded-xl" */}
      </div>
    </section>
  )
}
