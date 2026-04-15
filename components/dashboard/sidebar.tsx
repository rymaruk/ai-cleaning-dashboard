"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/lib/types/database";

const navItems = [
  { href: "/dashboard", label: "Projects", icon: LayoutDashboard },
  { href: "/projects/new", label: "New Project", icon: PlusCircle },
];

export function Sidebar({ userProfile }: { userProfile: UserProfile | null }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <h1 className="text-lg font-bold">AI Dashboard</h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/dashboard" && pathname === "/dashboard");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {userProfile && (
        <div className="border-t border-slate-800 p-4">
          <p className="text-xs text-slate-400">Signed in as</p>
          <p className="text-sm font-medium truncate">
            {userProfile.first_name} {userProfile.last_name}
          </p>
        </div>
      )}
    </aside>
  );
}
