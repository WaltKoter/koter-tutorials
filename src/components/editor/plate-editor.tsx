"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plate, PlateContent, createPlateEditor } from "platejs/react";
import { BasicBlocksPlugin, BasicMarksPlugin } from "@platejs/basic-nodes/react";
import { cn } from "@/lib/utils";

interface PlateEditorProps {
  initialContent: any;
  onSave: (content: any) => Promise<void>;
  className?: string;
}

export function PlateEditor({ initialContent, onSave, className }: PlateEditorProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = createPlateEditor({
    plugins: [BasicBlocksPlugin, BasicMarksPlugin],
    value: initialContent && initialContent.length > 0 ? initialContent : undefined,
  });

  const handleChange = useCallback(({ value }: { value: any }) => {
    setSaved(false);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await onSave(value);
        setSaved(true);
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setSaving(false);
      }
    }, 1500);
  }, [onSave]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div className="absolute top-2 right-2 z-10 text-xs text-muted-foreground">
        {saving ? "Salvando..." : saved ? "Salvo" : "Alterações não salvas"}
      </div>
      <Plate editor={editor} onChange={handleChange}>
        <PlateContent
          className="min-h-[500px] px-16 py-8 outline-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:my-2 [&_p]:leading-7 [&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_hr]:my-6 [&_hr]:border-border [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-1"
          placeholder="Start typing..."
        />
      </Plate>
    </div>
  );
}
