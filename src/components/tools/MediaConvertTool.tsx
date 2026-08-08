import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

const TARGETS = [
  { value: "mp4", label: "MP4 (H.264 + AAC)", ext: "mp4", kind: "video" as const },
  { value: "webm", label: "WebM (VP9 + Opus)", ext: "webm", kind: "video" as const },
  { value: "gif", label: "GIF (animated)", ext: "gif", kind: "video" as const },
  { value: "mp3", label: "MP3", ext: "mp3", kind: "audio" as const },
  { value: "wav", label: "WAV", ext: "wav", kind: "audio" as const },
  { value: "ogg", label: "OGG (Vorbis)", ext: "ogg", kind: "audio" as const },
];

const ARGS: Record<string, (input: string, output: string) => string[]> = {
  mp4: (i, o) => ["-i", i, "-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac", "-b:a", "128k", o],
  webm: (i, o) => ["-i", i, "-c:v", "libvpx-vp9", "-b:v", "1M", "-c:a", "libopus", "-b:a", "96k", o],
  gif: (i, o) => ["-i", i, "-vf", "fps=12,scale=480:-1:flags=lanczos", o],
  mp3: (i, o) => ["-i", i, "-vn", "-c:a", "libmp3lame", "-b:a", "192k", o],
  wav: (i, o) => ["-i", i, "-vn", "-c:a", "pcm_s16le", o],
  ogg: (i, o) => ["-i", i, "-vn", "-c:a", "libvorbis", "-q:a", "5", o],
};

export function MediaConvertTool() {
  const tool = tools.find((t) => t.slug === "media-convert")!;
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState("mp3");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFiles = (fs: File[]) => {
    const f = fs.find((x) => x.type.startsWith("audio/") || x.type.startsWith("video/"));
    if (!f) return setStatus({ kind: "error", message: "Please choose an audio or video file." });
    setFile(f);
    setStatus({ kind: "idle" });
  };

  const run = async () => {
    if (!file) return;
    try {
      setStatus({ kind: "working", message: "Loading ffmpeg.wasm (first run downloads ~30 MB)…", progress: 3 });
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile, toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
      ffmpeg.on("progress", ({ progress }: { progress: number }) => {
        setStatus({ kind: "working", message: "Converting…", progress: 20 + Math.min(1, Math.max(0, progress)) * 75 });
      });
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      const ext = file.name.split(".").pop() || "bin";
      const input = `input.${ext}`;
      const out = TARGETS.find((t) => t.value === target)!;
      const outputName = `output.${out.ext}`;
      await ffmpeg.writeFile(input, await fetchFile(file));
      setStatus({ kind: "working", message: "Converting…", progress: 18 });
      await ffmpeg.exec(ARGS[target](input, outputName));
      const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
      const mime =
        out.ext === "mp4" ? "video/mp4" :
        out.ext === "webm" ? "video/webm" :
        out.ext === "gif" ? "image/gif" :
        out.ext === "mp3" ? "audio/mpeg" :
        out.ext === "wav" ? "audio/wav" :
        "audio/ogg";
      const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
      downloadBlob(new Blob([arrayBuffer], { type: mime }), file.name.replace(/\.[^.]+$/, "") + "." + out.ext);
      setStatus({ kind: "success", message: `Converted → .${out.ext} downloaded.` });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Conversion failed. Try a smaller file or a different target format." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop an audio or video file. Common formats like MP4, MOV, WebM, MP3 and WAV work.",
        "ffmpeg.wasm runs the conversion in your browser — no files uploaded to a server.",
        "Progress updates as it works, then the converted file downloads.",
      ]}
    >
      <div className="rounded-lg border border-signal/40 bg-signal/5 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-signal">
        First run downloads ffmpeg (~30 MB) over the network. Big files can take minutes — keep the tab open.
      </div>
      {!file ? (
        <Dropzone accept="audio/*,video/*" multiple={false} onFiles={onFiles} hint="One audio or video file" />
      ) : (
        <FileList files={[file]} onRemove={() => setFile(null)} />
      )}
      <fieldset className="space-y-2">
        <legend className="font-mono text-xs uppercase tracking-wider text-ink">Convert to</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {TARGETS.map((t) => (
            <label
              key={t.value}
              className={
                "cursor-pointer rounded-xl border p-3 text-sm transition " +
                (target === t.value ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")
              }
            >
              <input type="radio" name="target" value={t.value} checked={target === t.value} onChange={() => setTarget(t.value)} className="sr-only" />
              <p className="font-mono text-xs uppercase tracking-wider">.{t.ext}</p>
              <p className={"mt-1 text-xs " + (target === t.value ? "text-paper/80" : "text-graphite/70")}>{t.label}</p>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={run} disabled={!file || status.kind === "working"}>
          Convert
        </PrimaryButton>
        {file && (
          <GhostButton
            type="button"
            onClick={() => {
              setFile(null);
              setStatus({ kind: "idle" });
            }}
          >
            Reset
          </GhostButton>
        )}
      </div>
    </ToolShell>
  );
}
