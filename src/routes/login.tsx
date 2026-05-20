import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "./matches";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — Chettiar Connect" }] }),
  component: () => (
    <ComingSoon
      title="Sign In"
      subtitle="Email OTP login via Brevo is wired into the next phase. Stay tuned."
    />
  ),
});
