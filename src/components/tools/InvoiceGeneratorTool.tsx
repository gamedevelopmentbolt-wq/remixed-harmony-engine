import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

interface Line {
  desc: string;
  qty: string;
  price: string;
}

const input =
  "h-10 w-full rounded-md border border-line bg-white px-3 font-mono text-sm text-ink outline-none focus:border-ink";
const label = "font-mono text-[11px] uppercase tracking-widest text-graphite/70";

export function InvoiceGeneratorTool() {
  const tool = tools.find((t) => t.slug === "invoice-generator")!;
  const [from, setFrom] = useState("Your Company\n12 Workshop Lane\nhello@example.com");
  const [to, setTo] = useState("Client Ltd\n40 Market Street");
  const [number, setNumber] = useState("INV-0001");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [due, setDue] = useState("");
  const [currency, setCurrency] = useState("$");
  const [taxRate, setTaxRate] = useState("0");
  const [notes, setNotes] = useState("Thank you for your business.");
  const [lines, setLines] = useState<Line[]>([
    { desc: "Design work", qty: "10", price: "75" },
    { desc: "Hosting (monthly)", qty: "1", price: "25" },
  ]);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const num = (s: string) => {
    const v = parseFloat(s.replace(",", "."));
    return Number.isFinite(v) ? v : 0;
  };
  const subtotal = lines.reduce((s, l) => s + num(l.qty) * num(l.price), 0);
  const tax = (subtotal * num(taxRate)) / 100;
  const total = subtotal + tax;
  const money = (v: number) => `${currency}${v.toFixed(2)}`;

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const run = async () => {
    try {
      setStatus({ kind: "working", message: "Building invoice…", progress: 20 });
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const M = 48;
      let y = M + 10;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("INVOICE", M, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`No. ${number}`, W - M, y - 12, { align: "right" });
      doc.text(`Date: ${date}`, W - M, y + 2, { align: "right" });
      if (due.trim()) doc.text(`Due: ${due}`, W - M, y + 16, { align: "right" });

      y += 40;
      doc.setFont("helvetica", "bold");
      doc.text("From", M, y);
      doc.text("Bill to", W / 2, y);
      doc.setFont("helvetica", "normal");
      const fromLines = from.split("\n");
      const toLines = to.split("\n");
      const blockRows = Math.max(fromLines.length, toLines.length);
      fromLines.forEach((l, i) => doc.text(l, M, y + 16 + i * 13));
      toLines.forEach((l, i) => doc.text(l, W / 2, y + 16 + i * 13));
      y += 16 + blockRows * 13 + 22;

      // Table header
      doc.setDrawColor(200);
      doc.setFillColor(244, 244, 242);
      doc.rect(M, y - 12, W - M * 2, 22, "F");
      doc.setFont("helvetica", "bold");
      doc.text("Description", M + 8, y + 3);
      doc.text("Qty", W - M - 200, y + 3, { align: "right" });
      doc.text("Price", W - M - 110, y + 3, { align: "right" });
      doc.text("Amount", W - M - 8, y + 3, { align: "right" });
      doc.setFont("helvetica", "normal");
      y += 26;

      for (const l of lines) {
        if (!l.desc.trim() && !num(l.qty) && !num(l.price)) continue;
        if (y > 720) {
          doc.addPage();
          y = M;
        }
        const amount = num(l.qty) * num(l.price);
        const wrapped = doc.splitTextToSize(l.desc || "—", W - M * 2 - 230) as string[];
        wrapped.forEach((w, i) => doc.text(w, M + 8, y + i * 13));
        doc.text(String(num(l.qty)), W - M - 200, y, { align: "right" });
        doc.text(money(num(l.price)), W - M - 110, y, { align: "right" });
        doc.text(money(amount), W - M - 8, y, { align: "right" });
        y += Math.max(1, wrapped.length) * 13 + 8;
        doc.setDrawColor(230);
        doc.line(M, y - 6, W - M, y - 6);
      }

      y += 12;
      const totalsX = W - M - 8;
      doc.text("Subtotal", W - M - 110, y, { align: "right" });
      doc.text(money(subtotal), totalsX, y, { align: "right" });
      y += 15;
      doc.text(`Tax (${num(taxRate)}%)`, W - M - 110, y, { align: "right" });
      doc.text(money(tax), totalsX, y, { align: "right" });
      y += 18;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Total", W - M - 110, y, { align: "right" });
      doc.text(money(total), totalsX, y, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      if (notes.trim()) {
        y += 36;
        doc.setTextColor(90);
        doc.splitTextToSize(notes, W - M * 2).forEach((l: string, i: number) => doc.text(l, M, y + i * 13));
        doc.setTextColor(0);
      }

      const blob = doc.output("blob");
      downloadBlob(blob, `${number.replace(/[^\w-]+/g, "-") || "invoice"}.pdf`);
      setStatus({ kind: "success", message: "Invoice PDF ready." });
    } catch (e) {
      setStatus({ kind: "error", message: e instanceof Error ? e.message : "Could not build the invoice." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Fill in your details, the client's details and the invoice number.",
        "Add one line per item — quantity × price is calculated for you, plus optional tax.",
        "Download a clean A4 PDF invoice. Nothing is uploaded; it is built in your browser.",
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className={label}>From (your details)</p>
          <textarea
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border border-line bg-white p-3 font-mono text-sm text-ink outline-none focus:border-ink"
          />
        </div>
        <div>
          <p className={label}>Bill to (client)</p>
          <textarea
            value={to}
            onChange={(e) => setTo(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border border-line bg-white p-3 font-mono text-sm text-ink outline-none focus:border-ink"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <p className={label}>Invoice no.</p>
          <input className={`mt-1 ${input}`} value={number} onChange={(e) => setNumber(e.target.value)} />
        </div>
        <div>
          <p className={label}>Date</p>
          <input type="date" className={`mt-1 ${input}`} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <p className={label}>Due date</p>
          <input type="date" className={`mt-1 ${input}`} value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <div>
          <p className={label}>Currency</p>
          <input className={`mt-1 ${input}`} value={currency} onChange={(e) => setCurrency(e.target.value)} />
        </div>
      </div>

      <div>
        <p className={label}>Line items</p>
        <ul className="mt-2 space-y-2">
          {lines.map((l, i) => (
            <li key={i} className="grid grid-cols-12 gap-2">
              <input
                className={`col-span-6 ${input}`}
                placeholder="Description"
                value={l.desc}
                onChange={(e) => setLine(i, { desc: e.target.value })}
              />
              <input
                className={`col-span-2 ${input}`}
                inputMode="decimal"
                placeholder="Qty"
                value={l.qty}
                onChange={(e) => setLine(i, { qty: e.target.value })}
              />
              <input
                className={`col-span-3 ${input}`}
                inputMode="decimal"
                placeholder="Unit price"
                value={l.price}
                onChange={(e) => setLine(i, { price: e.target.value })}
              />
              <button
                type="button"
                aria-label={`Remove line ${i + 1}`}
                onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                className="col-span-1 grid h-10 place-items-center rounded-md border border-line bg-white text-graphite hover:border-ink hover:text-ink"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setLines((prev) => [...prev, { desc: "", qty: "1", price: "0" }])}
          className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-white px-3 font-mono text-xs uppercase tracking-wider text-ink hover:border-ink"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden /> Add line
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className={label}>Tax rate (%)</p>
          <input className={`mt-1 ${input}`} inputMode="decimal" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
        </div>
        <div className="rounded-xl border border-line bg-paper-2 p-3 font-mono text-sm text-ink">
          <p className="flex justify-between"><span className="text-graphite/70">Subtotal</span><span>{money(subtotal)}</span></p>
          <p className="mt-1 flex justify-between"><span className="text-graphite/70">Tax</span><span>{money(tax)}</span></p>
          <p className="mt-1 flex justify-between font-bold"><span>Total</span><span>{money(total)}</span></p>
        </div>
      </div>

      <div>
        <p className={label}>Notes / payment terms</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-line bg-white p-3 font-mono text-sm text-ink outline-none focus:border-ink"
        />
      </div>

      <PrimaryButton onClick={run} loading={status.kind === "working"}>
        Download invoice PDF
      </PrimaryButton>
    </ToolShell>
  );
}