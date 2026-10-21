// ExportManager — professional PDF generation with jsPDF.
// Screenplay uses Courier 12pt with industry-standard margins & pagination.
// Formatting is applied only where specified, fixing the "everything bold" bug.

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ScriptElement, ElementType } from "./screenplay";

const PAGE_W = 612; // 8.5in * 72
const PAGE_H = 792; // 11in * 72
const TOP = 72; // 1in
const BOTTOM = 72; // 1in
const LEFT = 108; // 1.5in
const RIGHT = 72; // 1in
const LINE = 14;
const FONT_SIZE = 12;

interface Layout {
  x: number;
  width: number;
  uppercase?: boolean;
  align?: "left" | "right";
  marginTop?: number;
}

const LAYOUTS: Record<ElementType, Layout> = {
  scene_heading: { x: LEFT, width: PAGE_W - LEFT - RIGHT, uppercase: true, marginTop: LINE },
  action: { x: LEFT, width: PAGE_W - LEFT - RIGHT, marginTop: LINE },
  character: { x: 3.7 * 72, width: 2.5 * 72, uppercase: true, marginTop: LINE },
  dialogue: { x: 2.5 * 72, width: 3.5 * 72, marginTop: 0 },
  parenthetical: { x: 3.1 * 72, width: 2 * 72, marginTop: 0 },
  transition: {
    x: LEFT,
    width: PAGE_W - LEFT - RIGHT,
    uppercase: true,
    align: "right",
    marginTop: LINE,
  },
  notes: { x: LEFT, width: PAGE_W - LEFT - RIGHT, marginTop: LINE / 2 },
};

function newDoc() {
  return new jsPDF({ unit: "pt", format: "letter" });
}

function addPageNumbers(doc: jsPDF, startPage = 1) {
  const total = doc.getNumberOfPages();
  for (let p = startPage; p <= total; p++) {
    doc.setPage(p);
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.text(`${p}.`, PAGE_W - RIGHT, TOP - 24, { align: "right" });
  }
}

export interface ScriptDoc {
  title: string;
  author?: string;
  elements: ScriptElement[];
}

interface Seg {
  text: string;
  bold: boolean;
}

// Parse **bold** markers into styled segments.
function parseBold(text: string): Seg[] {
  const segs: Seg[] = [];
  const re = /\*\*([\s\S]+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) segs.push({ text: text.slice(last, m.index), bold: false });
    segs.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) segs.push({ text: text.slice(last), bold: false });
  return segs.length ? segs : [{ text, bold: false }];
}

// Render segmented rich text (with bold spans) at x, wrapping to width.
// Returns the new y position after rendering. `style` selects normal/italic base.
function renderRich(
  doc: jsPDF,
  segs: Seg[],
  x: number,
  startY: number,
  width: number,
  baseStyle: "normal" | "italic",
  align: "left" | "right",
): number {
  let y = startY;
  const spaceW = () => {
    doc.setFont("courier", baseStyle);
    return doc.getTextWidth(" ");
  };
  // Build tokens: word + bold flag.
  type Tok = { word: string; bold: boolean };
  const lines: Tok[][] = [[]];
  let lineW = 0;
  for (const seg of segs) {
    const words = seg.text.split(/(\s+)/).filter((w) => w.length > 0);
    for (const w of words) {
      if (/^\s+$/.test(w)) {
        lines[lines.length - 1].push({ word: " ", bold: seg.bold });
        continue;
      }
      doc.setFont("courier", seg.bold ? "bold" : baseStyle);
      const ww = doc.getTextWidth(w);
      if (lineW + ww > width && lines[lines.length - 1].length > 0) {
        lines.push([]);
        lineW = 0;
      }
      lines[lines.length - 1].push({ word: w, bold: seg.bold });
      lineW += ww + spaceW();
    }
  }

  for (const toks of lines) {
    if (y > PAGE_H - BOTTOM) {
      doc.addPage();
      y = TOP;
    }
    // Measure total line width for right alignment.
    let total = 0;
    for (const t of toks) {
      doc.setFont("courier", t.bold ? "bold" : baseStyle);
      total += doc.getTextWidth(t.word);
    }
    let cx = align === "right" ? PAGE_W - RIGHT - total : x;
    for (const t of toks) {
      doc.setFont("courier", t.bold ? "bold" : baseStyle);
      doc.text(t.word, cx, y);
      cx += doc.getTextWidth(t.word);
    }
    y += LINE;
  }
  return y;
}

