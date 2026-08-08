import { useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob, readFileAsDataURL } from "@/lib/tool-utils";

interface Item { desc: string; qty: number; rate: number }

const pkr = (n: number) => "PKR " + n.toLocaleString("en-PK", { maximumFractionDigits: 2 });

export function SalaryInvoicePkTool() {
  const tool = tools.find((t) => t.slug === "salary-invoice-pk")!;
  const [mode, setMode] = useState<"invoice" | "salary">("invoice");
  const [logo, setLogo] = useState<string | null>(null);
  const [company, setCompany] = useState("Your Company (Pvt) Ltd");
  const [address, setAddress] = useState("Karachi, Pakistan");
  const [ntn, setNtn] = useState("");
  const [toName, setToName] = useState("Client / Employee Name");
  const [refNo, setRefNo] = useState("INV-0001");
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<Item[]>([{ desc: "Basic salary", qty: 1, rate: 100000 }]);
  const [taxPct, setTaxPct] = useState(0);
  const [deduction, setDeduction] = useState(0);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const subtotal = items.reduce((a, it) => a + it.qty * it.rate, 0);
  const tax = (subtotal * taxPct) / 100;
  const total = subtotal + tax - deduction;

  const onLogo = async (f?: File | null) => {
    if (!f) return;
    setLogo(await readFileAsDataURL(f));
  };

  const generate = async () => {
    try {
      setStatus({ kind: "working", message: "Building PDF…" });
      const jsPDF = (await import("jspdf")).default;
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      let y = 40;
      if (logo) { try { doc.addImage(logo, "PNG", 40, y, 60, 60); } catch { /* ignore */ } }
      doc.setFont("helvetica", "bold"); doc.setFontSize(18);
      doc.text(company, W - 40, y + 16, { align: "right" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.text(address, W - 40, y + 32, { align: "right" });
      if (ntn) doc.text("NTN: " + ntn, W - 40, y + 46, { align: "right" });
      y += 90;
      doc.setFont("helvetica", "bold"); doc.setFontSize(22);
      doc.text(mode === "invoice" ? "INVOICE" : "SALARY SLIP", 40, y);
      y += 20;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.text((mode === "invoice" ? "Bill To: " : "Employee: ") + toName, 40, y);
      doc.text((mode === "invoice" ? "Invoice #: " : "Slip #: ") + refNo, W - 40, y, { align: "right" });
      y += 14;
      doc.text("Date: " + dateStr, W - 40, y, { align: "right" });
      y += 24;
      doc.setFillColor(20, 33, 61); doc.rect(40, y, W - 80, 22, "F");
      doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
      doc.text("Description", 48, y + 15);
      doc.text("Qty", W - 260, y + 15, { align: "right" });
      doc.text("Rate", W - 160, y + 15, { align: "right" });
      doc.text("Amount", W - 48, y + 15, { align: "right" });
      doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
      y += 22;
      items.forEach((it, i) => {
        if (i % 2 === 0) { doc.setFillColor(245, 245, 240); doc.rect(40, y, W - 80, 20, "F"); }
        doc.text(it.desc.slice(0, 60), 48, y + 14);
        doc.text(String(it.qty), W - 260, y + 14, { align: "right" });
        doc.text(pkr(it.rate), W - 160, y + 14, { align: "right" });
        doc.text(pkr(it.qty * it.rate), W - 48, y + 14, { align: "right" });
        y += 20;
      });
      y += 10;
      const rowT = (label: string, val: string, bold?: boolean) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.text(label, W - 200, y);
        doc.text(val, W - 48, y, { align: "right" });
        y += 16;
      };
      rowT("Subtotal", pkr(subtotal));
      if (taxPct) rowT(`Tax (${taxPct}%)`, pkr(tax));
      if (deduction) rowT("Deductions", "- " + pkr(deduction));
      rowT("TOTAL", pkr(total), true);
      if (notes) { y += 12; doc.setFontSize(9); doc.text(notes.slice(0, 500), 40, y, { maxWidth: W - 80 }); }
      const blob = doc.output("blob");
      downloadBlob(blob, `${mode}-${refNo}.pdf`);
      setStatus({ kind: "success", message: "PDF saved." });
    } catch (e) {
      setStatus({ kind: "error", message: (e as Error).message });
    }
  };

  const updateItem = (i: number, patch: Partial<Item>) => setItems((arr) => arr.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={"w-full rounded border border-line bg-white p-2 font-mono text-sm " + (p.className ?? "")} />;

  return (
    <ToolShell tool={tool} status={status} howItWorks={[
      "Pick invoice or salary slip, upload your company logo (optional).",
      "Fill company + recipient details and add as many line items as you need.",
      "Set tax % / deductions and click Generate — you get a print-ready PKR PDF.",
    ]}>
      <div className="flex gap-2">
        {(["invoice", "salary"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={"rounded-full border px-4 py-1 font-mono text-xs uppercase tracking-wider " + (mode === m ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite")}>{m === "invoice" ? "Invoice" : "Salary Slip"}</button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">Company</span><Input value={company} onChange={(e) => setCompany(e.target.value)} /></label>
        <label className="text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">Address</span><Input value={address} onChange={(e) => setAddress(e.target.value)} /></label>
        <label className="text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">NTN (optional)</span><Input value={ntn} onChange={(e) => setNtn(e.target.value)} /></label>
        <label className="text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">Logo</span><Input type="file" accept="image/*" onChange={(e) => onLogo(e.target.files?.[0])} /></label>
        <label className="text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">{mode === "invoice" ? "Bill to" : "Employee"}</span><Input value={toName} onChange={(e) => setToName(e.target.value)} /></label>
        <label className="text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">{mode === "invoice" ? "Invoice #" : "Slip #"}</span><Input value={refNo} onChange={(e) => setRefNo(e.target.value)} /></label>
        <label className="text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">Date</span><Input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} /></label>
      </div>

      <div className="rounded-xl border border-line bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-wider text-ink">Line items</p>
          <button type="button" onClick={() => setItems((a) => [...a, { desc: "", qty: 1, rate: 0 }])} className="font-mono text-xs uppercase text-signal">+ Add row</button>
        </div>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_80px_120px_40px]">
              <Input placeholder="Description" value={it.desc} onChange={(e) => updateItem(i, { desc: e.target.value })} />
              <Input type="number" min={0} value={it.qty} onChange={(e) => updateItem(i, { qty: Number(e.target.value) })} />
              <Input type="number" min={0} value={it.rate} onChange={(e) => updateItem(i, { rate: Number(e.target.value) })} />
              <button type="button" onClick={() => setItems((a) => a.filter((_, idx) => idx !== i))} className="rounded border border-line font-mono text-sm text-graphite hover:border-destructive hover:text-destructive">×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">Tax %</span><Input type="number" min={0} value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value))} /></label>
        <label className="text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">Deductions (PKR)</span><Input type="number" min={0} value={deduction} onChange={(e) => setDeduction(Number(e.target.value))} /></label>
        <div className="text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">Total</span><p className="mt-2 font-mono text-lg font-bold text-ink">{pkr(total)}</p></div>
      </div>

      <label className="block text-sm"><span className="font-mono text-xs uppercase tracking-wider text-ink">Notes</span><textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded border border-line bg-white p-2 font-mono text-sm" /></label>

      <PrimaryButton onClick={generate}>Generate PDF</PrimaryButton>
    </ToolShell>
  );
}