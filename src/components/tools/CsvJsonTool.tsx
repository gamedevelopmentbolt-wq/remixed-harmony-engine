import { useState } from "react";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, readFileAsText } from "@/lib/tool-utils";
import { Dropzone } from "./Dropzone";

type Dir = "csv2json" | "json2csv";

export function CsvJsonTool() {
  const tool = tools.find((t) => t.slug === "csv-json")!;
  const [dir, setDir] = useState<Dir>("csv2json");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFile = async (fs: File[]) => {
    const f = fs[0];
    if (!f) return;
    const text = await readFileAsText(f);
    setInput(text);
    setStatus({ kind: "idle" });
  };

  const convert = async () => {
    if (!input.trim()) {
      setStatus({ kind: "error", message: "Paste or upload some data first." });
      return;
    }
    try {
      const Papa = (await import("papaparse")).default;
      if (dir === "csv2json") {
        const res = Papa.parse(input, { header: true, skipEmptyLines: true, dynamicTyping: false });
        if (res.errors && res.errors.length > 0) {
          throw new Error(res.errors[0].message);
        }
        setOutput(JSON.stringify(res.data, null, 2));
      } else {
        let data: unknown;
        try {
          data = JSON.parse(input);
        } catch {
          throw new Error("Input is not valid JSON.");
        }
        if (!Array.isArray(data)) throw new Error("JSON must be an array of objects.");
        setOutput(Papa.unparse(data as object[]));
      }
      setStatus({ kind: "success", message: "Converted." });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Conversion failed.";
      setStatus({ kind: "error", message: msg });
      setOutput("");
    }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setStatus({ kind: "success", message: "Copied to clipboard." });
  };

  const download = () => {
    if (!output) return;
    const isCsv = dir === "json2csv";
    downloadBlob(new Blob([output], { type: isCsv ? "text/csv" : "application/json" }), isCsv ? "output.csv" : "output.json");
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Pick a direction — CSV → JSON, or JSON → CSV.",
        "Paste your data into the input box, or drop a .csv / .json file.",
        "Click Convert, then copy the result or download it as a file.",
      ]}
    >
      <div className="inline-flex overflow-hidden rounded-lg border border-line">
        {(["csv2json", "json2csv"] as Dir[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setDir(k)}
            className={
              "px-4 py-2 font-mono text-xs uppercase tracking-wider " +
              (dir === k ? "bg-ink text-paper" : "bg-white text-graphite hover:bg-paper-2")
            }
          >
            {k === "csv2json" ? "CSV → JSON" : "JSON → CSV"}
          </button>
        ))}
      </div>

      <Dropzone
        accept={dir === "csv2json" ? ".csv,text/csv" : ".json,application/json"}
        multiple={false}
        onFiles={onFile}
        hint={dir === "csv2json" ? "Or upload a .csv file" : "Or upload a .json file"}
      />

      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Input</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-xs text-graphite focus:border-ink focus:outline-none"
          placeholder={dir === "csv2json" ? "name,age\nJane,30\nJohn,25" : '[{"name":"Jane","age":30}]'}
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={convert}>Convert</PrimaryButton>
        {output && (
          <>
            <GhostButton onClick={copy}>Copy</GhostButton>
            <GhostButton onClick={download}>Download</GhostButton>
          </>
        )}
      </div>

      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Output</span>
        <textarea
          value={output}
          readOnly
          rows={8}
          className="mt-2 block w-full rounded-md border border-line bg-paper-2/50 p-3 font-mono text-xs text-graphite"
          placeholder="Result appears here"
        />
      </label>
    </ToolShell>
  );
}
