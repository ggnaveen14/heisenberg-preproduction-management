// Screenplay engine: element model, TAB/ENTER workflow, Fountain import/export.

export type ElementType =
  "scene_heading" | "action" | "character" | "dialogue" | "parenthetical" | "transition" | "notes";

export interface ScriptElement {
  id: string;
  type: ElementType;
  text: string;
}

export const ELEMENT_LABELS: Record<ElementType, string> = {
  scene_heading: "Scene Heading",
  action: "Action",
  character: "Character",
  dialogue: "Dialogue",
  parenthetical: "Parenthetical",
  transition: "Transition",
  notes: "Notes",
};

// TAB cycles through the element types in screenplay order.
const TAB_ORDER: ElementType[] = [
  "scene_heading",
  "action",
  "character",
  "dialogue",
  "parenthetical",
  "transition",
];

export function nextTabType(current: ElementType): ElementType {
  const i = TAB_ORDER.indexOf(current);
  if (i === -1) return "action";
  return TAB_ORDER[(i + 1) % TAB_ORDER.length];
}

// ENTER advances to the natural next element type.
export function nextEnterType(current: ElementType): ElementType {
  switch (current) {
    case "scene_heading":
      return "action";
    case "action":
      return "action";
    case "character":
      return "dialogue";
    case "dialogue":
      return "character";
    case "parenthetical":
      return "dialogue";
    case "transition":
      return "scene_heading";
    case "notes":
      return "action";
    default:
      return "action";
  }
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function emptyElement(type: ElementType = "scene_heading"): ScriptElement {
  return { id: uid(), type, text: "" };
}

export function blankScript(): ScriptElement[] {
  return [emptyElement("scene_heading")];
}

export function formatForType(type: ElementType, text: string): string {
  if (type === "scene_heading" || type === "character" || type === "transition") {
    return text.toUpperCase();
  }
  return text;
}

// ===== Fountain export =====
export function toFountain(elements: ScriptElement[]): string {
  return elements
    .map((el) => {
      switch (el.type) {
        case "scene_heading":
          return el.text.toUpperCase();
        case "character":
          return el.text.toUpperCase();
        case "parenthetical": {
          const t = el.text.trim();
          return t.startsWith("(") ? t : `(${t})`;
        }
        case "transition":
          return el.text.toUpperCase() + (el.text.trim().endsWith(":") ? "" : ":");
        case "notes":
          return `[[${el.text}]]`;
        default:
          return el.text;
      }
    })
    .join("\n\n");
}

// ===== Fountain import (pragmatic parser) =====
export function fromFountain(text: string): ScriptElement[] {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const out: ScriptElement[] = [];
  let prevWasCharacter = false;

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;

    if (/^(\[\[.*\]\])$/s.test(block)) {
      out.push({ id: uid(), type: "notes", text: block.replace(/^\[\[|\]\]$/g, "").trim() });
      prevWasCharacter = false;
      continue;
    }
    if (/^(INT\.|EXT\.|EST\.|INT\/EXT|I\/E)/i.test(block)) {
      out.push({ id: uid(), type: "scene_heading", text: block });
      prevWasCharacter = false;
      continue;
    }
    if (/[A-Z\s:]+TO:$/.test(block) || /^FADE (IN|OUT)/i.test(block) || /^CUT TO/i.test(block)) {
      out.push({ id: uid(), type: "transition", text: block.replace(/:$/, "") });
      prevWasCharacter = false;
      continue;
    }
    if (/^\(.*\)$/.test(block)) {
      out.push({ id: uid(), type: "parenthetical", text: block.replace(/^\(|\)$/g, "") });
      prevWasCharacter = false;
      continue;
    }
    // A character cue: short, uppercase line possibly followed by dialogue lines.
    const lines = block.split("\n");
    const first = lines[0];
    if (
      first === first.toUpperCase() &&
      /[A-Z]/.test(first) &&
      first.length < 40 &&
      lines.length >= 1 &&
      !first.includes(".")
    ) {
      out.push({ id: uid(), type: "character", text: first });
      const rest = lines.slice(1).join("\n").trim();
      if (rest) out.push({ id: uid(), type: "dialogue", text: rest });
      prevWasCharacter = true;
      continue;
    }
    if (prevWasCharacter) {
      out.push({ id: uid(), type: "dialogue", text: block });
      prevWasCharacter = false;
      continue;
    }
    out.push({ id: uid(), type: "action", text: block });
    prevWasCharacter = false;
  }

  return out.length ? out : blankScript();
}

export function extractSceneHeadings(elements: ScriptElement[]) {
  return elements
    .map((el, idx) => ({ el, idx }))
    .filter(({ el }) => el.type === "scene_heading")
    .map(({ el, idx }) => ({ id: el.id, idx, text: el.text || "(untitled scene)" }));
}
