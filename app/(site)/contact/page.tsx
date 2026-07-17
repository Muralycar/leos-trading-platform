import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { RfqForm } from "@/components/rfq/RfqForm";
import { LocationIcon, PhoneIcon, WhatsAppIcon, MailIcon } from "@/components/ui/Icons";
import { SITE_SETTINGS } from "@/lib/placeholder-data";
import { waLink, mailtoLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact — Leos Trading FZE",
  description: "Contact Leos Trading FZE — Sharjah, UAE. Phone, WhatsApp, email and request-a-quotation form.",
};

export default function ContactPage() {
  const phoneHref = `tel:${SITE_SETTINGS.phonePrimary.replace(/\s+/g, "")}`;

  const lines = [
    { icon: LocationIcon, label: "Address", value: <>{SITE_SETTINGS.address}</> },
    { icon: PhoneIcon, label: "Phone", value: <>{SITE_SETTINGS.phonePrimary} / {SITE_SETTINGS.phoneSecondary}</> },
    {
      icon: WhatsAppIcon,
      label: "WhatsApp",
      value: (
        <a href={waLink()} target="_blank" rel="noreferrer" className="hover:text-brass">
          {SITE_SETTINGS.phonePrimary}
        </a>
      ),
    },
    {
      icon: MailIcon,
      label: "Email",
      value: (
        <a href={mailtoLink()} className="hover:text-brass">
          {SITE_SETTINGS.email}
        </a>
      ),
    },
  ];

  return (
    <>
      <PageHeader eyebrow="Contact" title="Talk to our team" />

      <section className="py-16">
        <div className="wrap grid grid-cols-1 gap-12 min-[901px]:grid-cols-[1fr_1.3fr] min-[901px]:gap-16">
          <div className="flex flex-col gap-6">
            {lines.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3.5">
                <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-brass" />
                <div>
                  <span className="mb-1 block font-mono text-[10.5px] uppercase tracking-[.06em] text-text-2">
                    {label}
                  </span>
                  <div className="text-[15px] text-text-1">{value}</div>
                </div>
              </div>
            ))}
            <a href={phoneHref} className="btn btn-ghost mt-2 w-fit">
              Call Now
            </a>
          </div>
          <div className="rounded-m border border-line bg-bg-1 p-8">
            <RfqForm variant="contact" />
          </div>
        </div>
      </section>
    </>
  );
}
