import { ExternalLink, BadgeCheck, Loader2, Hourglass } from 'lucide-react'

interface Project {
  title: string
  year: string
  type: string
  status: 'Completed' | 'In Progress' | 'Planned'
  description: string
  url: string
}

export default function ProjectCard({ title, type, status, description, url }: Project) {
  const statusIcon = {
    Completed: <BadgeCheck className="text-green-500 w-5 h-5" />,
    'In Progress': <Loader2 className="animate-spin text-yellow-500 w-5 h-5" />,
    Planned: <Hourglass className="text-zinc-400 w-5 h-5" />,
  }

  const statusColor = {
    Completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    Planned: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300',
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-zinc-800 rounded-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-white group-hover:text-teal-400 transition">
          {title}
        </h3>
        <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-white" />
      </div>
      <p className="text-zinc-300 mt-4 mb-6 text-sm">{description}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full">{type}</span>
        <span className={`flex items-center gap-1 px-3 py-1 rounded-full ${statusColor[status]}`}>
          {statusIcon[status]} {status}
        </span>
      </div>
    </a>
  )
}