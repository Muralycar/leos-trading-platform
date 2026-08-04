// Server-only. RESEND_API_KEY has no NEXT_PUBLIC_ prefix, so Next.js never
// bundles it into client JS — never import this file from a Client
// Component. Lazily constructed so a missing key fails loudly at send time
// with a clear message, not at module-load time for every page that
// happens to import something from lib/email.
import { Resend } from "resend";

let client: Resend | null = null;

export function getResendClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

export function getQuotationFromAddress(): string {
  return process.env.QUOTATION_FROM_EMAIL || "quotations@leosdubai.com";
}

export function getQuotationReplyToAddress(): string {
  return process.env.QUOTATION_REPLY_TO_EMAIL || "trade@leosdubai.com";
}
