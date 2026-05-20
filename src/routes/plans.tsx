import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "./matches";

export const Route = createFileRoute("/plans")({
  head: () => ({ meta: [{ title: "Membership Plans — Chettiar Connect" }] }),
  component: () => (
    <ComingSoon
      title="Membership Plans"
      subtitle="Free, Classic, and Royal Chettiar tiers — checkout flow coming with auth."
    />
  ),
});
