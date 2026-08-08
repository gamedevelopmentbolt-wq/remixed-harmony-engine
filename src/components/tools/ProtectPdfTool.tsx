import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

type Mode = "protect" | "unlock";

export function ProtectPdfTool() {
  const tool = tools.find((t) => t.slug === "protect-pdf")!;
  const [mode, setMode] = useState<Mode>("protect");
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFiles = (fs: File[]) => {
    const f = fs.find((x) => x.type === "application/pdf" || /\.pdf$/i.test(x.name));
    if (!f) return setStatus({ kind: "error", message: "Please choose a PDF file." });
    setFile(f);
    setStatus({ kind: "idle" });
  };

  const protect = async () => {
    if (!file || !password) {
      setStatus({ kind: "error", message: "Choose a PDF and enter a password." });
      return;
    }
    setStatus({ kind: "working", message: "Encrypting PDF…", progress: 30 });
    const { PDFDocument } = await import("@cantoo/pdf-lib");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const outBytes = await pdf.save({
      userPassword: password,
      ownerPassword: password,
      permissions: { printing: "highResolution", modifying: false, copying: true },
    } as never);
    downloadBlob(new Blob([outBytes as BlobPart], { type: "application/pdf" }), file.name.replace(/\.pdf$/i, "") + "-protected.pdf");
    setStatus({ kind: "success", message: "Encrypted PDF downloaded." });
  };

  const unlock = async () => {
    if (!file || !password) {
      setStatus({ kind: "error", message: "Choose a PDF and enter its password." });
      return;
    }
    setStatus({ kind: "working", message: "Verifying password…", progress: 30 });
    const { PDFDocument } = await import("@cantoo/pdf-lib");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await PDFDocument.load(bytes, { password } as never);
    setStatus({ kind: "working", message: "Removing encryption…", progress: 70 });
    const outBytes = await pdf.save();
    downloadBlob(new Blob([outBytes as BlobPart], { type: "application/pdf" }), file.name.replace(/\.pdf$/i, "") + "-unlocked.pdf");
    setStatus({ kind: "success", message: "Unlocked PDF downloaded." });
  };

  const run = async () => {
    try {
      if (mode === "protect") await protect();
      else await unlock();
    } catch (err) {
      console.error(err);
      setStatus({
        kind: "error",
        message: mode === "unlock" ? "Could not unlock — the password may be wrong." : "Could not encrypt this PDF.",
      });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Pick a mode — add a password or remove a password you already know.",
        "Encryption runs entirely in your browser. Passwords never leave your device.",
        "Download the newly protected or unlocked PDF.",
      ]}
    >
      <div className="flex flex-wrap gap-2">
        {(["protect", "unlock"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={
              "inline-flex h-9 items-center rounded-full border px-4 font-mono text-[11px] uppercase tracking-wider transition " +
              (mode === m
                ? "border-ink bg-ink text-paper"
                : "border-line bg-white text-graphite/80 hover:border-ink/60 hover:text-ink")
            }
          >
            {m === "protect" ? "Add password" : "Remove password"}
          </button>
        ))}
      </div>

      {!file ? (
        <Dropzone accept="application/pdf,.pdf" multiple={false} onFiles={onFiles} hint="One PDF file" />
      ) : (
        <FileList files={[file]} onRemove={() => setFile(null)} />
      )}

      <label className="block">
        <span className="mb-1 block font-mono text-xs uppercase tracking-wider text-ink">
          {mode === "protect" ? "Choose a password" : "Current password"}
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="h-11 w-full rounded-md border border-line bg-white px-3 font-mono text-sm text-ink focus:border-ink focus:outline-none"
        />
      </label>

      <PrimaryButton onClick={run} disabled={!file || !password || status.kind === "working"}>
        {mode === "protect" ? "Encrypt PDF" : "Unlock PDF"}
      </PrimaryButton>
    </ToolShell>
  );
}
