"use client";

import { FC, JSX, useState } from "react";
import AdminSidebar from "./admin-sidebar";
import { FiMenu } from "react-icons/fi";

interface AdminShellProps {
  user: {
    name: string;
    email: string;
    avatar: string | null;
  };
  children: React.ReactNode;
}

const AdminShell: FC<AdminShellProps> = ({ user, children }): JSX.Element => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 font-space-grotesk">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar user={user} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-60 h-full">
            <AdminSidebar user={user} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center h-[57px] px-4 border-b border-gray-200 bg-white">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <FiMenu size={20} />
          </button>
          <span className="ml-3 text-sm font-semibold text-gray-900">
            Admin
          </span>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminShell;
