import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "./matches";

export const Route = createFileRoute("/sangam")({
  head: () => ({ meta: [{ title: "Chettiar Sangam Directory" }] }),
  component: () => (
    <ComingSoon
      title="Chettiar Sangam"
      subtitle="Community directory with direct registration — no OTP needed. Coming next."
    />
  ),
});
