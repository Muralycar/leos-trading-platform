import { WhatsAppIcon } from "@/components/ui/Icons";
import { SITE_SETTINGS } from "@/lib/placeholder-data";

export function CtaBanner() {
  return (
    <section className="border-y border-line bg-bg-1">
      <div className="wrap flex flex-col items-start justify-between gap-6 py-16 min-[901px]:flex-row min-[901px]:items-center min-[901px]:py-16">
        <h2 className="max-w-[14ch]">
          Can&apos;t find your part number?
          <br />
          Send it to us.
        </h2>
        <div className="flex flex-shrink-0 gap-3.5">
          <a href={`https://wa.me/${SITE_SETTINGS.whatsappNumber}`} target="_blank" rel="noreferrer" className="btn btn-wa">
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp Us
          </a>
          <a href="/sourcing#request" className="btn btn-primary">
            Request a Part
          </a>
        </div>
      </div>
    </section>
  );
}
