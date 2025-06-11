import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Services from "@/components/Services";
import Certifications from "@/components/Certifications";
import Footer from "@/components/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function Home() {
  return (
    <>
      <About />
      <Certifications /> 
      <Experience />
      <Skills />
      <Projects />  
      <Services /> 
      <Footer />
      <ScrollToTopButton />
    </>
  );
}
