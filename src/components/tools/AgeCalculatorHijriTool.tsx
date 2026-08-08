import { useMemo, useState } from "react";
import { ToolShell } from "./ToolShell";
import { tools } from "@/lib/tools";

const HIJRI_MONTHS = ["Muharram","Safar","Rabi al-Awwal","Rabi al-Thani","Jumada al-Awwal","Jumada al-Thani","Rajab","Shaban","Ramadan","Shawwal","Dhu al-Qadah","Dhu al-Hijjah"];

function gregToHijri(y: number, m: number, d: number) {
  let jd: number;
  if (y > 1582 || (y === 1582 && m > 10) || (y === 1582 && m === 10 && d > 14)) {
    jd = Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4)
       + Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12)
       - Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4)
       + d - 32075;
  } else {
    jd = 367 * y - Math.floor((7 * (y + 5001 + Math.floor((m - 9) / 7))) / 4)
       + Math.floor((275 * m) / 9) + d + 1729777;
  }
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l1 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l1) / 5316) * Math.floor((50 * l1) / 17719)
          + Math.floor(l1 / 5670) * Math.floor((43 * l1) / 15238);
  const l2 = l1 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
           - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l2) / 709);
  const day = l2 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { y: year, m: month, d: day };
}

function diffYMD(from: Date, to: Date) {
  let y = to.getFullYear() - from.getFullYear();
  let m = to.getMonth() - from.getMonth();
  let d = to.getDate() - from.getDate();
  if (d < 0) { m -= 1; const prev = new Date(to.getFullYear(), to.getMonth(), 0); d += prev.getDate(); }
  if (m < 0) { y -= 1; m += 12; }
  return { y, m, d };
}

export function AgeCalculatorHijriTool() {
  const tool = tools.find((t) => t.slug === "age-calculator-hijri")!;
  const [dob, setDob] = useState("2000-01-01");

  const info = useMemo(() => {
    const [y, m, d] = dob.split("-").map(Number);
    if (!y || !m || !d) return null;
    const birth = new Date(y, m - 1, d);
    const today = new Date();
    const ageG = diffYMD(birth, today);
    const hBirth = gregToHijri(y, m, d);
    const t = new Date();
    const hToday = gregToHijri(t.getFullYear(), t.getMonth() + 1, t.getDate());
    let hy = hToday.y - hBirth.y;
    let hm = hToday.m - hBirth.m;
    let hd = hToday.d - hBirth.d;
    if (hd < 0) { hm -= 1; hd += 29; }
    if (hm < 0) { hy -= 1; hm += 12; }
    const totalDays = Math.floor((today.getTime() - birth.getTime()) / 86400000);
    return { ageG, hBirth, hToday, hAge: { y: hy, m: hm, d: hd }, totalDays };
  }, [dob]);

  return (
    <ToolShell tool={tool} howItWorks={[
      "Enter your Gregorian date of birth.",
      "See exact age in years, months and days.",
      "Also see the Hijri (Islamic) birth date and your Hijri age.",
    ]}>
      <label className="block max-w-xs">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Date of birth</span>
        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1 block w-full rounded border border-line bg-white p-2 font-mono text-sm" />
      </label>

      {info && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="font-mono text-[11px] uppercase tracking-widest text-signal">Gregorian age</p>
            <p className="mt-2 font-mono text-3xl font-bold text-ink">{info.ageG.y}<span className="text-lg text-graphite"> yr</span> {info.ageG.m}<span className="text-lg text-graphite"> mo</span> {info.ageG.d}<span className="text-lg text-graphite"> d</span></p>
            <p className="mt-3 font-mono text-xs text-graphite">Total days lived: {info.totalDays.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="font-mono text-[11px] uppercase tracking-widest text-signal">Hijri age</p>
            <p className="mt-2 font-mono text-3xl font-bold text-ink">{info.hAge.y}<span className="text-lg text-graphite"> yr</span> {info.hAge.m}<span className="text-lg text-graphite"> mo</span> {info.hAge.d}<span className="text-lg text-graphite"> d</span></p>
            <p className="mt-3 font-mono text-xs text-graphite">Born: {info.hBirth.d} {HIJRI_MONTHS[info.hBirth.m - 1]} {info.hBirth.y} AH</p>
            <p className="font-mono text-xs text-graphite">Today: {info.hToday.d} {HIJRI_MONTHS[info.hToday.m - 1]} {info.hToday.y} AH</p>
          </div>
        </div>
      )}
    </ToolShell>
  );
}