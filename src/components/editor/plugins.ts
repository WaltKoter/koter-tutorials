"use client";

import { BasicBlocksPlugin, BasicMarksPlugin } from "@platejs/basic-nodes/react";
import { ListPlugin } from "@platejs/list/react";
import { IndentPlugin } from "@platejs/indent/react";
import { LinkPlugin } from "@platejs/link/react";
import { ImagePlugin } from "@platejs/media/react";
import { TogglePlugin } from "@platejs/toggle/react";
import { BlockMenuPlugin } from "@platejs/selection/react";
import { MarkdownPlugin } from "@platejs/markdown";

export const plugins = [
  BasicBlocksPlugin,
  BasicMarksPlugin,
  ListPlugin,
  IndentPlugin,
  LinkPlugin,
  ImagePlugin.configure({
    options: {
      uploadImage: async (dataUrl: ArrayBuffer | string) => {
        // Convert dataUrl to blob and upload
        const blob = typeof dataUrl === "string"
          ? await fetch(dataUrl).then((r) => r.blob())
          : new Blob([dataUrl]);
        const formData = new FormData();
        formData.append("file", blob, "image.png");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        return data.url as string;
      },
    },
  }),
  TogglePlugin,
  BlockMenuPlugin,
  MarkdownPlugin,
];
