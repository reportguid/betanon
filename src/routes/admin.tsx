import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — ETHERUM" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});