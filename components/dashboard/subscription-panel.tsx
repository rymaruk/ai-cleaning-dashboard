"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Subscription, SubscriptionPlan } from "@/lib/types/database";

const dateFmt = new Intl.DateTimeFormat("uk-UA", {
  dateStyle: "long",
  timeStyle: "short",
});

type Props = {
  projectId: string;
  currentSubscription: Subscription | null;
  currentPlan: SubscriptionPlan | null;
  plans: SubscriptionPlan[];
};

export function SubscriptionPanel({
  projectId,
  currentSubscription,
  currentPlan,
  plans,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activatePlan = async (plan: SubscriptionPlan) => {
    setLoading(plan.id);
    setError(null);
    try {
      const supabase = createClient();
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + plan.duration_days * 24 * 60 * 60 * 1000
      );

      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          project_id: projectId,
          plan_id: plan.id,
          status: "active",
          starts_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      router.refresh();
    } catch {
      setError("Failed to activate plan");
    } finally {
      setLoading(null);
    }
  };

  if (currentSubscription && currentPlan) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">Current Subscription</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-medium">{currentPlan.name}</span>
            <Badge className="bg-green-600 hover:bg-green-700 text-white">
              Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {currentPlan.description}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Expires:</span>{" "}
            {dateFmt.format(new Date(currentSubscription.expires_at))}
          </p>
          <Button
            variant="outline"
            onClick={() => activatePlan(currentPlan)}
            disabled={loading !== null}
          >
            {loading ? "Renewing..." : "Renew Subscription"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Choose a Plan</h2>
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
              <p className="text-2xl font-bold">
                {plan.price === 0 ? "Free" : `${plan.price} ${plan.currency}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {plan.duration_days} days
              </p>
              <Button
                className="w-full"
                onClick={() => activatePlan(plan)}
                disabled={loading !== null}
              >
                {loading === plan.id ? "Activating..." : "Activate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
