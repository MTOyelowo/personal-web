"use client";

import { FC } from "react";
import {
  FiMail,
  FiMapPin,
  FiPhone,
  FiGithub,
  FiGlobe,
  FiLink,
} from "react-icons/fi";
import Link from "next/link";
import { useAboutInfoItems } from "@/hooks/query/useAbout";
import Spinner from "@/components/ui/spinner";
import type { IconType } from "react-icons";

const iconMap: Record<string, IconType> = {
  mail: FiMail,
  "map-pin": FiMapPin,
  phone: FiPhone,
  github: FiGithub,
  globe: FiGlobe,
  link: FiLink,
};

const AboutInfo: FC = () => {
  const { data: items, isLoading } = useAboutInfoItems();

  if (isLoading) {
    return (
      <section className="flex items-center justify-center py-16">
        <Spinner size={28} />
      </section>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section id="about-info" className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-space-grotesk">
            Info
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => {
            const Icon = iconMap[item.iconKey] ?? FiLink;
            return (
              <div
                key={item.id}
                className="flex items-start gap-4 p-5 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors"
              >
                <div className="p-2.5 rounded-lg bg-background border border-border">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-space-grotesk mb-1">
                    {item.label}
                  </p>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-sm text-foreground hover:text-muted-foreground transition-colors break-all font-space-grotesk"
                      target={
                        item.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        item.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      {item.value}
                    </Link>
                  ) : (
                    <p className="text-sm text-foreground font-space-grotesk">
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutInfo;
