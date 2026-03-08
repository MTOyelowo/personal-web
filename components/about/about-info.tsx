import { FC } from "react";
import { FiMail, FiMapPin, FiPhone, FiGithub } from "react-icons/fi";
import Link from "next/link";

const details = [
  {
    icon: FiMapPin,
    label: "Location",
    value: "No 20 Inukan Avenue, Moniya, Ibadan, Oyo State, Nigeria",
  },
  {
    icon: FiMail,
    label: "Email",
    value: "oyelowomayowa@gmail.com",
    href: "mailto:oyelowomayowa@gmail.com",
  },
  {
    icon: FiPhone,
    label: "Phone",
    value: "+234 810 389 4074",
    href: "tel:+2348103894074",
  },
  {
    icon: FiGithub,
    label: "GitHub",
    value: "github.com/MTOyelowo",
    href: "https://github.com/MTOyelowo",
  },
];

const AboutInfo: FC = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-space-grotesk">
            Info
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {details.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-5 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors"
            >
              <div className="p-2.5 rounded-lg bg-background border border-border">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-space-grotesk mb-1">
                  {item.label}
                </p>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-sm text-foreground hover:text-muted-foreground transition-colors break-all font-space-grotesk"
                    target={item.href.startsWith("http") ? "_blank" : undefined}
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutInfo;
