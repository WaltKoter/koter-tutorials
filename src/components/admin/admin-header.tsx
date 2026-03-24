"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminHeader() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out");
      router.push("/admin/login");
    } catch {
      toast.error("Logout failed");
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Koter Tutorials
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
