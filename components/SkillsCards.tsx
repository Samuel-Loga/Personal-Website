// components/SkillsCards.tsx
import React from 'react'
import { FaShieldAlt, FaBug, FaNetworkWired, FaDatabase, FaChartLine, FaCode, FaLaptopCode, FaComments, FaUsers, FaTasks } from 'react-icons/fa'

export const TechnicalSkillsCard = () => (
  <div className="bg-zinc-800 p-6 rounded-lg shadow-lg w-full text-sm text-zinc-300 space-y-4">
    <h2 className="text-xl sm:text-2xl font-semibold mb-5 text-white">Technical Skills</h2>
    <ul className="space-y-4">
      <li className="flex items-start gap-2"><FaShieldAlt /> Deploy security tools against system threats.</li>
      <li className="flex items-start gap-2"><FaNetworkWired /> Scan networks to identify potential weaknessess.</li>
      <li className="flex items-start gap-2"><FaChartLine /> Python for data analysis, and anomaly detection.</li>
      <li className="flex items-start gap-2"><FaLaptopCode /> Build modern, dynamic, and responsive websites.</li>
      <li className="flex items-start gap-2"><FaCode /> Incident cause, impact, and scope investigations.</li>
      <li className="flex items-start gap-2"><FaShieldAlt /> Monitor and analyze logs using SIEM tools.</li>
      <li className="flex items-start gap-2"><FaDatabase /> Provided technical support to staff and students.</li>
      <li className="flex items-start gap-2"><FaNetworkWired /> Diagnose and resolve computer hardware problems.</li>
    </ul>
  </div>
)

export const SoftSkillsCard = () => (
  <div className="bg-zinc-800 p-6 rounded-lg shadow-lg w-full text-sm text-zinc-300 space-y-4">
    <h2 className="text-xl sm:text-2xl font-semibold mb-5 text-white">Soft Skills</h2>
    <ul className="space-y-4">
      <li className="flex items-start gap-2"><FaChartLine /> Effective written and verbal communication.</li>
      <li className="flex items-start gap-2"><FaUsers /> Teamwork and collaboration.</li>
      <li className="flex items-start gap-2"><FaTasks /> Time management and accountability.</li>
      <li className="flex items-start gap-2"><FaTasks /> Adaptive, team player and collaborative.</li>
      <li className="flex items-start gap-2"><FaNetworkWired /> Good decision making and problem-solving skills.</li>
      <li className="flex items-start gap-2"><FaTasks /> Lifelong learner.</li>
      <li className="flex items-start gap-2"><FaComments /> Results-oriented and pays attention to details.</li>
      <li className="flex items-start gap-2"><FaTasks /> Passionate with a positive mind.</li>
    </ul>
  </div>
)