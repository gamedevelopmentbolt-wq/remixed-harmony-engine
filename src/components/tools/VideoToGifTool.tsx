import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

export function VideoToGifTool() {
  const tool = tools.find((t) => t.slug === "video-to-gif")!;
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(0);
  const [duration, setDuration] = useState(4);
  const [fps, setFps] = useState(12);
  const [width, setWidth] = useState(480);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFiles = (fs: File[]) => {
    const f = fs.find((x) => x.type.startsWith("video/"));
    if (!f) return setStatus({ kind: "error", message: "Please choose a video file." });
    setFile(f);
    setStatus({ kind: "idle" });
  };

  const run = async () => {
    if (!file) return;
    try {
      setStatus({
        kind: "working",
        message: "Loading ffmpeg.wasm (first run downloads ~30 MB)…",
        progress: 3,
      });
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile, toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
      ffmpeg.on("progress", ({ progress }: { progress: number }) => {
        setStatus({
          kind: "working",
          message: "Rendering GIF…",
          progress: 25 + Math.min(1, Math.max(0, progress)) * 70,
        });
      });
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      const ext = file.name.split(".").pop() || "mp4";
      const input = `input.${ext}`;
      await ffmpeg.writeFile(input, await fetchFile(file));

      // High-quality GIF: two-pass with palette.
      const vf = `fps=${fps},scale=${width}:-1:flags=lanczos`;
      setStatus({ kind: "working", message: "Building color palette…", progress: 15 });
      await ffmpeg.exec([
        "-ss", String(start),
        "-t", String(duration),
        "-i", input,
        "-vf", `${vf},palettegen=stats_mode=diff`,
        "palette.png",
      ]);
      setStatus({ kind: "working", message: "Rendering GIF…", progress: 25 });
      await ffmpeg.exec([
        "-ss", String(start),
        "-t", String(duration),
        "-i", input,
        "-i", "palette.png",
        "-lavfi", `${vf} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5`,
        "output.gif",
      ]);

      const data = (await ffmpeg.readFile("output.gif")) as Uint8Array;
      const arrayBuffer = data.buffer.slice(
        data.byteOffset,
        data.byteOffset + data.byteLength,
      ) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: "image/gif" });
      downloadBlob(blob, file.name.replace(/\.[^.]+$/, "") + ".gif");
      setStatus({
        kind: "success",
        message: `GIF ready — ${(blob.size / 1024).toFixed(0)} KB, ${fps} fps, ${width}px wide.`,
      });
    } catch (err) {
      console.error(err);
      setStatus({
        kind: "error",
        message: "GIF render failed. Try a shorter clip or a smaller width.",
      });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a video (MP4, MOV, WebM). ffmpeg.wasm runs in your browser — nothing is uploaded.",
        "Pick a start time, duration, frame rate and output width.",
        "We build an optimized palette then render the GIF, and it downloads when it's ready.",
      ]}
    >
      <div className="rounded-lg border border-signal/40 bg-signal/5 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-signal">
        First run downloads ffmpeg (~30 MB). Keep clips short — a 4-second, 480px GIF is a good starting point.
      </div>
      {!file ? (
        <Dropzone accept="video/*" multiple={false} onFiles={onFiles} hint="One short video clip" />
      ) : (
        <FileList files={[file]} onRemove={() => setFile(null)} />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Start (seconds)</span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={start}
            onChange={(e) => setStart(Math.max(0, Number(e.target.value)))}
            className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Duration (seconds)</span>
          <input
            type="number"
            min={0.5}
            max={30}
            step={0.5}
            value={duration}
            onChange={(e) => setDuration(Math.max(0.5, Number(e.target.value)))}
            className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Frame rate (fps)</span>
          <input
            type="number"
            min={4}
            max={30}
            step={1}
            value={fps}
            onChange={(e) => setFps(Math.min(30, Math.max(4, Number(e.target.value))))}
            className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Width (pixels)</span>
          <input
            type="number"
            min={120}
            max={1200}
            step={20}
            value={width}
            onChange={(e) => setWidth(Math.min(1200, Math.max(120, Number(e.target.value))))}
            className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={run} disabled={!file || status.kind === "working"}>
          Convert to GIF
        </PrimaryButton>
        {file && (
          <GhostButton type="button" onClick={() => { setFile(null); setStatus({ kind: "idle" }); }}>
            Reset
          </GhostButton>
        )}
      </div>
    </ToolShell>
  );
}