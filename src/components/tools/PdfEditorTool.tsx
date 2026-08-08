import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type PointerEvent as RPE } from "react";
import {
  Type,
  Highlighter,
  PenLine,
  Square,
  Circle as CircleIcon,
  Minus,
  Image as ImageIcon,
  MousePointer2,
  Trash2,
  RotateCw,
  Copy as CopyIcon,
  Download,
  Undo2,
  Redo2,
  ChevronUp,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  Eraser,
  StickyNote,
  Signature,
  Grid3x3,
  Stamp,
  ListOrdered,
  FilePlus2,
  FileInput,
  X,
} from "lucide-react";
import { Dropzone } from "./Dropzone";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";
import { loadPdfjs } from "@/lib/pdfjs-loader";

// Fabric types are loaded dynamically; we keep this file client-safe by
// importing `fabric` only inside browser effects.
type FabricAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

type ToolMode =
  | "select"
  | "text"
  | "draw"
  | "highlight"
  | "rect"
  | "ellipse"
  | "line"
  | "image"
  | "whiteout"
  | "note";

interface PageState {
  originalIndex: number;
  rotation: 0 | 90 | 180 | 270;
  widthPt: number;
  heightPt: number;
  thumb: string;
}

interface HistoryEntry {
  page: number;
  json: string;
}

const FONT_FAMILIES = [
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Arial",
  "Georgia",
  "Verdana",
];

const COLORS = ["#111111", "#ffffff", "#e11d48", "#2563eb", "#16a34a", "#ea580c", "#facc15", "#7c3aed"];

const RENDER_SCALE_DEFAULT = 1.4;

