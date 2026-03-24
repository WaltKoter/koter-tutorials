"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface SpaceSettings {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  primaryColor: string;
  accentColor: string;
  published: boolean;
}

export default function SpaceSettingsPage() {
  const params = useParams<{ spaceSlug: string }>();
  const router = useRouter();
  const [space, setSpace] = useState<SpaceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/spaces/by-slug/${params.spaceSlug}`);
        if (!res.ok) throw new Error("Failed to load space");
        const data = await res.json();
        setSpace(data);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load space"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.spaceSlug]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!space) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/spaces/${space.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: space.name,
          slug: space.slug,
          description: space.description,
          primaryColor: space.primaryColor,
          accentColor: space.accentColor,
          published: space.published,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      const updated = await res.json();
      toast.success("Settings saved");

      if (updated.slug !== params.spaceSlug) {
        router.replace(`/admin/spaces/${updated.slug}/settings`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!space) return;
    if (
      !confirm(
        "Are you sure you want to delete this space? This action cannot be undone."
      )
    )
      return;

    try {
      const res = await fetch(`/api/spaces/${space.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Space deleted");
      router.push("/admin/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="p-8">
        <p className="text-zinc-500">Space not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Space Settings
        </h1>
        <a
          href={`/${space.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-sm font-medium hover:bg-muted transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          View Public Site
        </a>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={space.name}
            onChange={(e) => setSpace({ ...space, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={space.slug}
            onChange={(e) => setSpace({ ...space, slug: e.target.value })}
            required
          />
          <p className="text-xs text-zinc-500">
            URL path: /{space.slug}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={space.description || ""}
            onChange={(e) =>
              setSpace({ ...space, description: e.target.value || null })
            }
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="primaryColor"
                value={space.primaryColor}
                onChange={(e) =>
                  setSpace({ ...space, primaryColor: e.target.value })
                }
                className="h-9 w-9 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              />
              <Input
                value={space.primaryColor}
                onChange={(e) =>
                  setSpace({ ...space, primaryColor: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="accentColor"
                value={space.accentColor}
                onChange={(e) =>
                  setSpace({ ...space, accentColor: e.target.value })
                }
                className="h-9 w-9 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              />
              <Input
                value={space.accentColor}
                onChange={(e) =>
                  setSpace({ ...space, accentColor: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Published
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Make this space publicly accessible
            </p>
          </div>
          <Switch
            checked={space.published}
            onCheckedChange={(checked) =>
              setSpace({ ...space, published: checked })
            }
          />
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      <Separator className="my-8" />

      <div className="rounded-lg border border-red-200 dark:border-red-900/50 p-4">
        <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
          Danger Zone
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          Permanently delete this space and all its pages.
        </p>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-1.5" />
          Delete Space
        </Button>
      </div>
    </div>
  );
}
