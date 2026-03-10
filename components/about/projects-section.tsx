"use client";

import { FC, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiExternalLink,
  FiGithub,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiMaximize2,
} from "react-icons/fi";
import {
  useProjects,
  type ProjectGithubLink,
  type ProjectTechItem,
  type ProjectImageData,
} from "@/hooks/query/useAbout";
import { getTechIcon } from "@/lib/tech-options";
import Spinner from "@/components/ui/spinner";
import dynamic from "next/dynamic";

const RichTextViewer = dynamic(
  () => import("@/components/editor/rich-text-viewer"),
  { ssr: false },
);

const ProjectsSection: FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <section className="flex items-center justify-center py-16">
        <Spinner size={28} />
      </section>
    );
  }

  if (!projects || projects.length === 0) {
    return null;
  }

  const project = projects[currentIndex];
  const githubLinks = project.githubLinks as ProjectGithubLink[];
  const techStack = project.techStack as ProjectTechItem[];
  const images = project.images ?? [];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="projects" className="py-16 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-space-grotesk">
            Projects
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Project card */}
        <div className="rounded-2xl overflow-hidden border border-border bg-card">
          {/* Image Gallery */}
          {images.length > 0 && (
            <ImageGallery
              images={images}
              projectTitle={project.title}
              isContributor={project.contributor}
            />
          )}

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 className="text-2xl font-bold text-card-foreground font-space-grotesk">
                {project.title}
              </h3>
              <div className="flex items-center gap-3 shrink-0">
                {githubLinks.map((link, i) => (
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
                {project.liveUrl && (
                  <Link
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                    title="Live site"
                  >
                    <FiExternalLink className="w-4 h-4 text-muted-foreground" />
                  </Link>
                )}
              </div>
            </div>

            <RichTextViewer
              content={project.description}
              className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-space-grotesk prose-headings:text-card-foreground prose-p:text-muted-foreground prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-li:text-muted-foreground prose-strong:text-card-foreground mb-6 font-space-grotesk text-sm"
            />

            {/* Tech stack */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-muted-foreground font-space-grotesk">
                Built with:
              </span>
              {techStack.map((tech, i) => {
                const TechIcon = getTechIcon(tech.icon);
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground font-space-grotesk"
                  >
                    {TechIcon && <TechIcon size={12} />}
                    {tech.label}
                  </span>
                );
              })}
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

/* ── Image Gallery Component ─────────────────────────────── */

function ImageGallery({
  images,
  projectTitle,
  isContributor,
}: {
  images: ProjectImageData[];
  projectTitle: string;
  isContributor: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handlePrevImage = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNextImage = useCallback(() => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation when lightbox is open
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxOpen, handlePrevImage, handleNextImage]);

  const activeImage = images[activeIndex];

  return (
    <div>
      {/* Main image */}
      <div className="relative w-full aspect-video bg-muted">
        <Image
          src={activeImage.url}
          alt={activeImage.alt || projectTitle}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 896px"
        />

        {/* Click to expand */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 w-full h-full cursor-zoom-in group"
          aria-label="Expand image"
        >
          <span className="absolute top-4 left-4 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <FiMaximize2 className="w-4 h-4" />
          </span>
        </button>

        {isContributor && (
          <span className="absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full bg-red-500/90 text-white font-space-grotesk">
            Contributor
          </span>
        )}

        {/* Nav arrows (only if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
              aria-label="Previous image"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
              aria-label="Next image"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>

            {/* Image counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/40 text-white text-xs font-medium z-10">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip (only if multiple images) */}
      {images.length > 1 && (
        <div className="flex gap-1.5 px-4 py-2 bg-muted/50 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`relative w-14 h-10 rounded overflow-hidden shrink-0 transition-all ${
                i === activeIndex
                  ? "ring-2 ring-foreground opacity-100"
                  : "opacity-50 hover:opacity-80"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${projectTitle} ${i + 1}`}
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-label="Image lightbox"
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10 cursor-pointer"
            aria-label="Close lightbox"
          >
            <FiX className="w-6 h-6" />
          </button>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium">
              {activeIndex + 1} / {images.length}
            </div>
          )}

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10 cursor-pointer"
                aria-label="Previous image"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10 cursor-pointer"
                aria-label="Next image"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Expanded image */}
          <div
            className="relative w-[90vw] h-[85vh] max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeImage.url}
              alt={activeImage.alt || projectTitle}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 rounded-xl bg-black/60 overflow-x-auto max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIndex(i)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer ${
                    i === activeIndex
                      ? "ring-2 ring-white opacity-100"
                      : "opacity-40 hover:opacity-70"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `${projectTitle} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectsSection;
