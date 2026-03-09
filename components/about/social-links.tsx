"use client";

import { FC } from "react";
import {
  FaGithub,
  FaFacebook,
  FaInstagram,
  FaXTwitter,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa6";
import { FiGlobe } from "react-icons/fi";
import type { IconType } from "react-icons";
import { useSocialLinks } from "@/hooks/query/useAbout";
import Spinner from "@/components/ui/spinner";

const iconMap: Record<string, IconType> = {
  github: FaGithub,
  facebook: FaFacebook,
  instagram: FaInstagram,
  "x-twitter": FaXTwitter,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  globe: FiGlobe,
};

const SocialLinks: FC = () => {
  const { data: links, isLoading } = useSocialLinks();

  if (isLoading) {
    return (
      <section className="flex items-center justify-center py-12">
        <Spinner size={28} />
      </section>
    );
  }

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            {links.map((link) => {
              const Icon = iconMap[link.iconKey] ?? FiGlobe;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2"
                  aria-label={link.platform}
                >
                  <div className="p-3 rounded-full border border-border bg-background text-muted-foreground group-hover:text-foreground group-hover:border-foreground/20 transition-all duration-200 group-hover:scale-110">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-space-grotesk">
                    {link.platform}
                  </span>
                </a>
              );
            })}
          </div>
          <div className="hidden md:flex items-center gap-4 flex-1">
            <div className="flex-1 h-px bg-border" />
            <h3 className="text-2xl font-bold text-foreground font-space-grotesk whitespace-nowrap">
              My Profiles
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialLinks;
