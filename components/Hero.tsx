import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-12 bg-white dark:bg-black">
      <div className="mb-6">
        <Image
          src="/images/user4.png"
          alt="Profile picture"
          width={160}
          height={160}
          className="rounded-full border-4 border-blue-600 shadow-lg"
        />
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">
        Hello, I&apos;m <span className="text-blue-600">Chief</span>
      </h1>

      <p className="text-lg sm:text-xl max-w-xl text-gray-600 dark:text-gray-400 mb-6">
        A passionate Cybersecurity Engineer 🔐 & Full-Stack Developer 💻 who loves turning ideas into real-world tech.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/projects"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          View Projects
        </Link>
        <Link
          href="/contact"
          className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-900 transition"
        >
          Contact Me
        </Link>
      </div>
    </section>
  )
}


{/*<section className="min-h-screen flex flex-col items-center justify-center text-center p-4">
  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">Hey, I&apos;m Chief 👋</h1>
  <p className="text-lg sm:text-xl max-w-xl text-gray-500 dark:text-gray-400">I build web apps, love cybersecurity, and talk tech on my blog.</p>
  <div className="mt-6 flex gap-4 flex-wrap justify-center">
    <a href="/projects" className="bg-blue-600 text-white px-6 py-3 rounded-md">View Projects</a>
    <a href="/contact" className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md">Contact Me</a>
  </div>
</section>*/}