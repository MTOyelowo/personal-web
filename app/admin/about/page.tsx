"use client";

import { FC, JSX, useState } from "react";
import { FiUser, FiBriefcase, FiCode, FiInfo, FiShare2 } from "react-icons/fi";
import PageHeader from "@/components/admin/page-header";
import HeroTab from "@/components/admin/about/hero-tab";
import ProjectsTab from "@/components/admin/about/projects-tab";
import ExperienceTab from "@/components/admin/about/experience-tab";
import InfoTab from "@/components/admin/about/info-tab";
import SocialTab from "@/components/admin/about/social-tab";

/* ── Tab config ──────────────────────────────────────────── */

type Tab = "hero" | "projects" | "experience" | "info" | "social";

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "hero", label: "Hero & CV", icon: <FiUser size={16} /> },
  { key: "projects", label: "Projects", icon: <FiCode size={16} /> },
  { key: "experience", label: "Experience", icon: <FiBriefcase size={16} /> },
  { key: "info", label: "Info", icon: <FiInfo size={16} /> },
  { key: "social", label: "Social", icon: <FiShare2 size={16} /> },
];

const TAB_COMPONENTS: Record<Tab, FC> = {
  hero: HeroTab,
  projects: ProjectsTab,
  experience: ExperienceTab,
  info: InfoTab,
  social: SocialTab,
};

/* ── Page ────────────────────────────────────────────────── */

const AdminAboutPage: FC = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const ActiveTabComponent = TAB_COMPONENTS[activeTab];

  return (
    <div>
      <PageHeader
        title="About / Portfolio"
        description="Manage your about page content, projects, experience, and social links."
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <ActiveTabComponent />
    </div>
  );
};

export default AdminAboutPage;
