import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import type { UserProfile } from "@/lib/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userProfile = (profile as UserProfile) ?? null;

  return (
    <div className="flex min-h-screen">
      <Sidebar userProfile={userProfile} />
      <div className="flex flex-1 flex-col ml-64">
        <TopNav userProfile={userProfile} />
        <main className="flex-1 p-6 bg-muted/40">{children}</main>
      </div>
    </div>
  );
}
