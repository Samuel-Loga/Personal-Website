import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import SkillsSection from "@/components/SkillsSection";
import ExperienceSection from "@/components/ExperienceSection";
import EducationSection from "@/components/EducationSection";
import ServicesSection from "@/components/ServicesSection";
import Certifications from "@/components/Certifications";
import Footer from "@/components/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function Home() {
  return (
    <>
      <About />
      <Certifications /> 
      {/* <EducationSection /> */}
      <ExperienceSection />
      <SkillsSection />
      <Projects />  
      <ServicesSection /> 
      <Footer />
      <ScrollToTopButton />
    </>
  );
}
