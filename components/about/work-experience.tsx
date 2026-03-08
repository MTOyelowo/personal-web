import { FC } from "react";

interface ExperienceEntry {
  company: string;
  position: string;
  dateRange: string;
  descriptions: string[];
}

const experiences: ExperienceEntry[] = [
  {
    company: "TopRate Transfer",
    position: "Frontend Developer",
    dateRange: "Jun 2023 – May 2024",
    descriptions: [
      "Spearheaded the design and implementation of the Admin Dashboard, focusing on user-friendly web-based UI/UX and seamless API integrations. Key features included user and staff management, transaction monitoring, and currency pairing management.",
      "Led the development of the authentication system user interface, ensuring robust security measures and a smooth user experience through meticulous frontend design and API integration.",
      "Contributed to the development of the Customer Dashboard by integrating web-based UI/UX and APIs, facilitating intuitive money transfers, affiliate programs, and referral processes.",
      "Designed and deployed a responsive WordPress blog site to disseminate company news and articles, enhancing brand visibility and communication strategies.",
      "Authored detailed documentation for system components and features, providing valuable insights for operational efficiency and team collaboration.",
    ],
  },
  {
    company: "Freelance",
    position: "Freelance Writer",
    dateRange: "Since 2021",
    descriptions: [
      "Written over 300 product reviews, articles, and diverse content pieces for various independent blogs, showcasing versatility and expertise in writing for different niches and audiences.",
    ],
  },
  {
    company: "Industrial Training Fund Headquarters",
    position: "Technical Staff Support (NYSC Primary Assignment)",
    dateRange: "Jan – Nov 2021",
    descriptions: [
      "Delivered comprehensive IT technical support to the Fund's staff, ensuring seamless operations and resolving technical issues promptly.",
      "Provided vital office administration support, contributing to the smooth functioning of daily activities within the organization.",
      "Implemented user-friendly Excel spreadsheets to streamline vehicle maintenance record-keeping processes, enhancing efficiency and accuracy.",
      "Conducted informal training sessions for junior staff members to elevate their proficiency in Microsoft Word, Excel, and PowerPoint.",
    ],
  },
  {
    company: "Industrial Training Fund Headquarters",
    position: "Frontend Development / Graphics Design Intern",
    dateRange: "May – Oct 2019",
    descriptions: [
      "Crafted visually compelling posters and infographics utilizing Adobe Photoshop and CorelDRAW, elevating the brand presence and communication efforts of the Publicity Department.",
      "Mentored fellow interns by introducing them to foundational concepts in Python programming, fostering a collaborative learning environment.",
    ],
  },
  {
    company: "The Tick Times Nigeria",
    position: "News Writer",
    dateRange: "2016 – 2017",
    descriptions: [
      "Curated news from Nigeria and worldwide sources for online publication, ensuring timely and relevant content delivery.",
      "Authored numerous articles and opinion pieces covering a wide range of general topics, contributing to the diverse content offerings of the publication.",
    ],
  },
];

const WorkExperience: FC = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-space-grotesk">
            Experience
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-6 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-12">
            {experiences.map((exp, i) => (
              <div key={i} className="relative pl-8 md:pl-16">
                {/* Timeline dot */}
                <div className="absolute left-0 md:left-6 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-foreground bg-background" />

                {/* Date badge */}
                <div className="inline-block px-3 py-1 mb-3 text-xs font-medium rounded-full bg-muted text-muted-foreground font-space-grotesk">
                  {exp.dateRange}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground font-space-grotesk">
                  {exp.company}
                </h3>
                <p className="text-sm uppercase tracking-wider text-muted-foreground mt-1 mb-4 font-space-grotesk">
                  {exp.position}
                </p>

                <ul className="space-y-2">
                  {exp.descriptions.map((desc, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed font-space-grotesk"
                    >
                      <span className="mt-2 w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                      {desc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkExperience;
