// Shared loader for @huggingface/transformers pipelines.
// - Dynamically imports the library so it only loads on AI tool pages.
// - Uses WebGPU when available (much faster), falls back to WASM.
// - Caches pipelines per (task+model) so revisits are instant.

type ProgressCb = (msg: string, pct?: number) => void;

const cache = new Map<string, unknown>();
let libPromise: Promise<typeof import("@huggingface/transformers")> | null = null;

function loadLib() {
  if (!libPromise) {
    libPromise = import("@huggingface/transformers").then((mod) => {
      // Never look for local models — always fetch from HF CDN.
      mod.env.allowLocalModels = false;
      return mod;
    });
  }
  return libPromise;
}

async function pickDevice(): Promise<"webgpu" | "wasm"> {
  try {
    const nav = navigator as unknown as { gpu?: { requestAdapter: () => Promise<unknown> } };
    if (typeof navigator !== "undefined" && nav.gpu && (await nav.gpu.requestAdapter())) {
      return "webgpu";
    }
  } catch {
    /* ignore */
  }
  return "wasm";
}

export async function loadPipeline<T = unknown>(
  task: string,
  model: string,
  onProgress?: ProgressCb,
  opts: { dtype?: string; forceDevice?: "webgpu" | "wasm" } = {},
): Promise<T> {
  const key = `${task}::${model}`;
  if (cache.has(key)) {
    onProgress?.("Model already loaded — running…", 90);
    return cache.get(key) as T;
  }
  const { pipeline } = await loadLib();
  const device = opts.forceDevice ?? (await pickDevice());
  onProgress?.(`Loading model (${device.toUpperCase()}) — first run downloads once, then cached…`, 5);

  const pipe = await pipeline(task as never, model, {
    device,
    ...(opts.dtype ? { dtype: opts.dtype as never } : {}),
    progress_callback: (info: {
      status?: string;
      file?: string;
      progress?: number;
      loaded?: number;
      total?: number;
    }) => {
      if (!onProgress) return;
      if (info.status === "progress" && typeof info.progress === "number") {
        const mb = info.total ? ` (${(info.loaded ?? 0) / 1e6 | 0}/${(info.total / 1e6) | 0} MB)` : "";
        onProgress(`Downloading ${info.file ?? "model"}${mb}`, Math.max(5, Math.min(80, info.progress)));
      } else if (info.status === "ready") {
        onProgress("Model ready — running…", 85);
      } else if (info.status === "initiate") {
        onProgress(`Fetching ${info.file ?? "model"}…`, 5);
      }
    },
  } as never);

  cache.set(key, pipe);
  return pipe as T;
}

/** Decode an audio file to 16 kHz mono Float32Array, as Whisper expects. */
export async function decodeAudioForWhisper(file: File): Promise<Float32Array> {
  const buf = await file.arrayBuffer();
  // Some browsers require a live AudioContext; sample-rate hint is best-effort.
  const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  const ctx = new AC({ sampleRate: 16000 });
  const decoded = await ctx.decodeAudioData(buf.slice(0));
  let mono: Float32Array;
  if (decoded.numberOfChannels === 1) {
    mono = decoded.getChannelData(0).slice();
  } else {
    const l = decoded.getChannelData(0);
    const r = decoded.getChannelData(1);
    mono = new Float32Array(l.length);
    for (let i = 0; i < l.length; i++) mono[i] = (l[i] + r[i]) / 2;
  }
  await ctx.close();
  // If browser ignored our 16k hint, resample manually with OfflineAudioContext.
  if (decoded.sampleRate !== 16000) {
    const off = new OfflineAudioContext(1, Math.ceil((mono.length * 16000) / decoded.sampleRate), 16000);
    const src = off.createBufferSource();
    const b = off.createBuffer(1, mono.length, decoded.sampleRate);
    b.getChannelData(0).set(mono);
    src.buffer = b;
    src.connect(off.destination);
    src.start();
    const rendered = await off.startRendering();
    mono = rendered.getChannelData(0).slice();
  }
  return mono;
}