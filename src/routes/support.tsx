import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherox/MobileFrame";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — BETANO" }] }),
  component: Support,
});

function Support() {
  return (
    <MobileFrame>
      <header className="flex items-center gap-4">
        <Link to="/dashboard" className="grid place-items-center size-11 rounded-full bg-card border border-border"><ArrowLeft size={18} /></Link>
        <h1 className="text-xl font-bold">Support</h1>
      </header>

      <div className="mt-6 space-y-3">
        <a href="mailto:support@betano.app" className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-card/50 p-4">
          <Mail className="text-primary" />
          <div>
            <div className="font-semibold">Email us</div>
            <div className="text-sm text-muted-foreground">support@betano.app</div>
          </div>
        </a>
        <button className="w-full flex items-center gap-3 rounded-2xl border border-primary/25 bg-card/50 p-4 text-left">
          <MessageCircle className="text-primary" />
          <div>
            <div className="font-semibold">Live chat</div>
            <div className="text-sm text-muted-foreground">Average reply under 2 minutes</div>
          </div>
        </button>
      </div>
    </MobileFrame>
  );
}