export function PdfEditorTool() {
  const tool = tools.find((t) => t.slug === "pdf-editor")!;
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const [pages, setPages] = useState<PageState[]>([]);
  const [current, setCurrent] = useState(0);
  const [renderScale, setRenderScale] = useState(RENDER_SCALE_DEFAULT);
  const [mode, setMode] = useState<ToolMode>("select");
  const [color, setColor] = useState("#111111");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("Helvetica");
  const [activeObj, setActiveObj] = useState<FabricAny | null>(null);
  const [, forceRerender] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [sigOpen, setSigOpen] = useState(false);
  const [wmOpen, setWmOpen] = useState(false);
  const [pageNumOpen, setPageNumOpen] = useState(false);

  const pdfDocRef = useRef<FabricAny>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<FabricAny>(null);
  const fabricModRef = useRef<FabricAny>(null);
  const pageJsonRef = useRef<Map<number, string>>(new Map());
  const currentRef = useRef(0);
  const modeRef = useRef<ToolMode>("select");
  const undoStack = useRef<HistoryEntry[]>([]);
  const redoStack = useRef<HistoryEntry[]>([]);
  const skipHistoryRef = useRef(false);
  const snapRef = useRef(false);
  const gridRef = useRef(20);
  // Additional PDF documents whose pages were inserted into this editor.
  const insertedDocsRef = useRef<Array<{ file: File; doc: FabricAny; pages: { docFile: File; origIndex: number }[] }>>([]);

  useEffect(() => { currentRef.current = current; }, [current]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { snapRef.current = snapToGrid; }, [snapToGrid]);
  useEffect(() => { gridRef.current = gridSize; }, [gridSize]);

  const bumpRerender = () => forceRerender((n) => n + 1);

  const saveCurrentPageJson = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    pageJsonRef.current.set(currentRef.current, JSON.stringify(fc.toJSON()));
  }, []);

  const snapshotHistory = useCallback(() => {
    if (skipHistoryRef.current) return;
    const fc = fabricRef.current;
    if (!fc) return;
    undoStack.current.push({ page: currentRef.current, json: JSON.stringify(fc.toJSON()) });
    if (undoStack.current.length > 100) undoStack.current.shift();
    redoStack.current = [];
  }, []);

  // Load fabric module + create canvas when pages appear.
  useEffect(() => {
    if (pages.length === 0) return;
    let cancelled = false;
    (async () => {
      const fabric = await import("fabric");
      if (cancelled) return;
      fabricModRef.current = fabric;
      if (!fabricElRef.current) return;
      // If canvas already exists, dispose first
      if (fabricRef.current) {
        try { fabricRef.current.dispose(); } catch { /* noop */ }
        fabricRef.current = null;
      }
      const fc = new fabric.Canvas(fabricElRef.current, {
        preserveObjectStacking: true,
        selection: true,
        backgroundColor: "transparent",
      });
      fabricRef.current = fc;

      const onSelect = () => { setActiveObj(fc.getActiveObject() ?? null); };
      fc.on("selection:created", onSelect);
      fc.on("selection:updated", onSelect);
      fc.on("selection:cleared", () => setActiveObj(null));
      fc.on("object:modified", () => { snapshotHistory(); bumpRerender(); });
      fc.on("object:added", (e: FabricAny) => {
        if (e?.target?.__ephemeral) return;
        // Only record when action originates from a user tool (guarded by callers)
      });
      fc.on("path:created", () => { snapshotHistory(); });
      fc.on("text:changed", () => { bumpRerender(); });
      fc.on("mouse:down", handleFabricMouseDown);
      fc.on("object:moving", (e: FabricAny) => {
        if (!snapRef.current) return;
        const g = gridRef.current || 20;
        if (e?.target) {
          e.target.set({
            left: Math.round(e.target.left / g) * g,
            top: Math.round(e.target.top / g) * g,
          });
        }
      });

      // Kick off first render
      await renderPageInto(0);
    })();
    return () => {
      cancelled = true;
      const fc = fabricRef.current;
      if (fc) {
        try { fc.dispose(); } catch { /* noop */ }
        fabricRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.length]);

  // Handle clicks on empty canvas area to place shapes/text
  const handleFabricMouseDown = useCallback((opt: FabricAny) => {
    const fc = fabricRef.current;
    const fabric = fabricModRef.current;
    if (!fc || !fabric) return;
    const m = modeRef.current;
    if (m === "select" || m === "draw") return;
    // Clicked on an existing object? ignore
    if (opt.target) return;
    let pt: { x: number; y: number } = opt.scenePoint || opt.pointer || { x: 0, y: 0 };
    if ((!pt || (pt.x === 0 && pt.y === 0)) && typeof fc.getScenePoint === "function") {
      try { pt = fc.getScenePoint(opt.e); } catch { /* noop */ }
    }

    if (m === "text") {
      const t = new fabric.IText("Type here", {
        left: pt.x,
        top: pt.y,
        fill: color,
        fontFamily,
        fontSize,
        editable: true,
      });
      fc.add(t);
      fc.setActiveObject(t);
      t.enterEditing?.();
      t.selectAll?.();
      snapshotHistory();
      setMode("select");
    } else if (m === "rect") {
      const r = new fabric.Rect({
        left: pt.x, top: pt.y, width: 120, height: 80,
        fill: "transparent", stroke: color, strokeWidth,
      });
      fc.add(r);
      fc.setActiveObject(r);
      snapshotHistory();
      setMode("select");
    } else if (m === "ellipse") {
      const e = new fabric.Ellipse({
        left: pt.x, top: pt.y, rx: 60, ry: 40,
        fill: "transparent", stroke: color, strokeWidth,
      });
      fc.add(e);
      fc.setActiveObject(e);
      snapshotHistory();
      setMode("select");
    } else if (m === "line") {
      const ln = new fabric.Line([pt.x, pt.y, pt.x + 140, pt.y], {
        stroke: color, strokeWidth,
      });
      fc.add(ln);
      fc.setActiveObject(ln);
      snapshotHistory();
      setMode("select");
    } else if (m === "highlight") {
      const r = new fabric.Rect({
        left: pt.x, top: pt.y - 12, width: 180, height: 22,
        fill: color === "#111111" ? "#facc15" : color, opacity: 0.4, stroke: "transparent",
      });
      fc.add(r);
      fc.setActiveObject(r);
      snapshotHistory();
      setMode("select");
    } else if (m === "whiteout") {
      const r = new fabric.Rect({
        left: pt.x, top: pt.y - 10, width: 160, height: 22,
        fill: "#ffffff", opacity: 1, stroke: "transparent",
      });
      fc.add(r);
      fc.setActiveObject(r);
      snapshotHistory();
      setMode("select");
    } else if (m === "note") {
      const bg = new fabric.Rect({
        left: 0, top: 0, width: 160, height: 110,
        fill: "#fef3c7", stroke: "#f59e0b", strokeWidth: 1, rx: 4, ry: 4,
        shadow: new fabric.Shadow({ color: "rgba(0,0,0,0.15)", blur: 6, offsetX: 2, offsetY: 3 }),
      });
      const txt = new fabric.IText("Note…", {
        left: 8, top: 8, width: 144,
        fontFamily: "Arial", fontSize: 14, fill: "#111111", editable: true,
      });
      const g = new fabric.Group([bg, txt], { left: pt.x, top: pt.y, subTargetCheck: true });
      fc.add(g);
      fc.setActiveObject(g);
      snapshotHistory();
      setMode("select");
    } else if (m === "image") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/png,image/jpeg,image/webp";
      input.onchange = async () => {
        const f = input.files?.[0];
        if (!f) return;
        const dataUrl = await new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.onerror = rej;
          r.readAsDataURL(f);
        });
        const img = await fabric.FabricImage.fromURL(dataUrl);
        const maxW = 220;
        if (img.width && img.width > maxW) img.scaleToWidth(maxW);
        img.set({ left: pt.x, top: pt.y });
        fc.add(img);
        fc.setActiveObject(img);
        snapshotHistory();
        setMode("select");
      };
      input.click();
    }
    fc.requestRenderAll();
  }, [color, fontFamily, fontSize, snapshotHistory, strokeWidth]);

  // Reflect brush changes on mode / color / stroke changes
  useEffect(() => {
    const fc = fabricRef.current;
    const fabric = fabricModRef.current;
    if (!fc || !fabric) return;
    if (mode === "draw") {
      const brush = new fabric.PencilBrush(fc);
      brush.color = color;
      brush.width = strokeWidth;
      fc.freeDrawingBrush = brush;
      fc.isDrawingMode = true;
    } else {
      fc.isDrawingMode = false;
    }
    // Selection is only interactive in select mode; other modes still allow clicking objects
    fc.selection = mode === "select";
    // Fabric requires re-registering handlers; the mouse:down closure captures mode via ref
  }, [mode, color, strokeWidth]);

  const onFiles = async (fs: File[]) => {
    const f = fs.find((x) => x.type === "application/pdf" || /\.pdf$/i.test(x.name));
    if (!f) return setStatus({ kind: "error", message: "Please choose a PDF file." });
    setFile(f);
    setStatus({ kind: "working", message: "Opening PDF…", progress: 10 });
    try {
      const pdfjs = await loadPdfjs();
      const buf = new Uint8Array(await f.arrayBuffer());
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      pdfDocRef.current = doc;
      const next: PageState[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        setStatus({
          kind: "working",
          message: `Rendering thumbnails (${i}/${doc.numPages})…`,
          progress: 10 + (i / doc.numPages) * 70,
        });
        const page = await doc.getPage(i);
        const vp1 = page.getViewport({ scale: 1 });
        const thumbScale = Math.min(1, 140 / vp1.width);
        const vpT = page.getViewport({ scale: thumbScale });
        const tc = document.createElement("canvas");
        tc.width = Math.ceil(vpT.width);
        tc.height = Math.ceil(vpT.height);
        const tctx = tc.getContext("2d")!;
        tctx.fillStyle = "#ffffff";
        tctx.fillRect(0, 0, tc.width, tc.height);
        await page.render({ canvas: tc, canvasContext: tctx, viewport: vpT } as never).promise;
        next.push({
          originalIndex: i - 1,
          rotation: 0,
          widthPt: vp1.width,
          heightPt: vp1.height,
          thumb: tc.toDataURL("image/jpeg", 0.7),
        });
      }
      pageJsonRef.current = new Map();
      undoStack.current = [];
      redoStack.current = [];
      setPages(next);
      setCurrent(0);
      currentRef.current = 0;
      setStatus({ kind: "idle" });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Could not open this PDF. It may be encrypted or corrupted." });
    }
  };

  // Render PDF page into background canvas, resize fabric canvas, load JSON.
  const renderPageInto = useCallback(async (pageIndex: number) => {
    const doc = pdfDocRef.current;
    const fc = fabricRef.current;
    if (!doc || !fc) return;
    const p = pages[pageIndex];
    if (!p) return;
    const pdfjs = await loadPdfjs();
    void pdfjs;
    let w: number, h: number;
    const rotated = p.rotation === 90 || p.rotation === 270;
    if (p.originalIndex === -1) {
      // blank
      w = Math.ceil((rotated ? p.heightPt : p.widthPt) * renderScale);
      h = Math.ceil((rotated ? p.widthPt : p.heightPt) * renderScale);
      const bg = bgCanvasRef.current;
      if (bg) {
        bg.width = w; bg.height = h;
        const ctx = bg.getContext("2d")!;
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
      }
    } else {
      // resolve either original doc or an inserted doc
      let targetDoc = doc;
      let targetIndex = p.originalIndex;
      if (p.originalIndex < -1) {
        const marker = -2 - p.originalIndex; // 1-based
        // find matching inserted doc: use nearest match by marker (simple: search all)
        for (const ins of insertedDocsRef.current) {
          const idx = ins.pages.findIndex((pg) => pg.origIndex === marker - 1);
          if (idx >= 0) { targetDoc = ins.doc; targetIndex = marker - 1; break; }
        }
      }
      const page = await targetDoc.getPage(targetIndex + 1);
      const vp = page.getViewport({ scale: renderScale, rotation: p.rotation });
      w = Math.ceil(vp.width); h = Math.ceil(vp.height);
      const bg = bgCanvasRef.current;
      if (bg) {
        bg.width = w; bg.height = h;
        const ctx = bg.getContext("2d")!;
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
        await page.render({ canvas: bg, canvasContext: ctx, viewport: vp } as never).promise;
      }
    }

    // Resize fabric canvas
    fc.setDimensions({ width: w, height: h });
    fc.clear();
    const saved = pageJsonRef.current.get(pageIndex);
    if (saved) {
      skipHistoryRef.current = true;
      await fc.loadFromJSON(saved);
      skipHistoryRef.current = false;
    }
    fc.requestRenderAll();
  }, [pages, renderScale]);

  // Switch pages
  const goToPage = useCallback(async (i: number) => {
    if (i === currentRef.current) return;
    saveCurrentPageJson();
    currentRef.current = i;
    setCurrent(i);
    await renderPageInto(i);
  }, [renderPageInto, saveCurrentPageJson]);

  // Re-render on scale/rotation change
  useEffect(() => {
    if (!fabricRef.current || pages.length === 0) return;
    // Preserve current-page objects: snapshot before scale change so re-render restores
    saveCurrentPageJson();
    renderPageInto(currentRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderScale, pages]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const editable = (e.target as HTMLElement | null)?.isContentEditable;
      if (tag === "INPUT" || tag === "TEXTAREA" || editable) return;
      const fc = fabricRef.current;
      if (!fc) return;
      // If a fabric IText is in editing mode, let it handle keys
      const active = fc.getActiveObject();
      if (active && active.isEditing) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) doRedo(); else doUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        doRedo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (active) {
          e.preventDefault();
          deleteActive();
        }
      } else if (e.key === "Escape") {
        fc.discardActiveObject();
        fc.requestRenderAll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doUndo = () => {
    const fc = fabricRef.current;
    if (!fc) return;
    // Push current onto redo, pop from undo
    const currentJson = JSON.stringify(fc.toJSON());
    const prev = undoStack.current.pop();
    if (!prev) return;
    redoStack.current.push({ page: currentRef.current, json: currentJson });
    (async () => {
      if (prev.page !== currentRef.current) {
        saveCurrentPageJson();
        pageJsonRef.current.set(prev.page, prev.json);
        currentRef.current = prev.page;
        setCurrent(prev.page);
        await renderPageInto(prev.page);
      } else {
        skipHistoryRef.current = true;
        await fc.loadFromJSON(prev.json);
        skipHistoryRef.current = false;
        fc.requestRenderAll();
      }
    })();
  };
  const doRedo = () => {
    const fc = fabricRef.current;
    if (!fc) return;
    const nxt = redoStack.current.pop();
    if (!nxt) return;
    undoStack.current.push({ page: currentRef.current, json: JSON.stringify(fc.toJSON()) });
    (async () => {
      if (nxt.page !== currentRef.current) {
        saveCurrentPageJson();
        pageJsonRef.current.set(nxt.page, nxt.json);
        currentRef.current = nxt.page;
        setCurrent(nxt.page);
        await renderPageInto(nxt.page);
      } else {
        skipHistoryRef.current = true;
        await fc.loadFromJSON(nxt.json);
        skipHistoryRef.current = false;
        fc.requestRenderAll();
      }
    })();
  };

  const deleteActive = () => {
    const fc = fabricRef.current;
    if (!fc) return;
    const active = fc.getActiveObject();
    if (!active) return;
    snapshotHistory();
    if (active.type === "activeselection" || active._objects) {
      (active._objects || []).slice().forEach((o: FabricAny) => fc.remove(o));
      fc.discardActiveObject();
    } else {
      fc.remove(active);
    }
    fc.requestRenderAll();
    setActiveObj(null);
  };

  // Object property editors (applied to active object)
  const patchActive = (patch: Record<string, unknown>) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const a = fc.getActiveObject();
    if (!a) return;
    snapshotHistory();
    a.set(patch);
    a.setCoords?.();
    fc.requestRenderAll();
    bumpRerender();
  };

  const bringForward = () => {
    const fc = fabricRef.current;
    if (!fc) return;
    const a = fc.getActiveObject();
    if (!a) return;
    snapshotHistory();
    fc.bringObjectForward(a);
    fc.requestRenderAll();
  };
  const sendBackward = () => {
    const fc = fabricRef.current;
    if (!fc) return;
    const a = fc.getActiveObject();
    if (!a) return;
    snapshotHistory();
    fc.sendObjectBackwards(a);
    fc.requestRenderAll();
  };

  // Page ops
  const rotatePage = (i: number) => {
    if (i === currentRef.current) saveCurrentPageJson();
    setPages((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, rotation: (((p.rotation + 90) % 360) as 0 | 90 | 180 | 270) } : p)),
    );
  };
  const deletePage = (i: number) => {
    if (pages.length <= 1) { setStatus({ kind: "error", message: "Can't delete the last remaining page." }); return; }
    saveCurrentPageJson();
    // Rebuild json map with shifted keys
    const newMap = new Map<number, string>();
    pageJsonRef.current.forEach((v, k) => {
      if (k === i) return;
      newMap.set(k > i ? k - 1 : k, v);
    });
    pageJsonRef.current = newMap;
    setPages((prev) => prev.filter((_, idx) => idx !== i));
    setCurrent((c) => (c >= pages.length - 1 ? Math.max(0, pages.length - 2) : c));
  };
  const duplicatePage = (i: number) => {
    if (i === currentRef.current) saveCurrentPageJson();
    // Shift json map entries > i up by one, then copy i to i+1
    const src = pageJsonRef.current.get(i);
    const newMap = new Map<number, string>();
    pageJsonRef.current.forEach((v, k) => newMap.set(k > i ? k + 1 : k, v));
    if (src) newMap.set(i + 1, src);
    pageJsonRef.current = newMap;
    setPages((prev) => {
      const copy = [...prev];
      copy.splice(i + 1, 0, { ...prev[i] });
      return copy;
    });
  };
  const movePage = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= pages.length) return;
    saveCurrentPageJson();
    const a = pageJsonRef.current.get(i);
    const b = pageJsonRef.current.get(j);
    pageJsonRef.current.delete(i);
    pageJsonRef.current.delete(j);
    if (a) pageJsonRef.current.set(j, a);
    if (b) pageJsonRef.current.set(i, b);
    setPages((prev) => {
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
    setCurrent((c) => (c === i ? j : c === j ? i : c));
  };

  // Insert a blank page after index `afterIdx` (or at end if -1). Uses a synthetic
  // white "page" — since pdfDocRef is the original pdf.js doc, we store a marker
  // in PageState and handle it in renderPageInto + doExport.
  const addBlankPage = async (afterIdx: number) => {
    saveCurrentPageJson();
    const cur = pages[Math.max(0, afterIdx)] ?? pages[0];
    const w = cur?.widthPt ?? 612;
    const h = cur?.heightPt ?? 792;
    // Create a white thumbnail
    const tc = document.createElement("canvas");
    const tScale = Math.min(1, 140 / w);
    tc.width = Math.max(1, Math.ceil(w * tScale));
    tc.height = Math.max(1, Math.ceil(h * tScale));
    const tctx = tc.getContext("2d")!;
    tctx.fillStyle = "#ffffff";
    tctx.fillRect(0, 0, tc.width, tc.height);
    const blank: PageState = {
      originalIndex: -1, // marker: blank page
      rotation: 0,
      widthPt: w,
      heightPt: h,
      thumb: tc.toDataURL("image/jpeg", 0.7),
    };
    const insertAt = afterIdx + 1;
    // Shift json map entries >= insertAt up by one
    const newMap = new Map<number, string>();
    pageJsonRef.current.forEach((v, k) => newMap.set(k >= insertAt ? k + 1 : k, v));
    pageJsonRef.current = newMap;
    setPages((prev) => {
      const copy = [...prev];
      copy.splice(insertAt, 0, blank);
      return copy;
    });
    setCurrent(insertAt);
    currentRef.current = insertAt;
  };

  // Insert pages from another PDF after current page.
  const insertFromPdf = async (f: File) => {
    saveCurrentPageJson();
    setStatus({ kind: "working", message: "Reading inserted PDF…", progress: 20 });
    try {
      const pdfjs = await loadPdfjs();
      const buf = new Uint8Array(await f.arrayBuffer());
      const doc2 = await pdfjs.getDocument({ data: buf }).promise;
      const newPages: PageState[] = [];
      const inserted: { docFile: File; origIndex: number }[] = [];
      for (let i = 1; i <= doc2.numPages; i++) {
        const page = await doc2.getPage(i);
        const vp1 = page.getViewport({ scale: 1 });
        const thumbScale = Math.min(1, 140 / vp1.width);
        const vpT = page.getViewport({ scale: thumbScale });
        const tc = document.createElement("canvas");
        tc.width = Math.ceil(vpT.width);
        tc.height = Math.ceil(vpT.height);
        const tctx = tc.getContext("2d")!;
        tctx.fillStyle = "#ffffff";
        tctx.fillRect(0, 0, tc.width, tc.height);
        await page.render({ canvas: tc, canvasContext: tctx, viewport: vpT } as never).promise;
        newPages.push({
          originalIndex: -2 - i, // encode reference to insertedDocs
          rotation: 0,
          widthPt: vp1.width,
          heightPt: vp1.height,
          thumb: tc.toDataURL("image/jpeg", 0.7),
        });
        inserted.push({ docFile: f, origIndex: i - 1 });
      }
      insertedDocsRef.current.push({ file: f, doc: doc2, pages: inserted });
      const insertAt = currentRef.current + 1;
      const newMap = new Map<number, string>();
      pageJsonRef.current.forEach((v, k) => newMap.set(k >= insertAt ? k + newPages.length : k, v));
      pageJsonRef.current = newMap;
      setPages((prev) => {
        const copy = [...prev];
        copy.splice(insertAt, 0, ...newPages);
        return copy;
      });
      setStatus({ kind: "success", message: `Inserted ${newPages.length} page(s).` });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Could not read that PDF." });
    }
  };

  // Extract current page as a standalone PDF download.
  const extractCurrentPage = async () => {
    if (!file) return;
    try {
      saveCurrentPageJson();
      setStatus({ kind: "working", message: "Extracting page…", progress: 30 });
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const p = pages[currentRef.current];
      if (p && p.originalIndex >= 0) {
        const [copied] = await out.copyPages(src, [p.originalIndex]);
        out.addPage(copied);
      } else {
        out.addPage([p.widthPt, p.heightPt]);
      }
      const bytes = await out.save();
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `page-${currentRef.current + 1}.pdf`);
      setStatus({ kind: "success", message: "Extracted current page." });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Extract failed." });
    }
  };

  // Bulk: add a watermark IText to every page.
  const addWatermarkToAll = async (opts: { text: string; color: string; opacity: number; size: number; angle: number }) => {
    saveCurrentPageJson();
    const fabric = fabricModRef.current ?? (await import("fabric"));
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const rotated = p.rotation === 90 || p.rotation === 270;
      const cssW = (rotated ? p.heightPt : p.widthPt) * renderScale;
      const cssH = (rotated ? p.widthPt : p.heightPt) * renderScale;
      const off = document.createElement("canvas");
      const staticCanvas = new fabric.StaticCanvas(off, { width: cssW, height: cssH, backgroundColor: "transparent", enableRetinaScaling: false });
      const saved = pageJsonRef.current.get(i);
      if (saved) await staticCanvas.loadFromJSON(saved);
      const wm = new fabric.IText(opts.text, {
        fontFamily: "Helvetica",
        fontSize: opts.size,
        fill: opts.color,
        opacity: opts.opacity,
        angle: opts.angle,
        originX: "center",
        originY: "center",
        left: cssW / 2,
        top: cssH / 2,
        selectable: true,
      });
      staticCanvas.add(wm);
      pageJsonRef.current.set(i, JSON.stringify(staticCanvas.toJSON()));
      staticCanvas.dispose();
    }
    // reload current page from saved JSON
    await renderPageInto(currentRef.current);
    setStatus({ kind: "success", message: `Watermark added to ${pages.length} pages.` });
  };

  // Bulk: add page numbers.
  const addPageNumbers = async (opts: { position: "bl" | "br" | "bc" | "tl" | "tr" | "tc"; start: number; format: string; size: number; color: string }) => {
    saveCurrentPageJson();
    const fabric = fabricModRef.current ?? (await import("fabric"));
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const rotated = p.rotation === 90 || p.rotation === 270;
      const cssW = (rotated ? p.heightPt : p.widthPt) * renderScale;
      const cssH = (rotated ? p.widthPt : p.heightPt) * renderScale;
      const off = document.createElement("canvas");
      const sc = new fabric.StaticCanvas(off, { width: cssW, height: cssH, backgroundColor: "transparent", enableRetinaScaling: false });
      const saved = pageJsonRef.current.get(i);
      if (saved) await sc.loadFromJSON(saved);
      const label = opts.format
        .replace("{n}", String(opts.start + i))
        .replace("{total}", String(pages.length));
      const margin = 24;
      let left = margin, top = margin, originX: "left" | "center" | "right" = "left", originY: "top" | "bottom" = "top";
      const pos = opts.position;
      if (pos.startsWith("b")) { top = cssH - margin; originY = "bottom"; }
      if (pos.endsWith("l")) { left = margin; originX = "left"; }
      else if (pos.endsWith("c")) { left = cssW / 2; originX = "center"; }
      else { left = cssW - margin; originX = "right"; }
      const t = new fabric.IText(label, {
        fontFamily: "Helvetica", fontSize: opts.size, fill: opts.color,
        left, top, originX, originY,
      });
      sc.add(t);
      pageJsonRef.current.set(i, JSON.stringify(sc.toJSON()));
      sc.dispose();
    }
    await renderPageInto(currentRef.current);
    setStatus({ kind: "success", message: `Page numbers added.` });
  };

  // Signature: place a rendered signature image on current page.
  const placeSignatureImage = async (dataUrl: string) => {
    const fc = fabricRef.current;
    const fabric = fabricModRef.current;
    if (!fc || !fabric) return;
    const img = await fabric.FabricImage.fromURL(dataUrl);
    img.scaleToWidth(220);
    img.set({ left: 60, top: 60 });
    fc.add(img);
    fc.setActiveObject(img);
    snapshotHistory();
    fc.requestRenderAll();
  };

  // Export: for each page, render an overlay PNG from the saved fabric JSON at PDF-point scale,
  // stamp it onto the copied page.
  const doExport = async () => {
    if (!file || pages.length === 0) return;
    try {
      saveCurrentPageJson();
      setStatus({ kind: "working", message: "Building PDF…", progress: 10 });
      const { PDFDocument, degrees } = await import("pdf-lib");
      const fabric = fabricModRef.current ?? (await import("fabric"));
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
      const out = await PDFDocument.create();
      // Pre-load inserted PDFs as PDFDocuments for copyPages
      const insertedPdfDocs = new Map<File, FabricAny>();
      for (const ins of insertedDocsRef.current) {
        insertedPdfDocs.set(ins.file, await PDFDocument.load(new Uint8Array(await ins.file.arrayBuffer()), { ignoreEncryption: true }));
      }

      // For each page: copy, apply rotation, then overlay PNG (if any annotations).
      for (let i = 0; i < pages.length; i++) {
        setStatus({ kind: "working", message: `Writing page ${i + 1}/${pages.length}…`, progress: 10 + (i / pages.length) * 80 });
        const p = pages[i];
        if (p.originalIndex === -1) {
          out.addPage([p.widthPt, p.heightPt]);
          if (p.rotation) out.getPage(out.getPageCount() - 1).setRotation(degrees(p.rotation));
        } else if (p.originalIndex < -1) {
          const marker = -2 - p.originalIndex;
          let srcDoc: FabricAny | null = null;
          for (const ins of insertedDocsRef.current) {
            if (ins.pages.some((pg) => pg.origIndex === marker - 1)) {
              srcDoc = insertedPdfDocs.get(ins.file); break;
            }
          }
          if (srcDoc) {
            const [copied] = await out.copyPages(srcDoc, [marker - 1]);
            if (p.rotation) copied.setRotation(degrees(p.rotation));
            out.addPage(copied);
          } else {
            out.addPage([p.widthPt, p.heightPt]);
          }
        } else {
          const [copied] = await out.copyPages(src, [p.originalIndex]);
          if (p.rotation) copied.setRotation(degrees(p.rotation));
          out.addPage(copied);
        }
        const page = out.getPage(out.getPageCount() - 1);
        const { width: pw, height: ph } = page.getSize();

        const json = pageJsonRef.current.get(i);
        if (!json) continue;
        // Determine overlay canvas dimensions in the SAME rotated CSS pixel space we edited in.
        // p.widthPt/heightPt are ORIGINAL page dimensions. When rotation != 0 fabric was rendered
        // with viewport rotated, so its w/h are swapped when rotation is 90/270.
        const rotated = p.rotation === 90 || p.rotation === 270;
        const cssW = (rotated ? p.heightPt : p.widthPt) * renderScale;
        const cssH = (rotated ? p.widthPt : p.heightPt) * renderScale;

        // Render fabric JSON to an off-screen static canvas at high DPI.
        const dpiMultiplier = 2;
        const off = document.createElement("canvas");
        off.width = Math.ceil(cssW * dpiMultiplier);
        off.height = Math.ceil(cssH * dpiMultiplier);
        const staticCanvas = new fabric.StaticCanvas(off, {
          width: cssW,
          height: cssH,
          backgroundColor: "transparent",
          enableRetinaScaling: false,
        });
        staticCanvas.setZoom(1);
        await staticCanvas.loadFromJSON(json);
        // Manually upscale by drawing to a bigger target
        staticCanvas.setDimensions({ width: off.width, height: off.height }, { backstoreOnly: true });
        staticCanvas.setZoom(dpiMultiplier);
        staticCanvas.renderAll();

        const dataUrl = off.toDataURL("image/png");
        staticCanvas.dispose();
        const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (c) => c.charCodeAt(0));
        const pngImg = await out.embedPng(bytes);

        // Now stamp onto page. The page has ORIGINAL dimensions in pw/ph and a
        // rotation flag applied via setRotation. pdf-lib coordinates are pre-rotation.
        // So we need to draw the overlay in the ORIGINAL orientation.
        // Our overlay was authored in rotated CSS space (cssW × cssH). We need to
        // rotate the overlay image opposite to page rotation so it lands correctly.
        if (!p.rotation) {
          page.drawImage(pngImg, { x: 0, y: 0, width: pw, height: ph });
        } else {
          // pw/ph are original page size (rotation is metadata). Draw the overlay
          // at original orientation with a rotation transform.
          const rot = p.rotation;
          if (rot === 90) {
            page.drawImage(pngImg, { x: pw, y: 0, width: ph, height: pw, rotate: degrees(90) });
          } else if (rot === 180) {
            page.drawImage(pngImg, { x: pw, y: ph, width: pw, height: ph, rotate: degrees(180) });
          } else if (rot === 270) {
            page.drawImage(pngImg, { x: 0, y: ph, width: ph, height: pw, rotate: degrees(270) });
          }
        }
      }

      const bytes = await out.save();
      const name = file.name.replace(/\.pdf$/i, "") + "-edited.pdf";
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), name);
      setStatus({ kind: "success", message: `Exported ${name}.` });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Export failed. " + (err instanceof Error ? err.message : String(err)) });
    }
  };

  const isTextActive = activeObj && (activeObj.type === "i-text" || activeObj.type === "text" || activeObj.type === "textbox");

  // -------------- Render --------------

  if (!file || pages.length === 0) {
    return (
      <ToolShell
        tool={tool}
        status={status}
        howItWorks={[
          "Drop a PDF — every page renders in your browser, nothing is uploaded.",
          "Add text, images, highlights, shapes, and drawings. Everything is draggable, resizable, and editable.",
          "Export a real PDF with your edits baked in. No watermark, no signup, unlimited files.",
        ]}
      >
        <Dropzone accept="application/pdf,.pdf" multiple={false} onFiles={onFiles} hint="One PDF file — 100MB+ works" />
        <p className="rounded-lg border border-signal/40 bg-signal/5 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-signal">
          Free forever. Same features iLovePDF & Smallpdf paywall — running entirely on your machine.
        </p>
      </ToolShell>
    );
  }

  const modeBtn = (m: ToolMode, label: string, Icon: typeof Type) => (
    <button
      key={m}
      type="button"
      onClick={() => setMode(m)}
      aria-pressed={mode === m}
      title={label}
      className={
        "inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 font-mono text-[11px] uppercase tracking-wider transition " +
        (mode === m ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")
      }
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  const cur = pages[current];
  const canvasCssW = cur ? (cur.rotation === 90 || cur.rotation === 270 ? cur.heightPt : cur.widthPt) * renderScale : 0;
  const canvasCssH = cur ? (cur.rotation === 90 || cur.rotation === 270 ? cur.widthPt : cur.heightPt) * renderScale : 0;

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a PDF — every page renders in your browser, nothing is uploaded.",
        "Add text, images, highlights, shapes, and drawings. Everything is draggable, resizable, and editable.",
        "Export a real PDF with your edits baked in. No watermark, no signup, unlimited files.",
      ]}
    >
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-2">
        {modeBtn("select", "Select", MousePointer2)}
        {modeBtn("text", "Text", Type)}
        {modeBtn("draw", "Draw", PenLine)}
        {modeBtn("highlight", "Highlight", Highlighter)}
        {modeBtn("whiteout", "Whiteout", Eraser)}
        {modeBtn("note", "Note", StickyNote)}
        {modeBtn("rect", "Rect", Square)}
        {modeBtn("ellipse", "Ellipse", CircleIcon)}
        {modeBtn("line", "Line", Minus)}
        {modeBtn("image", "Image", ImageIcon)}
        <button type="button" onClick={() => setSigOpen(true)} title="Signature" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 font-mono text-[11px] uppercase tracking-wider text-graphite hover:border-ink/60">
          <Signature className="h-3.5 w-3.5" /><span className="hidden md:inline">Signature</span>
        </button>
        <span aria-hidden className="mx-1 h-6 w-px bg-line" />
        <button type="button" onClick={doUndo} title="Undo (Ctrl+Z)" className="inline-flex h-9 items-center rounded-md border border-line bg-white px-2 text-graphite hover:border-ink/60">
          <Undo2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={doRedo} title="Redo (Ctrl+Shift+Z)" className="inline-flex h-9 items-center rounded-md border border-line bg-white px-2 text-graphite hover:border-ink/60">
          <Redo2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={deleteActive} title="Delete selected" className="inline-flex h-9 items-center rounded-md border border-line bg-white px-2 text-graphite hover:border-ink/60 disabled:opacity-40" disabled={!activeObj}>
          <Trash2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={bringForward} title="Bring forward" className="inline-flex h-9 items-center rounded-md border border-line bg-white px-2 text-graphite hover:border-ink/60 disabled:opacity-40" disabled={!activeObj}>
          <ArrowUp className="h-4 w-4" />
        </button>
        <button type="button" onClick={sendBackward} title="Send backward" className="inline-flex h-9 items-center rounded-md border border-line bg-white px-2 text-graphite hover:border-ink/60 disabled:opacity-40" disabled={!activeObj}>
          <ArrowDown className="h-4 w-4" />
        </button>
        <span aria-hidden className="mx-1 h-6 w-px bg-line" />
        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setColor(c);
                if (activeObj) {
                  const patch: Record<string, unknown> = {};
                  if (isTextActive) patch.fill = c;
                  else if (activeObj.stroke !== undefined) patch.stroke = c;
                  if (Object.keys(patch).length) patchActive(patch);
                }
              }}
              aria-label={"Color " + c}
              className={"h-6 w-6 rounded-full border-2 transition " + (color === c ? "border-ink" : "border-white ring-1 ring-line")}
              style={{ background: c }}
            />
          ))}
        </div>
        <label className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-graphite">
          Stroke
          <input
            type="number" min={1} max={40} value={strokeWidth}
            onChange={(e) => {
              const v = Math.max(1, Math.min(40, Number(e.target.value) || 2));
              setStrokeWidth(v);
              if (activeObj && activeObj.stroke !== undefined) patchActive({ strokeWidth: v });
            }}
            className="h-8 w-14 rounded-md border border-line bg-white px-1 font-mono text-xs"
          />
        </label>
        <span className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => setShowGrid((v) => !v)} aria-pressed={showGrid} title="Toggle grid"
            className={"inline-flex h-9 items-center gap-1 rounded-md border px-2 font-mono text-[11px] uppercase tracking-wider " + (showGrid ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")}>
            <Grid3x3 className="h-3.5 w-3.5" />
          </button>
          <label className={"inline-flex h-9 items-center gap-1 rounded-md border px-2 font-mono text-[11px] uppercase tracking-wider cursor-pointer " + (snapToGrid ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")}>
            <input type="checkbox" className="sr-only" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} />
            Snap
          </label>
          <button type="button" onClick={() => setRenderScale((s) => Math.max(0.4, +(s - 0.2).toFixed(2)))} className="inline-flex h-9 items-center rounded-md border border-line bg-white px-2 font-mono text-xs text-graphite">−</button>
          <span className="font-mono text-xs text-graphite">{Math.round(renderScale * 100)}%</span>
          <button type="button" onClick={() => setRenderScale((s) => Math.min(3, +(s + 0.2).toFixed(2)))} className="inline-flex h-9 items-center rounded-md border border-line bg-white px-2 font-mono text-xs text-graphite">+</button>
        </span>
      </div>

      {/* Page tools + bulk actions */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-graphite">Pages</span>
        <button type="button" onClick={() => addBlankPage(currentRef.current)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 font-mono text-[11px] uppercase tracking-wider text-graphite hover:border-ink/60">
          <FilePlus2 className="h-3.5 w-3.5" /> Add blank
        </button>
        <button type="button" onClick={() => {
          const input = document.createElement("input");
          input.type = "file"; input.accept = "application/pdf,.pdf";
          input.onchange = () => { const f = input.files?.[0]; if (f) insertFromPdf(f); };
          input.click();
        }} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 font-mono text-[11px] uppercase tracking-wider text-graphite hover:border-ink/60">
          <FileInput className="h-3.5 w-3.5" /> Insert PDF
        </button>
        <button type="button" onClick={extractCurrentPage}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 font-mono text-[11px] uppercase tracking-wider text-graphite hover:border-ink/60">
          <Download className="h-3.5 w-3.5" /> Extract page
        </button>
        <span aria-hidden className="mx-1 h-6 w-px bg-line" />
        <button type="button" onClick={() => setWmOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 font-mono text-[11px] uppercase tracking-wider text-graphite hover:border-ink/60">
          <Stamp className="h-3.5 w-3.5" /> Watermark all
        </button>
        <button type="button" onClick={() => setPageNumOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 font-mono text-[11px] uppercase tracking-wider text-graphite hover:border-ink/60">
          <ListOrdered className="h-3.5 w-3.5" /> Page numbers
        </button>
      </div>

      {/* Text-specific properties panel */}
      {isTextActive && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-signal">Text</span>
          <select
            value={activeObj.fontFamily ?? "Helvetica"}
            onChange={(e) => patchActive({ fontFamily: e.target.value })}
            className="h-8 rounded-md border border-line bg-white px-2 font-mono text-xs"
          >
            {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <label className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-graphite">
            Size
            <input
              type="number" min={6} max={200}
              value={Math.round(activeObj.fontSize ?? fontSize)}
              onChange={(e) => {
                const v = Math.max(6, Math.min(200, Number(e.target.value) || fontSize));
                setFontSize(v);
                patchActive({ fontSize: v });
              }}
              className="h-8 w-16 rounded-md border border-line bg-white px-1 font-mono text-xs"
            />
          </label>
          <button type="button" title="Bold"
            aria-pressed={activeObj.fontWeight === "bold" || activeObj.fontWeight === 700}
            onClick={() => patchActive({ fontWeight: (activeObj.fontWeight === "bold" || activeObj.fontWeight === 700) ? "normal" : "bold" })}
            className={"inline-flex h-8 w-8 items-center justify-center rounded-md border " + ((activeObj.fontWeight === "bold" || activeObj.fontWeight === 700) ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite")}>
            <Bold className="h-4 w-4" />
          </button>
          <button type="button" title="Italic"
            aria-pressed={activeObj.fontStyle === "italic"}
            onClick={() => patchActive({ fontStyle: activeObj.fontStyle === "italic" ? "normal" : "italic" })}
            className={"inline-flex h-8 w-8 items-center justify-center rounded-md border " + (activeObj.fontStyle === "italic" ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite")}>
            <Italic className="h-4 w-4" />
          </button>
          <button type="button" title="Underline"
            aria-pressed={!!activeObj.underline}
            onClick={() => patchActive({ underline: !activeObj.underline })}
            className={"inline-flex h-8 w-8 items-center justify-center rounded-md border " + (activeObj.underline ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite")}>
            <Underline className="h-4 w-4" />
          </button>
          <div className="ml-1 flex items-center rounded-md border border-line bg-white">
            {(["left","center","right"] as const).map((a) => {
              const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
              return (
                <button key={a} type="button" title={"Align " + a}
                  aria-pressed={activeObj.textAlign === a}
                  onClick={() => patchActive({ textAlign: a })}
                  className={"inline-flex h-8 w-8 items-center justify-center " + (activeObj.textAlign === a ? "bg-ink text-paper" : "text-graphite")}>
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-graphite">
            Color
            <input type="color" value={activeObj.fill ?? "#111111"}
              onChange={(e) => patchActive({ fill: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded-md border border-line bg-white p-0.5"
            />
          </label>
          <label className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-graphite">
            Line-h
            <input type="number" min={0.5} max={4} step={0.1}
              value={Number((activeObj.lineHeight ?? 1.16).toFixed(2))}
              onChange={(e) => patchActive({ lineHeight: Math.max(0.5, Math.min(4, Number(e.target.value) || 1.16)) })}
              className="h-8 w-14 rounded-md border border-line bg-white px-1 font-mono text-xs" />
          </label>
          <label className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-graphite">
            Spacing
            <input type="number" min={-200} max={800} step={10}
              value={Math.round(activeObj.charSpacing ?? 0)}
              onChange={(e) => patchActive({ charSpacing: Math.max(-200, Math.min(800, Number(e.target.value) || 0)) })}
              className="h-8 w-16 rounded-md border border-line bg-white px-1 font-mono text-xs" />
          </label>
          <label className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-graphite">
            BG
            <input type="color" value={activeObj.backgroundColor || "#ffffff"}
              onChange={(e) => patchActive({ backgroundColor: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded-md border border-line bg-white p-0.5" />
            <button type="button" onClick={() => patchActive({ backgroundColor: "" })} title="Clear bg"
              className="inline-flex h-8 w-6 items-center justify-center rounded border border-line bg-white text-graphite">×</button>
          </label>
          <label className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-graphite">
            <input type="checkbox" checked={!!activeObj.shadow}
              onChange={async (e) => {
                const fabric = fabricModRef.current ?? (await import("fabric"));
                patchActive({ shadow: e.target.checked ? new fabric.Shadow({ color: "rgba(0,0,0,0.35)", blur: 4, offsetX: 2, offsetY: 2 }) : null });
              }} />
            Shadow
          </label>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        {/* Thumbnails */}
        <aside className="max-h-[720px] overflow-y-auto rounded-xl border border-line bg-paper-2/50 p-2">
          <ul className="space-y-2">
            {pages.map((p, i) => (
              <li key={i}>
                <div className={"group rounded-lg border-2 bg-white p-1 transition " + (i === current ? "border-signal" : "border-line hover:border-ink/60")}>
                  <button type="button" onClick={() => goToPage(i)} className="block w-full" aria-label={`Go to page ${i + 1}`}>
                    <img src={p.thumb} alt={`Page ${i + 1}`} className="mx-auto max-h-32 w-auto" style={{ transform: `rotate(${p.rotation}deg)` }} />
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-graphite">Page {i + 1} / {pages.length}</p>
                  </button>
                  <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                    <button type="button" title="Move up" onClick={() => movePage(i, -1)} className="rounded p-1 hover:bg-paper-2"><ChevronUp className="h-3 w-3" /></button>
                    <button type="button" title="Move down" onClick={() => movePage(i, 1)} className="rounded p-1 hover:bg-paper-2"><ChevronDown className="h-3 w-3" /></button>
                    <button type="button" title="Rotate 90°" onClick={() => rotatePage(i)} className="rounded p-1 hover:bg-paper-2"><RotateCw className="h-3 w-3" /></button>
                    <button type="button" title="Duplicate" onClick={() => duplicatePage(i)} className="rounded p-1 hover:bg-paper-2"><CopyIcon className="h-3 w-3" /></button>
                    <button type="button" title="Delete" onClick={() => deletePage(i)} className="rounded p-1 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Canvas */}
        <div className="min-w-0 overflow-auto rounded-xl border border-line bg-paper-2/40 p-4">
          <div className="relative mx-auto bg-white shadow" style={{ width: canvasCssW, height: canvasCssH }}>
            <canvas ref={bgCanvasRef} style={{ width: canvasCssW, height: canvasCssH, display: "block", position: "absolute", inset: 0, pointerEvents: "none" }} />
            <canvas ref={fabricElRef} style={{ position: "absolute", inset: 0 }} />
            {showGrid && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    `linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)`,
                  backgroundSize: `${gridSize}px ${gridSize}px`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {sigOpen && (
        <SignatureModal
          onClose={() => setSigOpen(false)}
          onPlace={(dataUrl) => { setSigOpen(false); placeSignatureImage(dataUrl); }}
        />
      )}
      {wmOpen && (
        <WatermarkModal
          onClose={() => setWmOpen(false)}
          onApply={(opts) => { setWmOpen(false); addWatermarkToAll(opts); }}
        />
      )}
      {pageNumOpen && (
        <PageNumberModal
          onClose={() => setPageNumOpen(false)}
          onApply={(opts) => { setPageNumOpen(false); addPageNumbers(opts); }}
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <PrimaryButton onClick={doExport} disabled={status.kind === "working"}>
          <Download className="mr-2 h-4 w-4" /> Export edited PDF
        </PrimaryButton>
        <button
          type="button"
          onClick={() => {
            if (fabricRef.current) { try { fabricRef.current.dispose(); } catch { /* noop */ } fabricRef.current = null; }
            setFile(null); setPages([]); setActiveObj(null);
            pageJsonRef.current = new Map();
            undoStack.current = []; redoStack.current = [];
          }}
          className="inline-flex h-11 items-center rounded-md border border-ink bg-white px-5 font-mono text-sm font-bold uppercase tracking-wider text-ink hover:bg-ink hover:text-paper"
        >
          Load a different PDF
        </button>
        <p className="ml-auto max-w-md font-mono text-[11px] uppercase tracking-wider text-graphite">
          Click <b>Text</b> then click the page to add editable text. Drag corners to resize, drag body to move. Delete key removes selection.
        </p>
      </div>
    </ToolShell>
  );
}

// ---------- Modals ----------

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-line bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-ink">{title}</h3>
          <button type="button" onClick={onClose} className="rounded p-1 text-graphite hover:bg-paper-2"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SignatureModal({ onClose, onPlace }: { onClose: () => void; onPlace: (dataUrl: string) => void }) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typed, setTyped] = useState("Signature");
  const [font, setFont] = useState("Georgia");
  const [color, setColor] = useState("#111111");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
  }, [mode]);

  const pos = (e: RPE<HTMLCanvasElement>) => {
    const r = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const c = canvasRef.current!;
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  };

  const startDraw = (e: RPE<HTMLCanvasElement>) => {
    drawingRef.current = true;
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const moveDraw = (e: RPE<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const endDraw = () => { drawingRef.current = false; };

  const clear = () => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
  };

  const place = () => {
    if (mode === "draw") {
      const c = canvasRef.current!;
      // Convert white to transparent for cleaner overlay
      const tmp = document.createElement("canvas");
      tmp.width = c.width; tmp.height = c.height;
      const tctx = tmp.getContext("2d")!;
      tctx.drawImage(c, 0, 0);
      const img = tctx.getImageData(0, 0, tmp.width, tmp.height);
      for (let i = 0; i < img.data.length; i += 4) {
        if (img.data[i] > 240 && img.data[i + 1] > 240 && img.data[i + 2] > 240) img.data[i + 3] = 0;
      }
      tctx.putImageData(img, 0, 0);
      onPlace(tmp.toDataURL("image/png"));
    } else {
      const c = document.createElement("canvas");
      c.width = 600; c.height = 180;
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = color;
      ctx.font = `italic 72px ${font}`;
      ctx.textBaseline = "middle";
      ctx.fillText(typed, 20, c.height / 2);
      onPlace(c.toDataURL("image/png"));
    }
  };

  return (
    <ModalShell title="Add signature" onClose={onClose}>
      <div className="mb-3 inline-flex overflow-hidden rounded-md border border-line">
        <button type="button" onClick={() => setMode("draw")} className={"px-3 py-1.5 font-mono text-xs uppercase " + (mode === "draw" ? "bg-ink text-paper" : "bg-white text-graphite")}>Draw</button>
        <button type="button" onClick={() => setMode("type")} className={"px-3 py-1.5 font-mono text-xs uppercase " + (mode === "type" ? "bg-ink text-paper" : "bg-white text-graphite")}>Type</button>
      </div>
      {mode === "draw" ? (
        <>
          <canvas
            ref={canvasRef}
            width={600} height={200}
            className="w-full touch-none rounded-md border border-line bg-white"
            style={{ aspectRatio: "3 / 1" }}
            onPointerDown={startDraw}
            onPointerMove={moveDraw}
            onPointerUp={endDraw}
            onPointerLeave={endDraw}
          />
          <div className="mt-2 flex items-center gap-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-10 rounded border border-line" />
            <button type="button" onClick={clear} className="rounded-md border border-line px-3 py-1 font-mono text-xs uppercase text-graphite hover:border-ink/60">Clear</button>
          </div>
        </>
      ) : (
        <>
          <input value={typed} onChange={(e) => setTyped(e.target.value)} className="w-full rounded-md border border-line px-3 py-2 font-mono text-sm" />
          <div className="mt-2 flex items-center gap-2">
            <select value={font} onChange={(e) => setFont(e.target.value)} className="rounded-md border border-line px-2 py-1 font-mono text-xs">
              {["Georgia", "Times New Roman", "Helvetica", "Courier New", "Arial", "Verdana"].map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-10 rounded border border-line" />
          </div>
          <div className="mt-3 rounded-md border border-line bg-white p-3 text-center" style={{ fontFamily: font, fontStyle: "italic", fontSize: 42, color }}>{typed || "Signature"}</div>
        </>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-md border border-line bg-white px-4 py-2 font-mono text-xs uppercase text-graphite hover:border-ink/60">Cancel</button>
        <button type="button" onClick={place} className="rounded-md bg-ink px-4 py-2 font-mono text-xs uppercase text-paper hover:bg-ink/90">Place on page</button>
      </div>
    </ModalShell>
  );
}

function WatermarkModal({ onClose, onApply }: { onClose: () => void; onApply: (opts: { text: string; color: string; opacity: number; size: number; angle: number }) => void }) {
  const [text, setText] = useState("CONFIDENTIAL");
  const [color, setColor] = useState("#e11d48");
  const [opacity, setOpacity] = useState(0.3);
  const [size, setSize] = useState(72);
  const [angle, setAngle] = useState(-30);
  return (
    <ModalShell title="Watermark all pages" onClose={onClose}>
      <div className="space-y-3">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-wider text-graphite">Text</span>
          <input value={text} onChange={(e) => setText(e.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2 font-mono text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-graphite">Color</span>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-line" />
          </label>
          <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-graphite">Size</span>
            <input type="number" min={12} max={300} value={size} onChange={(e) => setSize(Number(e.target.value) || 72)} className="mt-1 h-9 w-full rounded-md border border-line px-2 font-mono text-sm" />
          </label>
          <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-graphite">Opacity {Math.round(opacity * 100)}%</span>
            <input type="range" min={0.05} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="mt-1 w-full" />
          </label>
          <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-graphite">Angle {angle}°</span>
            <input type="range" min={-90} max={90} step={5} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="mt-1 w-full" />
          </label>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-md border border-line bg-white px-4 py-2 font-mono text-xs uppercase text-graphite">Cancel</button>
        <button type="button" onClick={() => onApply({ text, color, opacity, size, angle })} className="rounded-md bg-ink px-4 py-2 font-mono text-xs uppercase text-paper">Apply to all pages</button>
      </div>
    </ModalShell>
  );
}

function PageNumberModal({ onClose, onApply }: { onClose: () => void; onApply: (opts: { position: "bl" | "br" | "bc" | "tl" | "tr" | "tc"; start: number; format: string; size: number; color: string }) => void }) {
  const [position, setPosition] = useState<"bl" | "br" | "bc" | "tl" | "tr" | "tc">("bc");
  const [start, setStart] = useState(1);
  const [format, setFormat] = useState("{n} / {total}");
  const [size, setSize] = useState(14);
  const [color, setColor] = useState("#111111");
  const positions: { k: typeof position; label: string }[] = [
    { k: "tl", label: "Top-left" }, { k: "tc", label: "Top-center" }, { k: "tr", label: "Top-right" },
    { k: "bl", label: "Bottom-left" }, { k: "bc", label: "Bottom-center" }, { k: "br", label: "Bottom-right" },
  ];
  return (
    <ModalShell title="Add page numbers" onClose={onClose}>
      <div className="space-y-3">
        <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-graphite">Position</span>
          <select value={position} onChange={(e) => setPosition(e.target.value as typeof position)} className="mt-1 h-9 w-full rounded-md border border-line px-2 font-mono text-sm">
            {positions.map((p) => <option key={p.k} value={p.k}>{p.label}</option>)}
          </select>
        </label>
        <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-graphite">Format ({"{n}"} = number, {"{total}"} = total)</span>
          <input value={format} onChange={(e) => setFormat(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-line px-2 font-mono text-sm" />
        </label>
        <div className="grid grid-cols-3 gap-2">
          <label className="block"><span className="font-mono text-[11px] uppercase text-graphite">Start</span>
            <input type="number" min={1} value={start} onChange={(e) => setStart(Number(e.target.value) || 1)} className="mt-1 h-9 w-full rounded-md border border-line px-2 font-mono text-sm" />
          </label>
          <label className="block"><span className="font-mono text-[11px] uppercase text-graphite">Size</span>
            <input type="number" min={6} max={72} value={size} onChange={(e) => setSize(Number(e.target.value) || 14)} className="mt-1 h-9 w-full rounded-md border border-line px-2 font-mono text-sm" />
          </label>
          <label className="block"><span className="font-mono text-[11px] uppercase text-graphite">Color</span>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-line" />
          </label>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-md border border-line bg-white px-4 py-2 font-mono text-xs uppercase text-graphite">Cancel</button>
        <button type="button" onClick={() => onApply({ position, start, format, size, color })} className="rounded-md bg-ink px-4 py-2 font-mono text-xs uppercase text-paper">Apply</button>
      </div>
    </ModalShell>
  );
}
