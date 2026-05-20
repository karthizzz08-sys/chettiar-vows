import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "./matches";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register Free — Chettiar Connect" }] }),
  component: () => (
    <ComingSoon
      title="Register Free"
      subtitle="Full matrimonial profile with horoscope upload and family details — next phase."
    />
  ),
});
