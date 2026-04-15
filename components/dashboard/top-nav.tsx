"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserProfile } from "@/lib/types/database";

export function TopNav({ userProfile }: { userProfile: UserProfile | null }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = userProfile
    ? `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase()
    : "?";

  const fullName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : "User";

  return (
    <header className="flex h-16 items-center justify-end border-b bg-white px-6">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-medium text-white">
                {initials}
              </div>
              <span className="text-sm font-medium">{fullName}</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="gap-2" disabled>
            <User className="h-4 w-4" />
            {userProfile?.role === "admin" ? "Admin" : "User"}
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
