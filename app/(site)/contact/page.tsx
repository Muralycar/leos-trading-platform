import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { RfqForm } from "@/components/rfq/RfqForm";
import { LocationIcon, PhoneIcon, WhatsAppIcon, MailIcon } from "@/components/ui/Icons";
import { getSiteSettings } from "@/lib/data/inventory";
import { waLink, mailtoLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact — Leos Trading FZE",
  description: "Contact Leos Trading FZE — Sharjah, UAE. Phone, WhatsApp, email and request-a-quotation form.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const phoneHref = `tel:${settings.phonePrimary.replace(/\s+/g, "")}`;

  const lines = [
    { icon: LocationIcon, label: "Address", value: <>{settings.address}</> },
    { icon: PhoneIcon, label: "Phone", value: <>{settings.phonePrimary} / {settings.phoneSecondary}</> },
    {
      icon: WhatsAppIcon,
      label: "WhatsApp",
      value: (
        <a href={waLink(settings)} target="_blank" rel="noreferrer" className="hover:text-brass">
          {settings.phonePrimary}
        </a>
      ),
    },
    {
      icon: MailIcon,
      label: "Email",
      value: (
        <a href={mailtoLink(settings)} className="hover:text-brass">
          {settings.email}
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
            <p className="max-w-[42ch] text-[12.5px] text-text-2">
              Calling, WhatsApp, and email open your own app directly — for a request our team logs and tracks, use the form.
            </p>
          </div>
          <div className="rounded-m border border-line bg-bg-1 p-8">
            <RfqForm variant="contact" />
          </div>
        </div>
      </section>
    </>
  );
}
