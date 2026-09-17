"use client";

import { useState, type ReactNode } from "react";
import { adminAppInfo } from "@/lib/admin";
import AdminHeader from "./AdminHeader";
import Sidebar from "./Sidebar";

export default function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 md:pl-64">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-col">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>

        <footer className="border-t border-gray-200 bg-white px-4 py-3 text-xs text-gray-500 md:px-8">
          {adminAppInfo.copyrightLabel}
        </footer>
      </div>
    </div>
  );
}