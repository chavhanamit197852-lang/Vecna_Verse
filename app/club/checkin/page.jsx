import { redirect } from "next/navigation";

// Legacy route — the role-aware scanner lives at /club/scanner.
export default function LegacyCheckin() {
  redirect("/club/scanner");
}
