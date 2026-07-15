import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Brand } from "@/components/etherox/Logo";
import { MobileFrame } from "@/components/etherox/MobileFrame";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useEtherox } from "@/lib/wallet";
import { toast } from "sonner";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign in — Etherox" }] }),
  component: SignIn,
});

function SignIn() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const { update, state } = useEtherox();
  const nav = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !pw) return toast.error("Enter email & password");
    update({ signedIn: true, email, fullName: state.fullName || email.split("@")[0] });
    nav({ to: state.welcomeClaimed ? "/dashboard" : "/welcome-bonus" });
  }

  return (
    <MobileFrame>
      <div className="flex flex-col items-center pt-6">
        <Brand size={48} />
      </div>
      <div className="mt-8 rounded-3xl border border-primary/25 bg-card/60 p-6 glow-soft">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground mt-1">Sign in to your account</p>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <Field label="Email">
            <Mail size={18} className="text-muted-foreground" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email" className="flex-1 bg-transparent outline-none" />
          </Field>
          <Field label="Password">
            <Lock size={18} className="text-muted-foreground" />
            <input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Enter Password" className="flex-1 bg-transparent outline-none" />
            <button type="button" onClick={() => setShow(!show)} className="text-muted-foreground">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </Field>

          <button className="w-full rounded-2xl bg-primary text-primary-foreground font-bold py-4 glow-primary">Sign In</button>
        </form>

        <Divider />

        <button onClick={() => toast("Google sign-in coming soon")} className="w-full rounded-2xl bg-white text-black font-semibold py-3.5 flex items-center justify-center gap-3 glow-soft">
          <GoogleG /> Continue with Google
        </button>

        <div className="mt-6 text-center">
          <button className="text-primary font-medium">Forgot Password?</button>
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-semibold">Sign up</Link>
        </p>
      </div>
    </MobileFrame>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-primary/25 bg-card/40 px-4 py-3.5">
        {children}
      </div>
    </label>
  );
}

export function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      OR
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 12.5 24 12.5c3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5c-7.6 0-14.1 4.3-17.7 10.2z"/>
      <path fill="#4CAF50" d="M24 43.5c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.4-4.5 2.2-7.1 2.2-5.3 0-9.7-3-11.3-7.5l-6.5 5C9.7 39.1 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.4 5.9l6.1 5c-.4.4 6.5-4.7 6.5-14.9 0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}