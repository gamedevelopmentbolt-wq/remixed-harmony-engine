import { useEffect, useRef, useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

function encodeWav(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const len = buffer.length;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numCh * bytesPerSample;
  const dataSize = len * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const dv = new DataView(ab);
  let o = 0;
  const wStr = (s: string) => { for (let i = 0; i < s.length; i++) dv.setUint8(o++, s.charCodeAt(i)); };
  const wU32 = (v: number) => { dv.setUint32(o, v, true); o += 4; };
  const wU16 = (v: number) => { dv.setUint16(o, v, true); o += 2; };
  wStr("RIFF"); wU32(36 + dataSize); wStr("WAVE");
  wStr("fmt "); wU32(16); wU16(1); wU16(numCh); wU32(sampleRate); wU32(sampleRate * blockAlign); wU16(blockAlign); wU16(bitsPerSample);
  wStr("data"); wU32(dataSize);
  const chans: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) chans.push(buffer.getChannelData(c));
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, chans[c][i]));
      dv.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}

function fmt(t: number): string {
  const m = Math.floor(t / 60);
  const s = (t - m * 60).toFixed(2);
  return `${m}:${s.padStart(5, "0")}`;
}

export function AudioTrimmerTool() {
  const tool = tools.find((t) => t.slug === "audio-trimmer")!;
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [url]);

  const onFiles = async (fs: File[]) => {
    const f = fs.find((x) => x.type.startsWith("audio/") || /\.(mp3|wav|m4a|ogg|webm|flac)$/i.test(x.name));
    if (!f) {
      setStatus({ kind: "error", message: "Please choose an audio file (MP3, WAV, M4A, OGG…)." });
      return;
    }
    try {
      setStatus({ kind: "working", message: "Decoding audio…", progress: 20 });
      const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buf = await ac.decodeAudioData(await f.arrayBuffer());
      setBuffer(buf);
      setFile(f);
      setStart(0);
      setEnd(buf.duration);
      if (url) URL.revokeObjectURL(url);
      setUrl(URL.createObjectURL(f));
      setStatus({ kind: "idle" });
    } catch (err) {
      setStatus({ kind: "error", message: "Couldn't decode this audio. Try MP3, WAV, M4A or OGG." });
    }
  };

  const trim = () => {
    if (!buffer || !file) return;
    try {
      const sr = buffer.sampleRate;
      const startSample = Math.max(0, Math.floor(start * sr));
      const endSample = Math.min(buffer.length, Math.floor(end * sr));
      if (endSample <= startSample) throw new Error("End must be after start.");
      const outLen = endSample - startSample;
      const ac = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
        buffer.numberOfChannels, outLen, sr,
      );
      const src = ac.createBufferSource();
      const trimmed = ac.createBuffer(buffer.numberOfChannels, outLen, sr);
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        trimmed.copyToChannel(buffer.getChannelData(c).subarray(startSample, endSample), c);
      }
      src.buffer = trimmed;
      src.connect(ac.destination);
      src.start();
      setStatus({ kind: "working", message: "Rendering WAV…", progress: 60 });
      ac.startRendering().then((rendered) => {
        const blob = encodeWav(rendered);
        const base = file.name.replace(/\.[^.]+$/, "");
        downloadBlob(blob, `${base}-trimmed.wav`);
        setStatus({ kind: "success", message: `Trimmed to ${fmt(end - start)} → WAV downloaded.` });
      });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop an audio file (MP3, WAV, M4A, OGG, WebM).",
        "Set start and end times — preview by playing the source clip in the built-in player.",
        "Click Trim — a WAV of just your selection downloads immediately.",
      ]}
    >
      {!file || !buffer ? (
        <Dropzone accept="audio/*" multiple={false} onFiles={onFiles} hint="MP3, WAV, M4A, OGG or WebM" />
      ) : (
        <>
          <FileList files={[file]} onRemove={() => { setFile(null); setBuffer(null); }} />
          {url && <audio ref={audioRef} controls src={url} className="mt-2 w-full" />}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">
                Start ({fmt(start)})
              </span>
              <input
                type="range"
                min={0} max={buffer.duration} step={0.01}
                value={start}
                onChange={(e) => setStart(Math.min(end - 0.01, Number(e.target.value)))}
                className="mt-2 block w-full accent-signal"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-widest text-graphite/70">
                End ({fmt(end)}) — total {fmt(buffer.duration)}
              </span>
              <input
                type="range"
                min={0} max={buffer.duration} step={0.01}
                value={end}
                onChange={(e) => setEnd(Math.max(start + 0.01, Number(e.target.value)))}
                className="mt-2 block w-full accent-signal"
              />
            </label>
          </div>
          <p className="font-mono text-xs text-graphite">Selection: {fmt(end - start)}</p>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={trim} disabled={status.kind === "working"}>Trim & download WAV</PrimaryButton>
            <GhostButton onClick={() => { setFile(null); setBuffer(null); }}>Choose another</GhostButton>
          </div>
        </>
      )}
    </ToolShell>
  );
}