// Rendered server-side by Resend itself (resend.emails.send({ react: ... })
// — the "official" approach, no separate build step). Plain HTML tags in a
// table-based layout with inline styles only: the standard, most
// email-client-compatible way to hand-roll HTML email (flexbox/grid and
// external stylesheets are unreliable across Outlook/Gmail/etc). JSX
// escapes every interpolated string automatically, so customer-supplied
// text (name, company, notes) can never break out of the markup.
//
// Brass gold approximated to a plain hex value here — email clients don't
// support the site's oklch() color function.
const BRASS = "#b8935a";
const INK = "#181818";
const MUTED = "#6b6b6b";
const BORDER = "#e4e4e4";

export interface QuotationEmailProps {
  customerName: string;
  companyName: string | null;
  quotationNumber: string;
  revisionLabel: string;
  quotationDate: string;
  validUntil: string | null;
  currency: string | null;
  grandTotal: string;
  incoterm: string | null;
  deliveryTerms: string | null;
  paymentTerms: string | null;
  quotationLink: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <tr>
      <td style={{ padding: "6px 0", color: MUTED, fontSize: 13, width: 160 }}>{label}</td>
      <td style={{ padding: "6px 0", color: INK, fontSize: 13, fontWeight: 600 }}>{value}</td>
    </tr>
  );
}

export function QuotationEmail(props: QuotationEmailProps) {
  return (
    <html>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f5f5f3", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#f5f5f3", padding: "32px 16px" }}>
          <tr>
            <td align="center">
              <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 560, backgroundColor: "#ffffff", borderRadius: 6, overflow: "hidden" }}>
                <tr>
                  <td style={{ padding: "28px 32px", borderBottom: `3px solid ${BRASS}` }}>
                    <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: BRASS, fontWeight: 700 }}>
                      Leos Trading FZE
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "28px 32px 8px" }}>
                    <p style={{ fontSize: 14, color: INK, margin: "0 0 12px" }}>
                      Dear {props.customerName}
                      {props.companyName ? ` (${props.companyName})` : ""},
                    </p>
                    <p style={{ fontSize: 14, color: INK, margin: "0 0 20px", lineHeight: 1.6 }}>
                      Thank you for the opportunity to quote. Please find your quotation{" "}
                      <strong>{props.revisionLabel}</strong> summarized below.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "0 32px" }}>
                    <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: "4px 0" }}>
                      <Row label="Quotation Number" value={props.revisionLabel} />
                      <Row label="Quotation Date" value={props.quotationDate} />
                      <Row label="Valid Until" value={props.validUntil} />
                      <Row label="Currency" value={props.currency} />
                      <Row label="Grand Total" value={props.currency ? `${props.currency} ${props.grandTotal}` : props.grandTotal} />
                      <Row label="Incoterm" value={props.incoterm} />
                      <Row label="Delivery Terms" value={props.deliveryTerms} />
                      <Row label="Payment Terms" value={props.paymentTerms} />
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "24px 32px 8px" }} align="center">
                    <a
                      href={props.quotationLink}
                      style={{
                        display: "inline-block",
                        backgroundColor: BRASS,
                        color: "#181300",
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: "none",
                        padding: "12px 28px",
                        borderRadius: 4,
                        letterSpacing: 0.5,
                      }}
                    >
                      View Full Quotation
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "20px 32px 0" }}>
                    <p style={{ fontSize: 13, color: MUTED, margin: "0 0 20px", lineHeight: 1.6 }}>
                      If you have any questions, simply reply to this email — we&apos;re happy to help.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "20px 32px 28px", borderTop: `1px solid ${BORDER}` }}>
                    <p style={{ fontSize: 12, color: MUTED, margin: "0 0 4px" }}>Leos Trading FZE</p>
                    <p style={{ fontSize: 12, color: MUTED, margin: "0 0 4px" }}>
                      {props.contactEmail} · {props.contactPhone}
                    </p>
                    <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{props.websiteUrl}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
