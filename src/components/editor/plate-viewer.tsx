"use client";

import { Plate, PlateContent, createPlateEditor } from "platejs/react";
import { BasicBlocksPlugin, BasicMarksPlugin } from "@platejs/basic-nodes/react";
import { cn } from "@/lib/utils";

interface PlateViewerProps {
  content: any;
  className?: string;
}

export function PlateViewer({ content, className }: PlateViewerProps) {
  const editor = createPlateEditor({
    plugins: [BasicBlocksPlugin, BasicMarksPlugin],
    value: content && content.length > 0 ? content : [{ type: "p", children: [{ text: "" }] }],
  });

  return (
    <Plate editor={editor}>
      <PlateContent
        readOnly
        className={cn(
          "outline-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:my-2 [&_p]:leading-7 [&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_hr]:my-6 [&_hr]:border-border [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-1",
          className
        )}
      />
    </Plate>
  );
}
