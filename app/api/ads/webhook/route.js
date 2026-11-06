import { fail } from "@/lib/http";

export async function POST() {
  return fail("Live payment webhooks are disabled. EventVerse is configured for demo payments only.", 410);
}
