import { NextResponse } from "next/server";

// Backs every RFQ / Request-a-Part / Contact / search-no-result form.
// Supabase isn't started yet (Phase 2), so this validates and logs the
// enquiry server-side rather than persisting it — the endpoint is genuinely
// functional end-to-end (real request/response, no dead link), and is the
// one place Phase 3 swaps in an `rfq_enquiries` insert + email notification
// per Handoff/design_handoff_leos_trading/data-model.md and components.md.

const VALID_SOURCES = ["product_page", "sourcing_request", "contact", "search_no_result"] as const;
type RfqSource = (typeof VALID_SOURCES)[number];

interface RfqPayload {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  partNumber?: string;
  quantity?: string;
  message?: string;
  source: RfqSource;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPayload(body: unknown): body is RfqPayload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  if (typeof b.name !== "string" || b.name.trim().length === 0) return false;
  if (typeof b.email !== "string" || !EMAIL_RE.test(b.email.trim())) return false;
  if (typeof b.source !== "string" || !VALID_SOURCES.includes(b.source as RfqSource)) return false;
  return true;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json({ ok: false, error: "Name, a valid email, and source are required." }, { status: 400 });
  }

  console.log("[rfq_enquiry]", {
    receivedAt: new Date().toISOString(),
    name: body.name,
    company: body.company ?? null,
    email: body.email,
    phone: body.phone ?? null,
    partNumber: body.partNumber ?? null,
    quantity: body.quantity ?? null,
    message: body.message ?? null,
    source: body.source,
  });

  return NextResponse.json({ ok: true });
}
