"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(content: unknown[]): Heading[] {
  const headings: Heading[] = [];

  if (!Array.isArray(content)) return headings;

  for (const node of content) {
    if (typeof node !== "object" || node === null) continue;
    const n = node as Record<string, unknown>;
    const type = n.type as string | undefined;

    if (type === "h1" || type === "h2" || type === "h3") {
      const level = parseInt(type.charAt(1), 10);
      const children = n.children as Array<{ text?: string }> | undefined;
      const text = children
        ?.map((c) => c.text ?? "")
        .join("")
        .trim();

      if (text) {
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-");

        headings.push({ id, text, level });
      }
    }
  }

  return headings;
}

interface DocsTocProps {
  content: unknown[];
}

export function DocsToc({ content }: DocsTocProps) {
  const headings = extractHeadings(content);
  const [activeId, setActiveId] = React.useState<string>("");

  React.useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="text-xs">
      <p className="mb-2 font-medium text-foreground">Nesta pagina</p>
      <ul className="flex flex-col gap-1.5">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block text-muted-foreground transition-colors hover:text-foreground",
                heading.level === 2 && "pl-2",
                heading.level === 3 && "pl-4",
                activeId === heading.id && "text-foreground font-medium"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
