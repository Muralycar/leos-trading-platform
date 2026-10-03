import { NextResponse } from "next/server";
import { createAnonSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { checkRfqSpam, HONEYPOT_FIELD } from "@/lib/rfq/spam-guard";

// Backs every RFQ / Request-a-Part / Contact / search-no-result form.
// Persists to rfq_enquiries via the anon-key client — RLS's "anyone can
// submit an rfq" insert policy (0001_init_schema.sql) is what allows this
// without a session, same as any other public write in this app never uses
// the service-role client. Email notification (RESEND_API_KEY) is a
// documented fast-follow, not required for persistence itself.

const VALID_SOURCES = ["product_page", "sourcing_request", "contact", "search_no_result", "machinery"] as const;
type RfqSource = (typeof VALID_SOURCES)[number];

interface RfqPayload {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  country?: string;
  brand?: string;
  partNumber?: string;
  quantity?: string;
  message?: string;
  source: RfqSource;
  startedAt?: number;
  interacted?: boolean;
  [HONEYPOT_FIELD]?: string;
}

// Same email submitting more than this many times in the window = flood.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPayload(body: unknown): body is RfqPayload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  if (typeof b.name !== "string" || b.name.trim().length === 0) return false;
  if (typeof b.email !== "string" || !EMAIL_RE.test(b.email.trim())) return false;
  if (typeof b.source !== "string" || !VALID_SOURCES.includes(b.source as RfqSource)) return false;
  return true;
}

function nullIfEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
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

  const verdict = checkRfqSpam({
    honeypot: body[HONEYPOT_FIELD],
    startedAt: body.startedAt,
    interacted: body.interacted,
    name: body.name,
    company: body.company,
    email: body.email,
    partNumber: body.partNumber,
    message: body.message,
  });
  if (!verdict.ok) {
    console.warn(`[rfq_enquiry] blocked: ${verdict.reason}`);
    if (verdict.visible) {
      return NextResponse.json(
        { ok: false, error: "This form has expired. Please refresh the page and try again." },
        { status: 400 },
      );
    }
    // Pretend success so bots get no signal to adapt.
    return NextResponse.json({ ok: true });
  }

  // Service-role client when configured (lets the public anon INSERT policy
  // be closed — see migrations/0016), anon client as a fallback.
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const supabase = hasServiceRole ? createServiceRoleClient() : createAnonSupabaseClient();

  if (hasServiceRole) {
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from("rfq_enquiries")
      .select("id", { count: "exact", head: true })
      .eq("email", body.email.trim())
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      console.warn("[rfq_enquiry] blocked: rate_limit");
      return NextResponse.json({ ok: true });
    }
  }

  const { error } = await supabase.from("rfq_enquiries").insert({
    name: body.name.trim(),
    company: nullIfEmpty(body.company),
    email: body.email.trim(),
    phone: nullIfEmpty(body.phone),
    whatsapp: nullIfEmpty(body.whatsapp),
    country: nullIfEmpty(body.country),
    brand: nullIfEmpty(body.brand),
    part_number: nullIfEmpty(body.partNumber),
    quantity_required: nullIfEmpty(body.quantity),
    message: nullIfEmpty(body.message),
    source: body.source,
  });

  if (error) {
    console.error("[rfq_enquiry] insert failed", error);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