function renderScript(doc: jsPDF, script: ScriptDoc, startY: number): number {
  doc.setFont("courier", "normal");
  doc.setFontSize(FONT_SIZE);
  let y = startY;

  for (const el of script.elements) {
    const layout = LAYOUTS[el.type];
    let text = el.text || "";
    if (layout.uppercase) text = text.toUpperCase();
    if (el.type === "parenthetical") text = `(${text.replace(/^\(|\)$/g, "")})`;
    if (el.type === "notes") text = `[ ${text} ]`;

    y += layout.marginTop ?? 0;

    const baseStyle = el.type === "notes" || el.type === "parenthetical" ? "italic" : "normal";
    const segs = parseBold(text || " ");
    y = renderRich(
      doc,
      segs,
      layout.x,
      y,
      layout.width,
      baseStyle,
      layout.align === "right" ? "right" : "left",
    );
  }
  return y;
}

function coverPage(doc: jsPDF, title: string, subtitle?: string, author?: string) {
  doc.setFont("courier", "bold");
  doc.setFontSize(26);
  doc.text(title.toUpperCase(), PAGE_W / 2, PAGE_H / 2 - 40, { align: "center" });
  if (subtitle) {
    doc.setFont("courier", "normal");
    doc.setFontSize(13);
    doc.text(subtitle, PAGE_W / 2, PAGE_H / 2, { align: "center" });
  }
  if (author) {
    doc.setFont("courier", "normal");
    doc.setFontSize(12);
    doc.text(`Written by`, PAGE_W / 2, PAGE_H / 2 + 60, { align: "center" });
    doc.text(author, PAGE_W / 2, PAGE_H / 2 + 80, { align: "center" });
  }
}

function sectionHeader(doc: jsPDF, label: string): number {
  doc.addPage();
  doc.setFont("courier", "bold");
  doc.setFontSize(18);
  doc.text(label.toUpperCase(), LEFT, TOP + 10);
  doc.setDrawColor(150);
  doc.line(LEFT, TOP + 20, PAGE_W - RIGHT, TOP + 20);
  return TOP + 50;
}

function save(doc: jsPDF, name: string) {
  doc.save(name.endsWith(".pdf") ? name : `${name}.pdf`);
}

// ---------- table-based helpers ----------
function table(doc: jsPDF, head: string[], body: (string | number)[][], startY: number) {
  autoTable(doc, {
    head: [head],
    body: body.length ? body : [head.map(() => "—")],
    startY,
    margin: { left: LEFT, right: RIGHT },
    styles: { font: "courier", fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [31, 41, 55], textColor: 255, fontStyle: "bold" },
  });
}

