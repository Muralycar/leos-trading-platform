// Server-side bot filter for public RFQ submissions (app/api/rfq/route.ts).
//
// Layers, cheapest first. Any hit means "bot" and the submission is dropped
// silently (the client still sees success, so bots get no signal to adapt):
//   1. Honeypot  — a visually hidden field humans never see or fill.
//   2. Timing    — the form must have been open for MIN_FILL_MS. Requests
//                  that skip the form entirely (direct POSTs) carry no
//                  timestamp at all and fail here too.
//   3. Interaction — at least one real keyboard/pointer/touch event on the form.
//   4. Content   — links in name/company, link-stuffed messages, and the
//                  stock SEO/crypto/marketing pitches bots send.

export const HONEYPOT_FIELD = "website_url";

const MIN_FILL_MS = 4_000;
const MAX_FORM_AGE_MS = 3 * 24 * 60 * 60 * 1000;

const URL_RE = /(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|net|org|info|xyz|top|ru|io|biz|online|site|shop)\b\S*/gi;
const EMAIL_IN_TEXT_RE = /\S+@\S+\.\S+/g;

const SPAM_PHRASES = new RegExp(
  [
    "\\bseo\\b",
    "backlinks?",
    "guest post",
    "search engine (optimi[sz]ation|ranking)",
    "first page of google",
    "rank(ing)? your (web)?site",
    "increase (your )?(website )?traffic",
    "web ?design (services|company)",
    "website (redesign|development) (services|offer)",
    "digital marketing (services|agency)",
    "lead generation",
    "social media marketing",
    "\\bcrypto(currency)?\\b",
    "\\bbitcoin\\b",
    "\\bforex\\b",
    "\\bcasino\\b",
    "\\bbetting\\b",
    "\\bviagra\\b",
    "\\bcialis\\b",
    "\\bporn",
    "\\bxxx\\b",
    "dating site",
    "business (loan|funding) (offer|approved)",
    "unsubscribe",
  ].join("|"),
  "i",
);

export interface SpamCheckInput {
  honeypot?: unknown;
  startedAt?: unknown;
  interacted?: unknown;
  name: string;
  company?: string;
  email: string;
  partNumber?: string;
  message?: string;
}

export type SpamVerdict =
  | { ok: true }
  | { ok: false; reason: string; /** true = tell the user (likely human); false = silent drop */ visible: boolean };

function countLinks(text: string | undefined): number {
  // Email addresses in a message are normal ("reply to x@y.com"), not links.
  return text ? (text.replace(EMAIL_IN_TEXT_RE, " ").match(URL_RE) ?? []).length : 0;
}

export function checkRfqSpam(input: SpamCheckInput, now = Date.now()): SpamVerdict {
  // 1. Honeypot
  if (typeof input.honeypot === "string" && input.honeypot.trim() !== "") {
    return { ok: false, reason: "honeypot", visible: false };
  }

  // 2. Timing
  const startedAt = typeof input.startedAt === "number" ? input.startedAt : Number.NaN;
  if (!Number.isFinite(startedAt)) return { ok: false, reason: "no_timestamp", visible: false };
  const elapsed = now - startedAt;
  if (elapsed < MIN_FILL_MS) return { ok: false, reason: "too_fast", visible: false };
  if (elapsed > MAX_FORM_AGE_MS) {
    // A real person who left the tab open for days — ask them to refresh.
    return { ok: false, reason: "stale_form", visible: true };
  }

  // 3. Interaction
  if (input.interacted !== true) return { ok: false, reason: "no_interaction", visible: false };

  // 4. Content
  const name = input.name.trim();
  if (name.length > 80 || countLinks(name) > 0) return { ok: false, reason: "bad_name", visible: false };
  if (countLinks(input.company) > 0) return { ok: false, reason: "link_in_company", visible: false };
  if (countLinks(input.message) + countLinks(input.partNumber) > 1) {
    return { ok: false, reason: "too_many_links", visible: false };
  }
  const text = [input.name, input.company, input.partNumber, input.message].filter(Boolean).join(" \n ");
  if (SPAM_PHRASES.test(text)) return { ok: false, reason: "spam_phrase", visible: false };

  return { ok: true };
}
