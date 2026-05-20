import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "./matches";

export const Route = createFileRoute("/stories")({
  head: () => ({ meta: [{ title: "Success Stories — Chettiar Connect" }] }),
  component: () => (
    <ComingSoon
      title="Success Stories"
      subtitle="Real Chettiar families sharing their journey. Full gallery coming soon."
    />
  ),
});
