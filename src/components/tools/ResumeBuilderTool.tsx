import { useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

interface Exp { title: string; company: string; from: string; to: string; details: string }
interface Edu { degree: string; school: string; year: string }
type Template = "classic" | "compact" | "modern";

export function ResumeBuilderTool() {
  const tool = tools.find((t) => t.slug === "resume-builder")!;
  const [tpl, setTpl] = useState<Template>("classic");
  const [name, setName] = useState("Your Name");
  const [role, setRole] = useState("Software Engineer");
  const [email, setEmail] = useState("you@example.com");
  const [phone, setPhone] = useState("+92 300 0000000");
  const [city, setCity] = useState("Karachi, Pakistan");
  const [summary, setSummary] = useState("Results-driven professional with X years of experience in …");
  const [skills, setSkills] = useState("JavaScript, TypeScript, React, Node.js, SQL, Git");
  const [exp, setExp] = useState<Exp[]>([{ title: "Senior Engineer", company: "Company", from: "2022", to: "Present", details: "• Delivered X\n• Improved Y" }]);
  const [edu, setEdu] = useState<Edu[]>([{ degree: "BS Computer Science", school: "University of Karachi", year: "2020" }]);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const generate = async () => {
    try {
      setStatus({ kind: "working", message: "Building CV…" });
      const jsPDF = (await import("jspdf")).default;
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const M = 48; let y = 60;
      doc.setFont("helvetica", "bold"); doc.setFontSize(tpl === "compact" ? 20 : 26);
      doc.text(name, M, y); y += tpl === "compact" ? 20 : 26;
      doc.setFont("helvetica", "normal"); doc.setFontSize(12);
      doc.setTextColor(90); doc.text(role, M, y); y += 18;
      doc.setFontSize(10);
      doc.text([email, phone, city].filter(Boolean).join("  ·  "), M, y); y += 18;
      doc.setTextColor(0);
      if (tpl === "modern") { doc.setDrawColor(20, 33, 61); doc.setLineWidth(2); doc.line(M, y, W - M, y); y += 14; }
      else { doc.setDrawColor(200); doc.line(M, y, W - M, y); y += 14; }

      const section = (title: string) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(12);
        doc.text(title.toUpperCase(), M, y); y += 14;
        doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      };
      const text = (s: string, x = M, maxW = W - M * 2) => {
        const lines = doc.splitTextToSize(s, maxW);
        doc.text(lines, x, y); y += lines.length * 12;
      };

      section("Summary"); text(summary); y += 6;
      section("Experience");
      exp.forEach((e) => {
        doc.setFont("helvetica", "bold"); doc.text(`${e.title} — ${e.company}`, M, y);
        doc.setFont("helvetica", "normal"); doc.text(`${e.from} – ${e.to}`, W - M, y, { align: "right" });
        y += 12; text(e.details); y += 6;
      });
      section("Education");
      edu.forEach((e) => {
        doc.setFont("helvetica", "bold"); doc.text(e.degree, M, y);
        doc.setFont("helvetica", "normal"); doc.text(`${e.school} — ${e.year}`, W - M, y, { align: "right" });
        y += 16;
      });
      section("Skills"); text(skills);

      const blob = doc.output("blob");
      downloadBlob(blob, `${name.replace(/\s+/g, "_")}_CV.pdf`);
      setStatus({ kind: "success", message: "CV downloaded." });
    } catch (e) {
      setStatus({ kind: "error", message: (e as Error).message });
    }
  };

  const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={"w-full rounded border border-line bg-white p-2 font-mono text-sm " + (p.className ?? "")} />;

  return (
    <ToolShell tool={tool} status={status} howItWorks={[
      "Pick an ATS-friendly template (no tables, no images — parses cleanly).",
      "Fill your details, experience, education and skills.",
      "Click Generate — you get a print-ready PDF CV.",
    ]}>
      <div className="flex flex-wrap gap-2">
        {(["classic", "compact", "modern"] as Template[]).map((t) => (
          <button key={t} type="button" onClick={() => setTpl(t)} className={"rounded-full border px-4 py-1 font-mono text-xs uppercase tracking-wider " + (tpl === t ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite")}>{t}</button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">Full name</span><Input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">Role / headline</span><Input value={role} onChange={(e) => setRole(e.target.value)} /></label>
        <label className="text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">Email</span><Input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">Phone</span><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
        <label className="text-sm sm:col-span-2"><span className="font-mono text-xs uppercase tracking-wider text-ink">City / country</span><Input value={city} onChange={(e) => setCity(e.target.value)} /></label>
      </div>

      <label className="block text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">Summary</span><textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} className="mt-1 w-full rounded border border-line bg-white p-2 font-mono text-sm" /></label>

      <div className="rounded-xl border border-line bg-white p-4">
        <div className="mb-2 flex items-center justify-between"><p className="font-mono text-xs uppercase tracking-wider text-ink">Experience</p>
          <button type="button" onClick={() => setExp((a) => [...a, { title: "", company: "", from: "", to: "", details: "" }])} className="font-mono text-xs uppercase text-signal">+ Add role</button>
        </div>
        <div className="space-y-3">
          {exp.map((e, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Title" value={e.title} onChange={(ev) => setExp((a) => a.map((x, idx) => idx === i ? { ...x, title: ev.target.value } : x))} />
              <Input placeholder="Company" value={e.company} onChange={(ev) => setExp((a) => a.map((x, idx) => idx === i ? { ...x, company: ev.target.value } : x))} />
              <Input placeholder="From" value={e.from} onChange={(ev) => setExp((a) => a.map((x, idx) => idx === i ? { ...x, from: ev.target.value } : x))} />
              <Input placeholder="To" value={e.to} onChange={(ev) => setExp((a) => a.map((x, idx) => idx === i ? { ...x, to: ev.target.value } : x))} />
              <textarea rows={3} placeholder="• Achievements…" value={e.details} onChange={(ev) => setExp((a) => a.map((x, idx) => idx === i ? { ...x, details: ev.target.value } : x))} className="w-full rounded border border-line bg-white p-2 font-mono text-sm sm:col-span-2" />
              <button type="button" onClick={() => setExp((a) => a.filter((_, idx) => idx !== i))} className="justify-self-end font-mono text-xs uppercase text-graphite hover:text-destructive sm:col-span-2">Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-white p-4">
        <div className="mb-2 flex items-center justify-between"><p className="font-mono text-xs uppercase tracking-wider text-ink">Education</p>
          <button type="button" onClick={() => setEdu((a) => [...a, { degree: "", school: "", year: "" }])} className="font-mono text-xs uppercase text-signal">+ Add</button>
        </div>
        <div className="space-y-2">
          {edu.map((e, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_100px_40px]">
              <Input placeholder="Degree" value={e.degree} onChange={(ev) => setEdu((a) => a.map((x, idx) => idx === i ? { ...x, degree: ev.target.value } : x))} />
              <Input placeholder="School" value={e.school} onChange={(ev) => setEdu((a) => a.map((x, idx) => idx === i ? { ...x, school: ev.target.value } : x))} />
              <Input placeholder="Year" value={e.year} onChange={(ev) => setEdu((a) => a.map((x, idx) => idx === i ? { ...x, year: ev.target.value } : x))} />
              <button type="button" onClick={() => setEdu((a) => a.filter((_, idx) => idx !== i))} className="rounded border border-line font-mono text-sm text-graphite hover:border-destructive hover:text-destructive">×</button>
            </div>
          ))}
        </div>
      </div>

      <label className="block text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">Skills (comma separated)</span><textarea rows={2} value={skills} onChange={(e) => setSkills(e.target.value)} className="mt-1 w-full rounded border border-line bg-white p-2 font-mono text-sm" /></label>

      <PrimaryButton onClick={generate}>Generate PDF CV</PrimaryButton>
    </ToolShell>
  );
}