import { FC } from "react";
import { FaGithub, FaFacebook, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { IconType } from "react-icons";

interface SocialLink {
  href: string;
  icon: IconType;
  label: string;
}

const socialLinks: SocialLink[] = [
  {
    href: "https://github.com/MTOyelowo",
    icon: FaGithub,
    label: "GitHub",
  },
  {
    href: "https://facebook.com",
    icon: FaFacebook,
    label: "Facebook",
  },
  {
    href: "https://instagram.com",
    icon: FaInstagram,
    label: "Instagram",
  },
  {
    href: "https://x.com",
    icon: FaXTwitter,
    label: "X (Twitter)",
  },
];

const SocialLinks: FC = () => {
  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            {socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2"
                aria-label={link.label}
              >
                <div className="p-3 rounded-full border border-border bg-background text-muted-foreground group-hover:text-foreground group-hover:border-foreground/20 transition-all duration-200 group-hover:scale-110">
                  <link.icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-space-grotesk">
                  {link.label}
                </span>
              </a>
            ))}
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
