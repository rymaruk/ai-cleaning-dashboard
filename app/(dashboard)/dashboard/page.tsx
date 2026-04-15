import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/dashboard/project-card";
import { PlusCircle } from "lucide-react";
import type { ProjectWithSubscription } from "@/lib/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const projectsWithDetails: ProjectWithSubscription[] = await Promise.all(
    (projects ?? []).map(async (project) => {
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("project_id", project.id)
        .eq("status", "active")
        .order("expires_at", { ascending: false })
        .limit(1);

      const sub = subs?.[0] ?? null;

      let plan = null;
      if (sub) {
        const { data: planData } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("id", sub.plan_id)
          .single();
        plan = planData;
      }

      const { count } = await supabase
        .from("project_products")
        .select("*", { count: "exact", head: true })
        .eq("project_id", project.id);

      return {
        ...project,
        subscription: sub,
        plan,
        product_count: count ?? 0,
      };
    })
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <Link href="/projects/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>

      {projectsWithDetails.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-4">No projects yet</p>
          <Link href="/projects/new">
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" /> Create your first project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projectsWithDetails.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
