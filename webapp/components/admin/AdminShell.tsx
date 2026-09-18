"use client";

import { useState, type ReactNode } from "react";
import { adminAppInfo } from "@/lib/admin";
import AdminHeader from "./AdminHeader";
import Sidebar from "./Sidebar";

export default function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:pl-64">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-col">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          {children}
        </main>

        <footer className="border-t border-gray-200/80 bg-white px-4 py-4 text-xs text-gray-400 md:px-8">
          <div className="mx-auto w-full max-w-7xl">{adminAppInfo.copyrightLabel}</div>
        </footer>
      </div>
    </div>
  );
}