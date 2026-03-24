"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorRef, useEditorSelection } from "platejs/react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  SquareCheck,
  ImageIcon,
  Quote,
  Code,
  Minus,
  ChevronRight,
} from "lucide-react";

interface CommandItemDef {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

interface CommandGroup {
  heading: string;
  items: CommandItemDef[];
}

export function SlashCommandMenu() {
  const editor = useEditorRef();
  const selection = useEditorSelection();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const slashPosRef = useRef<any>(null);

  const close = useCallback(() => {
    setOpen(false);
    setSearch("");
    slashPosRef.current = null;
  }, []);

  const removeSlashText = useCallback(() => {
    if (!slashPosRef.current) return;

    try {
      const { path, offset } = slashPosRef.current;
      const deleteLength = 1 + search.length; // "/" + whatever was typed after

      editor.tf.delete({
        at: {
          anchor: { path, offset },
          focus: { path, offset: offset + deleteLength },
        },
      });
    } catch {
      // If deletion fails, just continue with block insertion
    }
  }, [editor, search]);

  const executeCommand = useCallback(
    (action: () => void) => {
      removeSlashText();
      action();
      close();
    },
    [removeSlashText, close]
  );

  const insertBlock = useCallback(
    (type: string) => {
      editor.tf.toggleBlock(type);
    },
    [editor]
  );

  const insertHr = useCallback(() => {
    editor.tf.insertNodes(
      { type: "hr", children: [{ text: "" }] } as any,
      { select: true }
    );
  }, [editor]);

  const insertImage = useCallback(() => {
    const url = window.prompt("URL da imagem:");
    if (!url) return;
    editor.tf.insertNodes(
      { type: "img", url, children: [{ text: "" }] } as any,
      { select: true }
    );
  }, [editor]);

  const commandGroups: CommandGroup[] = [
    {
      heading: "Texto Basico",
      items: [
        {
          label: "Paragrafo",
          description: "Texto simples",
          icon: Type,
          action: () => insertBlock("p"),
        },
        {
          label: "Titulo 1",
          description: "Titulo grande",
          icon: Heading1,
          action: () => insertBlock("h1"),
        },
        {
          label: "Titulo 2",
          description: "Titulo medio",
          icon: Heading2,
          action: () => insertBlock("h2"),
        },
        {
          label: "Titulo 3",
          description: "Titulo pequeno",
          icon: Heading3,
          action: () => insertBlock("h3"),
        },
      ],
    },
    {
      heading: "Listas",
      items: [
        {
          label: "Lista com marcadores",
          description: "Lista nao ordenada",
          icon: List,
          action: () => insertBlock("ul"),
        },
        {
          label: "Lista numerada",
          description: "Lista ordenada",
          icon: ListOrdered,
          action: () => insertBlock("ol"),
        },
        {
          label: "Lista de tarefas",
          description: "Lista com checkboxes",
          icon: SquareCheck,
          action: () => insertBlock("action_item"),
        },
      ],
    },
    {
      heading: "Midia",
      items: [
        {
          label: "Imagem",
          description: "Inserir imagem",
          icon: ImageIcon,
          action: () => insertImage(),
        },
      ],
    },
    {
      heading: "Avancado",
      items: [
        {
          label: "Citacao",
          description: "Bloco de citacao",
          icon: Quote,
          action: () => insertBlock("blockquote"),
        },
        {
          label: "Codigo",
          description: "Bloco de codigo",
          icon: Code,
          action: () => insertBlock("code_block"),
        },
        {
          label: "Linha divisoria",
          description: "Separador horizontal",
          icon: Minus,
          action: () => insertHr(),
        },
        {
          label: "Toggle",
          description: "Bloco colapsavel",
          icon: ChevronRight,
          action: () => insertBlock("toggle"),
        },
      ],
    },
  ];

  // Listen for "/" key and position the menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        close();
        return;
      }

      if (e.key === "/" && !open) {
        // Check if cursor is at start of block or after a space
        const domSelection = window.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) return;

        const range = domSelection.getRangeAt(0);
        if (!range.collapsed) return;

        // Store position of the "/" character
        const sel = editor.selection;
        if (sel) {
          slashPosRef.current = {
            path: [...sel.anchor.path],
            offset: sel.anchor.offset,
          };
        }

        // Get cursor position for menu placement
        const rect = range.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 4,
          left: rect.left,
        });

        // Open menu after the "/" is inserted
        setTimeout(() => {
          setOpen(true);
          setSearch("");
        }, 0);
      }
    };

    const editorEl = document.querySelector("[data-plate-content]");
    if (editorEl) {
      editorEl.addEventListener("keydown", handleKeyDown as EventListener);
      return () => editorEl.removeEventListener("keydown", handleKeyDown as EventListener);
    }
  }, [open, close, editor]);

  // Track typing after "/" to filter commands
  useEffect(() => {
    if (!open) return;

    const handleInput = () => {
      if (!slashPosRef.current) return;

      try {
        const sel = editor.selection;
        if (!sel) return;

        const { path, offset } = slashPosRef.current;

        // Get text from "/" to cursor
        const nodeEntry = editor.api.node(sel.anchor.path);
        if (!nodeEntry || !nodeEntry[0]) return;

        const text = (nodeEntry[0] as any).text || "";
        const slashIndex = offset;
        const currentOffset = sel.anchor.offset;

        if (currentOffset > slashIndex) {
          const typed = text.slice(slashIndex + 1, currentOffset);
          setSearch(typed);
        }
      } catch {
        // Ignore errors
      }
    };

    const editorEl = document.querySelector("[data-plate-content]");
    if (editorEl) {
      editorEl.addEventListener("input", handleInput);
      return () => editorEl.removeEventListener("input", handleInput);
    }
  }, [open, editor]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-72 rounded-xl border border-border bg-popover shadow-xl"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Command
        filter={(value, search) => {
          if (value.toLowerCase().includes(search.toLowerCase())) return 1;
          return 0;
        }}
      >
        <CommandInput
          placeholder="Filtrar comandos..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>Nenhum comando encontrado.</CommandEmpty>
          {commandGroups.map((group) => (
            <CommandGroup key={group.heading} heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.label}
                  value={`${item.label} ${item.description}`}
                  onSelect={() => executeCommand(item.action)}
                >
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </div>
  );
}
