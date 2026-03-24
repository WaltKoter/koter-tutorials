"use client";

import { Plate, PlateContent, createPlateEditor } from "platejs/react";
import { plugins } from "./plugins";
import { cn } from "@/lib/utils";

interface PlateViewerProps {
  content: any;
  className?: string;
}

const viewerStyles = [
  // Paragraph
  "[&_p]:my-2 [&_p]:leading-7",

  // Headings
  "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:leading-tight",
  "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:leading-tight",
  "[&_h3]:text-xl [&_h3]:font-medium [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:leading-snug",
  "[&_h4]:text-lg [&_h4]:font-medium [&_h4]:mt-4 [&_h4]:mb-2",
  "[&_h5]:text-base [&_h5]:font-medium [&_h5]:mt-3 [&_h5]:mb-1",
  "[&_h6]:text-sm [&_h6]:font-medium [&_h6]:mt-3 [&_h6]:mb-1 [&_h6]:text-muted-foreground",

  // Inline marks
  "[&_strong]:font-bold",
  "[&_em]:italic",
  "[&_u]:underline",
  "[&_s]:line-through",
  "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:border [&_code]:border-border",
  "[&_mark]:bg-yellow-200/60 [&_mark]:px-0.5 [&_mark]:rounded-sm dark:[&_mark]:bg-yellow-500/30",

  // Blockquote
  "[&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground",

  // Code block
  "[&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:font-mono [&_pre]:leading-relaxed",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:border-0 [&_pre_code]:text-inherit",

  // Lists
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2",
  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2",
  "[&_li]:my-1 [&_li]:leading-7",
  "[&_ul_ul]:list-[circle] [&_ul_ul_ul]:list-[square]",

  // Horizontal rule
  "[&_hr]:my-6 [&_hr]:border-border",

  // Links
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-primary/40 hover:[&_a]:decoration-primary [&_a]:transition-colors",

  // Images
  "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_img]:mx-auto [&_img]:block [&_img]:shadow-sm",

  // Toggle / collapsible
  "[&_details]:my-3 [&_details]:rounded-lg [&_details]:border [&_details]:border-border [&_details]:p-3",
  "[&_summary]:cursor-pointer [&_summary]:font-medium [&_summary]:select-none",

  // Table
  "[&_table]:w-full [&_table]:border-collapse [&_table]:my-4",
  "[&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-muted [&_th]:font-medium [&_th]:text-left",
  "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2",
].join(" ");

export function PlateViewer({ content, className }: PlateViewerProps) {
  const editor = createPlateEditor({
    plugins,
    value: content && content.length > 0 ? content : [{ type: "p", children: [{ text: "" }] }],
  });

  return (
    <Plate editor={editor}>
      <PlateContent
        readOnly
        className={cn("outline-none", viewerStyles, className)}
      />
    </Plate>
  );
}
