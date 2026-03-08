"use client";

import { FC, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiExternalLink,
  FiGithub,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

interface TechItem {
  label: string;
  icon: string;
}

interface Project {
  image: string;
  title: string;
  description: string;
  liveUrl: string;
  githubLinks: { label: string; href: string }[];
  techStack: TechItem[];
  contributor?: boolean;
}

const projects: Project[] = [
  {
    image: "/images/cropped-topratehero.png",
    title: "TopRate Transfer",
    description:
      "TopRate Transfer is a financial technology startup domiciled in Australia. The company facilitates the transfer of money across borders.",
    liveUrl: "https://topratetransfer.com.au/",
    githubLinks: [],
    techStack: [
      { label: "TypeScript", icon: "/images/typescript.webp" },
      { label: "React", icon: "/images/react.webp" },
      { label: "Next.js", icon: "/images/next-js.webp" },
      { label: "Tailwind CSS", icon: "/images/tailwind.webp" },
    ],
  },
  {
    image: "/images/cropped-spheresed.png",
    title: "SpheresED Junior",
    description:
      "An innovative web application aimed at enhancing students' learning experiences. Leveraging images and audio recordings, it provides an immersive platform for educational content delivery with quizzes.",
    liveUrl: "https://spheres-ed-junior.vercel.app/",
    githubLinks: [
      {
        label: "Frontend & Backend",
        href: "https://github.com/SpheresED/spheres_ed_junior",
      },
    ],
    techStack: [
      { label: "TypeScript", icon: "/images/typescript.webp" },
      { label: "React", icon: "/images/react.webp" },
      { label: "Next.js", icon: "/images/next-js.webp" },
      { label: "MongoDB", icon: "/images/mongodb.webp" },
      { label: "Tailwind CSS", icon: "/images/tailwind.webp" },
    ],
  },
  {
    image: "/images/cropped-tripte.png",
    title: "Tripte Media",
    description:
      "A dynamic blog site designed to engage readers through interactive features such as liking posts and leaving comments. Built with Next.js and Tailwind CSS with MongoDB backend.",
    liveUrl: "http://triptemedia.vercel.app/",
    githubLinks: [
      {
        label: "Frontend & Backend",
        href: "https://github.com/MTOyelowo/tripte",
      },
    ],
    techStack: [
      { label: "TypeScript", icon: "/images/typescript.webp" },
      { label: "React", icon: "/images/react.webp" },
      { label: "Next.js", icon: "/images/next-js.webp" },
      { label: "MongoDB", icon: "/images/mongodb.webp" },
      { label: "Tailwind CSS", icon: "/images/tailwind.webp" },
    ],
  },
  {
    image: "/images/cropped-zheeta.png",
    title: "Zheeta",
    description:
      "An integrated social networking platform, touted as Africa's first with affiliate, classified, dating, fundraising, messaging, social feeds, gifting and more.",
    liveUrl: "https://zheeta.com/",
    githubLinks: [],
    techStack: [
      { label: "TypeScript", icon: "/images/typescript.webp" },
      { label: "React", icon: "/images/react.webp" },
      { label: "Vue.js", icon: "/images/vue.png" },
      { label: "SCSS", icon: "/images/scss.png" },
    ],
    contributor: true,
  },
];

const ProjectsSection: FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const project = projects[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-space-grotesk">
            Projects
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Project card */}
        <div className="rounded-2xl overflow-hidden border border-border bg-card">
          {/* Image */}
          <div className="relative w-full aspect-video bg-muted">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
            />
            {project.contributor && (
              <span className="absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full bg-red-500/90 text-white font-space-grotesk">
                Contributor
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 className="text-2xl font-bold text-card-foreground font-space-grotesk">
                {project.title}
              </h3>
              <div className="flex items-center gap-3 shrink-0">
                {project.githubLinks.map((link, i) => (
                  <Link
                    key={i}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                    title={link.label}
                  >
                    <FiGithub className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
                <Link
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                  title="Live site"
                >
                  <FiExternalLink className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-space-grotesk">
              {project.description}
            </p>

            {/* Tech stack */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-muted-foreground font-space-grotesk">
                Built with:
              </span>
              {project.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground font-space-grotesk"
                >
                  {tech.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
            aria-label="Previous project"
          >
            <FiChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          <div className="flex items-center gap-2">
            {projects.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === currentIndex
                    ? "bg-foreground w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to project ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
            aria-label="Next project"
          >
            <FiChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
