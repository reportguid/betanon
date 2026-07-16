import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherox/MobileFrame";
import { ArrowLeft, AlertTriangle, Copy, Check, Timer, Upload, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/pay-transfer")({
  head: () => ({ meta: [{ title: "Pay with bank transfer — BETANO" }] }),
  component: PayTransfer,
});

const BANK = {
  bank: "Moniepoint",
  account: "6799756871",
  name: "Sumayya Khaleel Ibrahim",
  amount: "₦8,300",
};

function PayTransfer() {
  const [seconds, setSeconds] = useState(30 * 60);
  const [copied, setCopied] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  function copy(label: string, value: string) {
    navigator.clipboard?.writeText(value);
    setCopied(label);
    toast(`${label} copied`);
    setTimeout(() => setCopied(null), 1400);
  }

  function submit() {
    setSubmitted(true);
    toast("Payment submitted — awaiting admin approval");
  }

  return (
    <MobileFrame>
      <header className="flex items-center gap-4 ex-fade-up">
        <Link to="/buy-token" className="grid place-items-center size-11 rounded-full bg-card border border-border transition hover:scale-105">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Pay with bank transfer</h1>
          <p className="text-sm text-muted-foreground">Activate BETANO Token</p>
        </div>
      </header>

      <div className="mt-5 rounded-2xl border border-yellow-500/50 bg-yellow-500/5 p-4 flex items-start gap-3 ex-fade-up ex-delay-1">
        <AlertTriangle size={20} className="text-yellow-400 mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed">
          Do <span className="font-bold">NOT</span> use Opay. Use any other bank app (KUDA, GTB, Access, Moniepoint, etc). Opay transfers will not reflect.
        </p>
      </div>

      <section className="mt-4 rounded-3xl border border-primary/25 bg-card/60 p-5 glow-soft ex-fade-up ex-delay-2">
        <Field label="BANK" value={BANK.bank} onCopy={() => copy("Bank", BANK.bank)} copied={copied === "Bank"} />
        <Field label="ACCOUNT NUMBER" value={BANK.account} highlight onCopy={() => copy("Account number", BANK.account)} copied={copied === "Account number"} />
        <Field label="ACCOUNT NAME" value={BANK.name} onCopy={() => copy("Account name", BANK.name)} copied={copied === "Account name"} />
        <Field label="AMOUNT" value={BANK.amount} onCopy={() => copy("Amount", "8300")} copied={copied === "Amount"} last />
      </section>

      <div className="mt-4 rounded-2xl border border-primary/25 bg-card/50 p-4 flex items-center gap-4 ex-fade-up ex-delay-3">
        <Timer size={26} className="text-primary ex-spin-slow" />
        <div className="flex-1">
          <div className="text-sm text-muted-foreground">Payment expires in</div>
          <div className="text-3xl font-bold tabular-nums">{mm}:{ss}</div>
        </div>
        <p className="text-xs text-muted-foreground text-right max-w-[45%]">Complete the transfer before the timer ends or you'll need to restart.</p>
      </div>

      <button
        onClick={() => fileRef.current?.click()}
        className="mt-4 w-full rounded-2xl border border-dashed border-primary/40 bg-card/40 p-4 flex items-center gap-4 text-left ex-fade-up ex-delay-4 transition hover:bg-card/60"
      >
        <div className="grid place-items-center size-12 rounded-full bg-background/60 border border-border">
          <Upload size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <div className="font-bold">Upload payment receipt</div>
          <div className="text-xs text-muted-foreground">{fileName ?? "Tap to attach a screenshot or PDF (max 5MB)"}</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
      </button>

      <button
        onClick={submit}
        className="mt-5 mb-28 w-full rounded-full bg-primary text-primary-foreground font-bold py-4 glow-primary ex-pulse-glow inline-flex items-center justify-center gap-2 transition hover:scale-[1.02] ex-fade-up ex-delay-5"
      >
        {submitted ? <><CheckCircle2 size={18} /> Submitted — awaiting approval</> : "I have made my payment"}
      </button>

    </MobileFrame>
  );
}

function Field({ label, value, onCopy, copied, highlight, last }: { label: string; value: string; onCopy: () => void; copied: boolean; highlight?: boolean; last?: boolean }) {
  return (
    <div className={`${last ? "" : "mb-3"} rounded-2xl ${highlight ? "border border-primary/60 bg-primary/5 glow-soft" : "border border-transparent"} p-3 flex items-center justify-between gap-3`}>
      <div className="min-w-0">
        <div className="text-[11px] tracking-widest text-muted-foreground">{label}</div>
        <div className="text-xl font-bold truncate">{value}</div>
      </div>
      <button onClick={onCopy} className="grid place-items-center size-11 rounded-full bg-background/60 border border-border shrink-0 transition hover:scale-105">
        {copied ? <Check size={18} className="text-primary ex-pop" /> : <Copy size={18} />}
      </button>
    </div>
  );
}