"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RefreshCw, Trash2 } from "lucide-react";
import type { Project } from "@/lib/types/database";

export default function ProjectSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (data) {
        setProject(data as Project);
        setName(data.name);
        setDescription(data.description ?? "");
        setSiteUrl(data.site_url);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          site_url: siteUrl.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateToken = async () => {
    const supabase = createClient();
    const newToken = crypto.randomUUID();
    const { error: updateError } = await supabase
      .from("projects")
      .update({ widget_token: newToken, updated_at: new Date().toISOString() })
      .eq("id", projectId);

    if (!updateError) {
      setProject((prev) =>
        prev ? { ...prev, widget_token: newToken } : prev
      );
      router.refresh();
    }
  };

  const handleDelete = async () => {
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (!deleteError) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  if (!project) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Settings</CardTitle>
          <CardDescription>Update your project details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteUrl">Website URL</Label>
            <Input
              id="siteUrl"
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Widget Token</CardTitle>
          <CardDescription>
            Current token: <code className="text-xs">{project.widget_token}</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" /> Regenerate Token
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Regenerate Widget Token?</DialogTitle>
                <DialogDescription>
                  This will invalidate the current embed code. Any website using
                  the old token will stop working. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="destructive" onClick={handleRegenerateToken}>
                  Regenerate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete this project and all its data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Project?</DialogTitle>
                <DialogDescription>
                  This will permanently delete the project, all products, and
                  query logs. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete Permanently
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
