import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { loadPipeline, decodeAudioForWhisper } from "@/lib/hf-transformers";

const LANGS = [
  ["auto", "Auto-detect"], ["english", "English"], ["spanish", "Spanish"], ["french", "French"],
  ["german", "German"], ["italian", "Italian"], ["portuguese", "Portuguese"], ["dutch", "Dutch"],
  ["russian", "Russian"], ["arabic", "Arabic"], ["hindi", "Hindi"], ["urdu", "Urdu"],
  ["chinese", "Chinese"], ["japanese", "Japanese"], ["korean", "Korean"], ["turkish", "Turkish"],
] as const;

type Transcriber = (audio: Float32Array, opts?: Record<string, unknown>) => Promise<{ text: string }>;

export function AiTranscribeTool() {
  const tool = tools.find((t) => t.slug === "ai-transcribe")!;
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [lang, setLang] = useState<string>("auto");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFiles = (fs: File[]) => {
    const f = fs.find((x) => x.type.startsWith("audio/") || x.type.startsWith("video/") || /\.(mp3|wav|m4a|ogg|webm|flac|mp4)$/i.test(x.name));
    if (!f) return setStatus({ kind: "error", message: "Please choose an audio or video file." });
    setFile(f);
    setText("");
    setStatus({ kind: "idle" });
  };

  const run = async () => {
    if (!file) return;
    try {
      setStatus({ kind: "working", message: "Loading Whisper model…", progress: 5 });
      const pipe = await loadPipeline<Transcriber>(
        "automatic-speech-recognition",
        "Xenova/whisper-tiny",
        (m, p) => setStatus({ kind: "working", message: m, progress: p }),
      );
      setStatus({ kind: "working", message: "Decoding audio to 16 kHz mono…", progress: 82 });
      const audio = await decodeAudioForWhisper(file);
      const seconds = Math.round(audio.length / 16000);
      setStatus({ kind: "working", message: `Transcribing ${seconds}s of audio…`, progress: 90 });
      const out = await pipe(audio, {
        chunk_length_s: 30,
        stride_length_s: 5,
        ...(lang !== "auto" ? { language: lang, task: "transcribe" } : {}),
      });
      setText(out.text.trim());
      setStatus({ kind: "success", message: `Transcribed ${seconds}s of audio.` });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop an audio or video file (MP3, WAV, M4A, WebM, MP4…).",
        "First run downloads OpenAI's open-source Whisper-tiny model (~80 MB). Cached in your browser after that.",
        "The audio is decoded and transcribed 100% locally — nothing is uploaded to any server.",
      ]}
    >
      {!file ? (
        <Dropzone accept="audio/*,video/*" multiple={false} onFiles={onFiles} hint="Audio or video file" />
      ) : (
        <>
          <FileList files={[file]} onRemove={() => { setFile(null); setText(""); }} />
          <div className="flex flex-wrap items-center gap-3">
            <label className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">Language</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="h-10 rounded-md border border-line bg-white px-3 font-mono text-sm text-ink focus:border-ink focus:outline-none"
            >
              {LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={run} disabled={status.kind === "working"} loading={status.kind === "working"}>
              Transcribe
            </PrimaryButton>
            <GhostButton onClick={() => { setFile(null); setText(""); }}>Choose another</GhostButton>
          </div>
          {text && (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-signal">Transcript</p>
              <textarea readOnly value={text} rows={10} className="mt-2 w-full rounded-lg border border-line bg-paper-2 p-4 font-mono text-sm text-ink" />
              <div className="mt-3 flex gap-3">
                <button type="button" onClick={() => navigator.clipboard.writeText(text)} className="font-mono text-[11px] uppercase tracking-widest text-signal hover:underline">Copy</button>
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([text], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = (file?.name.replace(/\.[^.]+$/, "") ?? "transcript") + ".txt"; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="font-mono text-[11px] uppercase tracking-widest text-signal hover:underline"
                >
                  Download .txt
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </ToolShell>
  );
}