import { useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { Dropzone } from "./Dropzone";
import { tools } from "@/lib/tools";
import { downloadBlob, loadImage, readFileAsDataURL } from "@/lib/tool-utils";

const SIZES = [16, 32, 48, 180, 192, 512];

export function FaviconGeneratorTool() {
  const tool = tools.find((t) => t.slug === "favicon-generator")!;
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  async function build() {
    if (!file) return;
    setStatus({ kind: "working", message: "Generating favicon pack…" });
    try {
      const img = await loadImage(await readFileAsDataURL(file));
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const s of SIZES) {
        const c = document.createElement("canvas");
        c.width = s; c.height = s;
        const ctx = c.getContext("2d")!;
        // cover crop
        const src = Math.min(img.width, img.height);
        const sx = (img.width - src) / 2, sy = (img.height - src) / 2;
        ctx.drawImage(img, sx, sy, src, src, 0, 0, s, s);
        const blob: Blob = await new Promise((res) => c.toBlob((b) => res(b!), "image/png"));
        const name = s === 180 ? "apple-touch-icon.png" : `favicon-${s}x${s}.png`;
        zip.file(name, blob);
      }
      // Simple ICO = PNG renamed (browsers accept PNG-in-ICO for favicon)
      const c16 = document.createElement("canvas");
      c16.width = 32; c16.height = 32;
      c16.getContext("2d")!.drawImage(img, 0, 0, 32, 32);
      const icoBlob: Blob = await new Promise((res) => c16.toBlob((b) => res(b!), "image/png"));
      zip.file("favicon.ico", icoBlob);
      zip.file("site.webmanifest", JSON.stringify({
        name: "Your App", short_name: "App",
        icons: [
          { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        theme_color: "#ffffff", background_color: "#ffffff", display: "standalone",
      }, null, 2));
      zip.file("README.txt",
        `Drop these files at the root of your site.\n\nAdd to <head>:\n<link rel="icon" href="/favicon.ico">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">\n`);
      const out = await zip.generateAsync({ type: "blob" });
      downloadBlob(out, "favicon-pack.zip");
      setStatus({ kind: "success", message: "Favicon pack generated." });
    } catch (e: any) {
      setStatus({ kind: "error", message: e?.message ?? "Failed." });
    }
  }

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Upload a square logo (PNG, JPG or SVG-exported PNG). At least 512×512 recommended.",
        "The tool renders 16, 32, 48, 180, 192 and 512 px PNGs plus an ICO and a webmanifest.",
        "Download the ZIP, drop the files at your site root, and paste the provided <link> tags into <head>.",
      ]}>
      <Dropzone accept="image/*" multiple={false} onFiles={(fs) => setFile(fs[0])} />
      {file && <PrimaryButton onClick={build} loading={status.kind === "working"}>Generate favicon pack</PrimaryButton>}
    </ToolShell>
  );
}
