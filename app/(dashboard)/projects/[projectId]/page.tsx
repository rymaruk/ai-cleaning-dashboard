import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings, Package } from "lucide-react";
import { SubscriptionPanel } from "@/components/dashboard/subscription-panel";
import { EmbedCodeBlock } from "@/components/dashboard/embed-code-block";
import { LogsTable } from "@/components/dashboard/logs-table";
import type { Subscription, SubscriptionPlan } from "@/lib/types/database";

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectDetailPage({ params }: Props) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) notFound();

  // Get active subscription
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("project_id", projectId)
    .eq("status", "active")
    .order("expires_at", { ascending: false })
    .limit(1);

  const currentSub = (subs?.[0] as Subscription) ?? null;
  const hasActiveSub =
    currentSub && new Date(currentSub.expires_at) > new Date();

  // Get plan details
  let currentPlan: SubscriptionPlan | null = null;
  if (currentSub) {
    const { data: planData } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", currentSub.plan_id)
      .single();
    currentPlan = planData as SubscriptionPlan | null;
  }

  // Get all active plans
  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  // Get product count
  const { count: productCount } = await supabase
    .from("project_products")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  const hasProducts = (productCount ?? 0) > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.site_url}</p>
        </div>
        <Link href={`/projects/${projectId}/settings`}>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="embed">Embed Code</TabsTrigger>
          <TabsTrigger value="logs">Query Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Products</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              {productCount ?? 0} products uploaded
            </p>
            <p className="text-sm text-muted-foreground">
              Product upload with column mapping will be available in the next
              update. Use the admin pipeline to process products for now.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <SubscriptionPanel
            projectId={projectId}
            currentSubscription={hasActiveSub ? currentSub : null}
            currentPlan={currentPlan}
            plans={(plans as SubscriptionPlan[]) ?? []}
          />
        </TabsContent>

        <TabsContent value="embed" className="mt-6">
          <EmbedCodeBlock
            widgetToken={project.widget_token}
            hasActiveSubscription={!!hasActiveSub}
            hasProducts={hasProducts}
          />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <LogsTable projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