export const ExportManager = {
  exportScriptPDF(script: ScriptDoc) {
    const doc = newDoc();
    coverPage(doc, script.title, undefined, script.author);
    doc.addPage();
    renderScript(doc, script, TOP);
    addPageNumbers(doc, 2);
    save(doc, `${script.title || "script"}.pdf`);
  },

  exportStoryStructurePDF(
    projectTitle: string,
    beats: {
      act?: string | null;
      title: string;
      description?: string | null;
      notes?: string | null;
    }[],
  ) {
    const doc = newDoc();
    let y = sectionHeader(doc, `${projectTitle} — Story Structure`);
    doc.setFontSize(11);
    for (const b of beats) {
      if (y > PAGE_H - BOTTOM - 40) {
        doc.addPage();
        y = TOP;
      }
      doc.setFont("courier", "bold");
      doc.text(`${b.act ? `[${b.act}] ` : ""}${b.title}`, LEFT, y);
      y += LINE;
      doc.setFont("courier", "normal");
      const lines = doc.splitTextToSize(b.description || "—", PAGE_W - LEFT - RIGHT);
      doc.text(lines, LEFT, y);
      y += lines.length * LINE;
      if (b.notes) {
        doc.setFont("courier", "italic");
        const nl = doc.splitTextToSize(`Notes: ${b.notes}`, PAGE_W - LEFT - RIGHT);
        doc.text(nl, LEFT, y);
        y += nl.length * LINE;
      }
      y += LINE / 2;
    }
    addPageNumbers(doc);
    save(doc, `${projectTitle}-structure.pdf`);
  },

  exportCallSheetPDF(cs: {
    title: string;
    shoot_date?: string | null;
    location_details?: string | null;
    shooting_notes?: string | null;
    cast_calls?: { name?: string; role?: string; call?: string }[];
    crew_calls?: { name?: string; role?: string; call?: string }[];
  }) {
    const doc = newDoc();
    let y = sectionHeader(doc, cs.title);
    doc.setFont("courier", "normal");
    doc.setFontSize(11);
    if (cs.shoot_date) {
      doc.text(`Date: ${cs.shoot_date}`, LEFT, y);
      y += LINE;
    }
    if (cs.location_details) {
      const l = doc.splitTextToSize(`Location: ${cs.location_details}`, PAGE_W - LEFT - RIGHT);
      doc.text(l, LEFT, y);
      y += l.length * LINE;
    }
    y += LINE;
    table(
      doc,
      ["Cast", "Role", "Call Time"],
      (cs.cast_calls || []).map((c) => [c.name || "", c.role || "", c.call || ""]),
      y,
    );
    y = (doc as any).lastAutoTable.finalY + 20;
    table(
      doc,
      ["Crew", "Role", "Call Time"],
      (cs.crew_calls || []).map((c) => [c.name || "", c.role || "", c.call || ""]),
      y,
    );
    if (cs.shooting_notes) {
      y = (doc as any).lastAutoTable.finalY + 20;
      doc.setFont("courier", "italic");
      doc.text(doc.splitTextToSize(`Notes: ${cs.shooting_notes}`, PAGE_W - LEFT - RIGHT), LEFT, y);
    }
    addPageNumbers(doc);
    save(doc, `${cs.title}-callsheet.pdf`);
  },

  exportSchedulePDF(
    projectTitle: string,
    rows: {
      shoot_day?: number;
      shoot_date?: string | null;
      scene?: string | null;
      int_ext?: string | null;
      day_night?: string | null;
      location?: string | null;
      cast_members?: string | null;
      pages?: string | null;
    }[],
  ) {
    const doc = newDoc();
    const y = sectionHeader(doc, `${projectTitle} — Shooting Schedule`);
    table(
      doc,
      ["Day", "Date", "Scene", "I/E", "D/N", "Location", "Cast", "Pages"],
      rows.map((r) => [
        r.shoot_day ?? "",
        r.shoot_date || "",
        r.scene || "",
        r.int_ext || "",
        r.day_night || "",
        r.location || "",
        r.cast_members || "",
        r.pages || "",
      ]),
      y,
    );
    addPageNumbers(doc);
    save(doc, `${projectTitle}-schedule.pdf`);
  },

  exportStoryboardPDF(
    projectTitle: string,
    shots: {
      shot_description?: string | null;
      camera_angle?: string | null;
      lens_info?: string | null;
      camera_movement?: string | null;
      scene_link?: string | null;
      notes?: string | null;
    }[],
  ) {
    const doc = newDoc();
    const y = sectionHeader(doc, `${projectTitle} — Storyboard`);
    table(
      doc,
      ["#", "Scene", "Description", "Angle", "Lens", "Movement"],
      shots.map((s, i) => [
        i + 1,
        s.scene_link || "",
        s.shot_description || "",
        s.camera_angle || "",
        s.lens_info || "",
        s.camera_movement || "",
      ]),
      y,
    );
    addPageNumbers(doc);
    save(doc, `${projectTitle}-storyboard.pdf`);
  },

  exportCostumesPDF(
    projectTitle: string,
    rows: {
      name?: string | null;
      character_name?: string | null;
      actor_name?: string | null;
      scene_references?: string | null;
      size?: string | null;
      status?: string | null;
      responsible_person?: string | null;
    }[],
  ) {
    const doc = newDoc();
    const y = sectionHeader(doc, `${projectTitle} — Costume & Dress`);
    table(
      doc,
      ["Costume", "Character", "Actor", "Scenes", "Size", "Status", "Responsible"],
      rows.map((r) => [
        r.name || "",
        r.character_name || "",
        r.actor_name || "",
        r.scene_references || "",
        r.size || "",
        r.status || "",
        r.responsible_person || "",
      ]),
      y,
    );
    addPageNumbers(doc);
    save(doc, `${projectTitle}-costumes.pdf`);
  },

  exportFullProjectPDF(data: {
    project: {
      title: string;
      logline?: string | null;
      synopsis?: string | null;
      author?: string | null;
      genre?: string | null;
    };
    script?: ScriptDoc;
    beats?: { act?: string | null; title: string; description?: string | null }[];
    characters?: {
      name: string;
      description?: string | null;
      goal?: string | null;
      character_arc?: string | null;
    }[];
    locations?: { name: string; address?: string | null; permission_status?: string | null }[];
    props?: {
      name: string;
      quantity?: number;
      department?: string | null;
      availability_status?: string | null;
    }[];
    storyboards?: { shot_description?: string | null; camera_angle?: string | null }[];
    callSheets?: { title: string; shoot_date?: string | null }[];
    schedule?: {
      shoot_day?: number;
      shoot_date?: string | null;
      scene?: string | null;
      location?: string | null;
    }[];
  }) {
    const doc = newDoc();
    const p = data.project;
    coverPage(doc, p.title, p.logline || p.genre || undefined, p.author || undefined);

    // Table of contents
    doc.addPage();
    doc.setFont("courier", "bold");
    doc.setFontSize(18);
    doc.text("TABLE OF CONTENTS", LEFT, TOP + 10);
    doc.setFont("courier", "normal");
    doc.setFontSize(12);
    const toc = [
      "1. Overview",
      "2. Story Structure",
      "3. Script",
      "4. Characters",
      "5. Locations",
      "6. Props & Costumes",
      "7. Storyboards",
      "8. Call Sheets",
      "9. Shooting Schedule",
    ];
    let ty = TOP + 50;
    toc.forEach((t) => {
      doc.text(t, LEFT, ty);
      ty += LINE * 1.4;
    });

    // Overview
    let y = sectionHeader(doc, "Overview");
    doc.setFont("courier", "normal");
    doc.setFontSize(11);
    const meta = [
      `Genre: ${p.genre || "—"}`,
      `Author: ${p.author || "—"}`,
      `Logline: ${p.logline || "—"}`,
    ];
    meta.forEach((m) => {
      const l = doc.splitTextToSize(m, PAGE_W - LEFT - RIGHT);
      doc.text(l, LEFT, y);
      y += l.length * LINE;
    });
    if (p.synopsis) {
      y += LINE;
      const l = doc.splitTextToSize(`Synopsis: ${p.synopsis}`, PAGE_W - LEFT - RIGHT);
      doc.text(l, LEFT, y);
    }

    // Story structure
    y = sectionHeader(doc, "Story Structure");
    table(
      doc,
      ["Act", "Beat", "Description"],
      (data.beats || []).map((b) => [b.act || "", b.title, b.description || ""]),
      y,
    );

    // Script
    sectionHeader(doc, "Script");
    if (data.script) renderScript(doc, data.script, TOP + 60);

    // Characters
    y = sectionHeader(doc, "Characters");
    table(
      doc,
      ["Name", "Description", "Goal", "Arc"],
      (data.characters || []).map((c) => [
        c.name,
        c.description || "",
        c.goal || "",
        c.character_arc || "",
      ]),
      y,
    );

    // Locations
    y = sectionHeader(doc, "Locations");
    table(
      doc,
      ["Name", "Address", "Permission"],
      (data.locations || []).map((l) => [l.name, l.address || "", l.permission_status || ""]),
      y,
    );

    // Props
    y = sectionHeader(doc, "Props & Costumes");
    table(
      doc,
      ["Item", "Qty", "Dept", "Status"],
      (data.props || []).map((pr) => [
        pr.name,
        pr.quantity ?? 1,
        pr.department || "",
        pr.availability_status || "",
      ]),
      y,
    );

    // Storyboards
    y = sectionHeader(doc, "Storyboards");
    table(
      doc,
      ["#", "Description", "Angle"],
      (data.storyboards || []).map((s, i) => [
        i + 1,
        s.shot_description || "",
        s.camera_angle || "",
      ]),
      y,
    );

    // Call sheets
    y = sectionHeader(doc, "Call Sheets");
    table(
      doc,
      ["Title", "Date"],
      (data.callSheets || []).map((c) => [c.title, c.shoot_date || ""]),
      y,
    );

    // Schedule
    y = sectionHeader(doc, "Shooting Schedule");
    table(
      doc,
      ["Day", "Date", "Scene", "Location"],
      (data.schedule || []).map((s) => [
        s.shoot_day ?? "",
        s.shoot_date || "",
        s.scene || "",
        s.location || "",
      ]),
      y,
    );

    addPageNumbers(doc, 2);
    save(doc, `${p.title}-full-project.pdf`);
  },
};
