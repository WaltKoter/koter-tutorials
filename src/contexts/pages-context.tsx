"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface PageItem {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  order: number;
  status: "DRAFT" | "PUBLISHED";
}

interface PagesContextType {
  pages: PageItem[];
  setPages: (pages: PageItem[]) => void;
  addPage: (page: PageItem) => void;
  updatePage: (id: string, updates: Partial<PageItem>) => void;
  removePage: (id: string) => void;
  refreshPages: (spaceId: string) => Promise<void>;
}

const PagesContext = createContext<PagesContextType | null>(null);

export function PagesProvider({ children, initialPages, spaceId }: { children: ReactNode; initialPages: PageItem[]; spaceId: string }) {
  const [pages, setPages] = useState<PageItem[]>(initialPages);

  const addPage = useCallback((page: PageItem) => {
    setPages(prev => [...prev, page]);
  }, []);

  const updatePage = useCallback((id: string, updates: Partial<PageItem>) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const removePage = useCallback((id: string) => {
    // Remove page and all descendants
    setPages(prev => {
      const toRemove = new Set<string>();
      const findDescendants = (parentId: string) => {
        toRemove.add(parentId);
        prev.filter(p => p.parentId === parentId).forEach(child => findDescendants(child.id));
      };
      findDescendants(id);
      return prev.filter(p => !toRemove.has(p.id));
    });
  }, []);

  const refreshPages = useCallback(async (sid: string) => {
    const res = await fetch(`/api/spaces/${sid}/pages`);
    if (res.ok) {
      const data = await res.json();
      setPages(data);
    }
  }, []);

  return (
    <PagesContext.Provider value={{ pages, setPages, addPage, updatePage, removePage, refreshPages }}>
      {children}
    </PagesContext.Provider>
  );
}

export function usePages() {
  const ctx = useContext(PagesContext);
  if (!ctx) throw new Error("usePages must be used within PagesProvider");
  return ctx;
}
