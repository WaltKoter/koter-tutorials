"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorRef, useEditorSelection } from "platejs/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  Link,
  Heading1,
  Heading2,
  Heading3,
  Type,
  ChevronDown,
} from "lucide-react";

interface ToolbarButtonProps {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ active, onClick, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`
        p-1.5 rounded transition-colors cursor-pointer
        ${active ? "bg-white/20 text-white" : "text-gray-300 hover:text-white hover:bg-white/10"}
      `}
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="w-px h-5 bg-gray-600 mx-1" />;
}

export function FloatingToolbar() {
  const editor = useEditorRef();
  const selection = useEditorSelection();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [marks, setMarks] = useState<Record<string, boolean>>({});
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const updateToolbar = useCallback(() => {
    if (!selection) {
      setVisible(false);
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection || domSelection.isCollapsed || domSelection.rangeCount === 0) {
      setVisible(false);
      return;
    }

    const range = domSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0) {
      setVisible(false);
      return;
    }

    const editorEl = document.querySelector("[data-plate-content]") as HTMLElement | null;
    if (!editorEl) {
      setVisible(false);
      return;
    }

    const editorRect = editorEl.getBoundingClientRect();
    const toolbarWidth = 380;
    const toolbarHeight = 40;

    let left = rect.left + rect.width / 2 - toolbarWidth / 2;
    left = Math.max(editorRect.left, Math.min(left, editorRect.right - toolbarWidth));

    const top = rect.top - toolbarHeight - 8;

    setPosition({ top, left });
    setVisible(true);

    // Update active marks
    const currentMarks = (editor.api.marks() || {}) as Record<string, boolean>;
    setMarks({
      bold: !!currentMarks.bold,
      italic: !!currentMarks.italic,
      underline: !!currentMarks.underline,
      strikethrough: !!currentMarks.strikethrough,
      code: !!currentMarks.code,
      highlight: !!currentMarks.highlight,
    });
  }, [selection, editor]);

  useEffect(() => {
    // Small delay to let selection settle
    const timer = setTimeout(updateToolbar, 10);
    return () => clearTimeout(timer);
  }, [updateToolbar]);

  const toggleMark = useCallback(
    (mark: string) => {
      editor.tf.toggleMark(mark);
      // Update marks state after toggle
      setTimeout(() => {
        const currentMarks = (editor.api.marks() || {}) as Record<string, boolean>;
        setMarks({
          bold: !!currentMarks.bold,
          italic: !!currentMarks.italic,
          underline: !!currentMarks.underline,
          strikethrough: !!currentMarks.strikethrough,
          code: !!currentMarks.code,
          highlight: !!currentMarks.highlight,
        });
      }, 0);
    },
    [editor]
  );

  const setBlockType = useCallback(
    (type: string) => {
      editor.tf.toggleBlock(type);
      setShowBlockMenu(false);
    },
    [editor]
  );

  const insertLink = useCallback(() => {
    const url = window.prompt("URL do link:");
    if (!url) return;

    const domSelection = window.getSelection();
    const text = domSelection?.toString() || url;

    editor.tf.insertNodes(
      {
        type: "a",
        url,
        children: [{ text }],
      } as any,
      { select: true }
    );
  }, [editor]);

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex items-center gap-0.5 px-1.5 py-1 rounded-lg shadow-xl border border-gray-700"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        backgroundColor: "#1e1e1e",
      }}
    >
      {/* Block type dropdown */}
      <div className="relative">
        <ToolbarButton
          title="Tipo de bloco"
          onClick={() => setShowBlockMenu(!showBlockMenu)}
        >
          <div className="flex items-center gap-0.5">
            <Type className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </div>
        </ToolbarButton>
        {showBlockMenu && (
          <div
            className="absolute top-full left-0 mt-1 w-40 rounded-lg shadow-xl border border-gray-700 py-1 z-50"
            style={{ backgroundColor: "#1e1e1e" }}
          >
            {[
              { type: "p", label: "Paragrafo", icon: Type },
              { type: "h1", label: "Titulo 1", icon: Heading1 },
              { type: "h2", label: "Titulo 2", icon: Heading2 },
              { type: "h3", label: "Titulo 3", icon: Heading3 },
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setBlockType(type);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <ToolbarSeparator />

      {/* Mark buttons */}
      <ToolbarButton active={marks.bold} onClick={() => toggleMark("bold")} title="Negrito (Ctrl+B)">
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton active={marks.italic} onClick={() => toggleMark("italic")} title="Italico (Ctrl+I)">
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton active={marks.underline} onClick={() => toggleMark("underline")} title="Sublinhado (Ctrl+U)">
        <Underline className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton active={marks.strikethrough} onClick={() => toggleMark("strikethrough")} title="Riscado">
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton active={marks.code} onClick={() => toggleMark("code")} title="Codigo">
        <Code className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton active={marks.highlight} onClick={() => toggleMark("highlight")} title="Destaque">
        <Highlighter className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Link button */}
      <ToolbarButton onClick={insertLink} title="Link">
        <Link className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
}
