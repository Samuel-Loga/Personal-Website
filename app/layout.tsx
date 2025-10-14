import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from "next";
//import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar'

{/*const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});*/}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Samuel Loga's Portfolio",
  description: "Welcome to my Digital Space! I'm Samuel Loga, a passionate Cybersecurity Engineer, web developer and AI enthusiast. Explore my projects, skills, and experiences in the world of technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        //className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        className={`${inter.variable} antialiased`}
      >
        <Navbar />
        <main>
          {children}
          <SpeedInsights />
        </main>
      </body>
    </html>
  );
}
