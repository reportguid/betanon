import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Brand } from "@/components/etherox/Logo";
import { MobileFrame } from "@/components/etherox/MobileFrame";
import { Field, Divider, GoogleG } from "./signin";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Gift, Sparkles } from "lucide-react";
import { useState } from "react";
import { useEtherox } from "@/lib/wallet";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Etherox" }] }),
  component: SignUp,
});

function SignUp() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [ref, setRef] = useState("");
  const [agree, setAgree] = useState(false);
  const { update } = useEtherox();
  const nav = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !pw) return toast.error("Fill all required fields");
    if (!agree) return toast.error("You must agree to the Terms");
    update({ signedIn: true, fullName: name, email });
    nav({ to: "/welcome-bonus" });
  }

  return (
    <MobileFrame>
      <div className="flex flex-col items-center pt-2">
        <Brand size={44} />
      </div>
      <div className="mt-6 rounded-3xl border border-primary/25 bg-card/60 p-6 glow-soft">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={22} />
          <h1 className="text-2xl font-bold">Welcome to Etherox</h1>
        </div>
        <p className="text-muted-foreground mt-1">Create an account to get started</p>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <Field label="Full Name">
            <UserIcon size={18} className="text-muted-foreground" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Full Name" className="flex-1 bg-transparent outline-none" />
          </Field>
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
          <Field label="Referral Code (optional)">
            <Gift size={18} className="text-muted-foreground" />
            <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="ENTER REFERRAL CODE" className="flex-1 bg-transparent outline-none uppercase" />
          </Field>

          <label className="flex items-start gap-3 text-sm">
            <button type="button" onClick={() => setAgree(!agree)} className={`mt-0.5 size-5 rounded-full border-2 ${agree ? "bg-primary border-primary" : "border-primary/50"}`} />
            <span className="text-muted-foreground">
              By continuing, you agree to Etherox's <span className="text-primary">Terms of Service</span> and <span className="text-primary">Privacy Policy</span>
            </span>
          </label>

          <button className="w-full rounded-2xl bg-primary text-primary-foreground font-bold py-4 glow-primary">Create Account</button>
        </form>

        <Divider />

        <button onClick={() => toast("Google sign-in coming soon")} className="w-full rounded-2xl bg-white text-black font-semibold py-3.5 flex items-center justify-center gap-3 glow-soft">
          <GoogleG /> Continue with Google
        </button>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/signin" className="text-primary font-semibold">Sign in</Link>
        </p>
      </div>
    </MobileFrame>
  );
}