"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/admin/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQuotationById, changeQuotationStatus } from "@/lib/admin/quotations";
import { createQuotationAccessToken, listQuotationAccessTokens, revokeQuotationAccessToken } from "@/lib/quotations/customer-access";
import { getSiteSettings } from "@/lib/data/inventory";
import { getResendClient, getQuotationFromAddress, getQuotationReplyToAddress } from "@/lib/email/resend-client";
import { QuotationEmail } from "@/lib/email/QuotationEmail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENDABLE_STATUSES = new Set(["approved", "sent"]);

export interface SendQuotationResult {
  ok: boolean;
  error?: string;
}

/**
 * Sends (or resends) the current quotation revision to its customer email.
 * A partial unique index on quotation_email_log (one 'queued' row per
 * quotation) is the actual duplicate-send guard — independent of the
 * status field, since status only flips to 'sent' after Resend confirms
 * success, per "keep the previous status if sending fails."
 */
export async function sendQuotationEmailAction(quotationId: string): Promise<SendQuotationResult> {
  const profile = await requireRole("admin");

  const quotation = await getQuotationById(quotationId);
  if (!quotation) return { ok: false, error: "Quotation not found." };
  if (!SENDABLE_STATUSES.has(quotation.status)) {
    return { ok: false, error: "Only an approved (or already-sent) quotation can be emailed to the customer." };
  }
  if (!EMAIL_RE.test(quotation.customerEmail)) {
    return { ok: false, error: "This quotation has no valid customer email on file." };
  }

  const subject = `Quotation ${quotation.quotationNumber} from Leos Trading FZE`;
  const from = getQuotationFromAddress();
  const replyTo = getQuotationReplyToAddress();

  const supabase = await createServerSupabaseClient();
  const { data: logRow, error: logInsertError } = await supabase
    .from("quotation_email_log")
    .insert({
      quotation_id: quotationId,
      quotation_revision: quotation.revision,
      recipient: quotation.customerEmail,
      sender: from,
      subject,
      provider: "resend",
      delivery_status: "queued",
      sent_by: profile.id,
      sent_by_email: profile.email || null,
    })
    .select("id")
    .single();

  if (logInsertError) {
    if (logInsertError.code === "23505") {
      return { ok: false, error: "A send is already in progress for this quotation. Please wait." };
    }
    return { ok: false, error: "Could not start the send." };
  }

  try {
    const token = await createQuotationAccessToken(quotationId, quotation.validUntil, profile.id, profile.email || null);
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
    const quotationLink = `${siteUrl}/quotation/${token}`;

    const settings = await getSiteSettings();

    const resend = getResendClient();
    const { data: sendResult, error: sendError } = await resend.emails.send({
      from: `Leos Trading FZE <${from}>`,
      to: quotation.customerEmail,
      replyTo,
      subject,
      react: (
        <QuotationEmail
          customerName={quotation.customerName}
          companyName={quotation.companyName}
          quotationNumber={quotation.quotationNumber}
          revisionLabel={quotation.revisionLabel}
          quotationDate={quotation.quotationDate}
          validUntil={quotation.validUntil}
          currency={quotation.currency}
          grandTotal={quotation.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          incoterm={quotation.incoterm}
          deliveryTerms={quotation.deliveryTerms}
          paymentTerms={quotation.paymentTerms}
          quotationLink={quotationLink}
          contactEmail={settings.email}
          contactPhone={settings.phonePrimary}
          websiteUrl={process.env.NEXT_PUBLIC_SITE_URL || "https://www.leosdubai.com"}
        />
      ),
    });

    if (sendError) throw new Error(sendError.message);

    await supabase
      .from("quotation_email_log")
      .update({ delivery_status: "sent", provider_message_id: sendResult?.id ?? null, sent_at: new Date().toISOString() })
      .eq("id", logRow.id);

    await supabase.from("quotation_activity").insert({
      quotation_id: quotationId,
      event_type: "email_sent",
      actor_id: profile.id,
      actor_email: profile.email || null,
      details: { recipient: quotation.customerEmail, subject },
    });

    if (quotation.status === "approved") {
      await changeQuotationStatus(quotationId, "sent", profile.id, profile.email || null);
    }

    revalidatePath(`/admin/quotations/${quotationId}`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong sending the email.";

    await supabase.from("quotation_email_log").update({ delivery_status: "failed", error_message: message }).eq("id", logRow.id);

    await supabase.from("quotation_activity").insert({
      quotation_id: quotationId,
      event_type: "email_failed",
      actor_id: profile.id,
      actor_email: profile.email || null,
      details: { recipient: quotation.customerEmail, error: message },
    });

    revalidatePath(`/admin/quotations/${quotationId}`);
    return { ok: false, error: message };
  }
}

export async function listQuotationAccessTokensAction(quotationId: string) {
  await requireRole("admin");
  return listQuotationAccessTokens(quotationId);
}

export async function revokeQuotationAccessTokenAction(tokenId: string, quotationId: string): Promise<void> {
  await requireRole("admin");
  await revokeQuotationAccessToken(tokenId);
  revalidatePath(`/admin/quotations/${quotationId}`);
}
