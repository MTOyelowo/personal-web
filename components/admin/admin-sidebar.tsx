"use client";

import { FC, JSX, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiGrid,
  FiFileText,
  FiSun,
  FiFolder,
  FiTag,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiHome,
} from "react-icons/fi";
import Logo from "@/components/ui/logo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <FiGrid size={20} /> },
  { label: "Posts", href: "/admin/posts", icon: <FiFileText size={20} /> },
  {
    label: "Daily Words",
    href: "/admin/daily-words",
    icon: <FiSun size={20} />,
  },
  {
    label: "Collections",
    href: "/admin/collections",
    icon: <FiFolder size={20} />,
  },
  { label: "Categories", href: "/admin/categories", icon: <FiTag size={20} /> },
];

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
    avatar: string | null;
  };
}

const AdminSidebar: FC<AdminSidebarProps> = ({ user }): JSX.Element => {
  const pathname = usePathname();

  // Initialize from localStorage synchronously to avoid flash
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin-sidebar-collapsed") === "true";
    }
    return false;
  });

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("admin-sidebar-collapsed", String(next));
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`sticky top-0 h-screen flex flex-col border-r border-gray-200 bg-white transition-all duration-200 ${
        collapsed ? "w-[68px]" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-[57px] border-b border-gray-200 px-3">
        {collapsed ? (
          <span className="text-lg font-bold font-space-grotesk">T</span>
        ) : (
          <Logo width={120} height={38} />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-200 p-2 space-y-1">
        <Link
          href="/"
          title={collapsed ? "Back to site" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <FiHome size={18} />
          {!collapsed && <span>Back to site</span>}
        </Link>

        <button
          onClick={() => {
            window.location.href = "/api/auth/signout";
          }}
          title={collapsed ? "Sign out" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <FiLogOut size={18} />
          {!collapsed && <span>Sign out</span>}
        </button>

        {/* User info */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0 overflow-hidden">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          {collapsed ? (
            <FiChevronRight size={18} />
          ) : (
            <FiChevronLeft size={18} />
          )}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
