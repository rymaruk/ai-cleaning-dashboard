import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Package } from "lucide-react";
import type { ProjectWithSubscription } from "@/lib/types/database";

const dateFmt = new Intl.DateTimeFormat("uk-UA", {
  dateStyle: "medium",
});

function getSubscriptionBadge(project: ProjectWithSubscription) {
  if (!project.subscription) {
    return <Badge variant="secondary">No Subscription</Badge>;
  }
  const isExpired = new Date(project.subscription.expires_at) < new Date();
  if (isExpired) {
    return <Badge variant="destructive">Expired</Badge>;
  }
  return (
    <Badge className="bg-green-600 hover:bg-green-700 text-white">
      Active
    </Badge>
  );
}

export function ProjectCard({ project }: { project: ProjectWithSubscription }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            {getSubscriptionBadge(project)}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" />
            <span className="truncate">{project.site_url}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5" />
            <span>{project.product_count} products</span>
          </div>
          {project.subscription &&
            new Date(project.subscription.expires_at) > new Date() && (
              <p className="text-xs">
                Expires: {dateFmt.format(new Date(project.subscription.expires_at))}
              </p>
            )}
          <p className="text-xs">
            Created: {dateFmt.format(new Date(project.created_at))}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
