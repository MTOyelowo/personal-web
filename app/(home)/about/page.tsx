import { Metadata } from "next";
import HeroSection from "@/components/about/hero-section";
import AboutInfo from "@/components/about/about-info";
import SocialLinks from "@/components/about/social-links";
import WorkExperience from "@/components/about/work-experience";
import ProjectsSection from "@/components/about/projects-section";
import ContactForm from "@/components/about/contact-form";

export const metadata: Metadata = {
  title: "About — Mayowa Taofeeq Oyelowo",
  description:
    "Software engineer, writer, and fashion designer. A Nomad of Dreams seeking to bring about positive change through Software, Writing, and Fashion.",
  openGraph: {
    title: "About — Mayowa Taofeeq Oyelowo",
    description:
      "Software engineer, writer, and fashion designer. Learn more about Mayowa Taofeeq Oyelowo.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <div className="w-[90%] max-w-4xl mx-auto h-px bg-border" />
      <AboutInfo />
      <SocialLinks />
      <WorkExperience />
      <ProjectsSection />
      <ContactForm />
    </div>
  );
}
