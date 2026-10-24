import { SITE_URL } from "@/lib/site";

// One list feeds both the visible questions and the hidden FAQ label, so they always match.
const FAQS: { q: string; a: string }[] = [
  {
    q: "What does Leos Trading supply?",
    a: "OEM, aftermarket, obsolete and hard-to-find spare parts for trucks, construction equipment, generators, marine and industrial applications, plus new and used machinery, trucks and forklifts.",
  },
  {
    q: "Do you supply obsolete or hard-to-find parts?",
    a: "Yes. We specialise in discontinued part numbers and run a dead-stock and surplus acquisition program. If we don’t hold a part, our sourcing team searches our UAE and international network.",
  },
  {
    q: "Are your parts genuine OEM?",
    a: "Our stock is condition-graded as Genuine OEM, Surplus or Obsolete, and we also supply quality aftermarket parts. Condition and exact fitment are confirmed when we send your quotation. Leos Trading is an independent supplier and is not an authorized distributor unless stated.",
  },
  {
    q: "Which countries do you export to?",
    a: "The GCC and wider Gulf, East Africa, West Africa, Southern Africa, Europe, Asia and North America. Typical dispatch is 48–72 hours once a quote is confirmed, for destinations in the MEA region.",
  },
  {
    q: "How do I request a quotation?",
    a: "Send the part number or your equipment details through the request form, WhatsApp (+971 50 848 9640) or email (trade@leosdubai.com). We reply with pricing, lead time and export documentation.",
  },
  {
    q: "Where is Leos Trading based?",
    a: "Our registered office is in Sharjah (SRTIP), with an office in Dubai (612 Al Kaabi, Al Nahda 1).",
  },
  {
    q: "Which brands do you supply?",
    a: "Live stock is Iveco, Kobelco and Kohler. We source parts for many more, including Caterpillar, Komatsu, Yanmar, MAN, Scania, Mercedes-Benz, John Deere, Parker, SKF, Bosch, Fleetguard and Donaldson.",
  },
  {
    q: "Do you supply machinery?",
    a: "Yes: new and used construction machinery, heavy trucks and forklifts, in stock or found to your specification. Brands include Komatsu, Caterpillar, Tadano, Volvo, Iveco, Renault, Toyota and Linde.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export function FaqSection() {
  return (
    <section className="border-t border-line bg-bg-1 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <div className="wrap max-w-[860px]">
        <div className="eyebrow">FAQ</div>
        <h2 className="mt-3 text-[28px]">Frequently asked questions</h2>
        <div className="mt-8 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="rounded-m border border-line bg-bg-0 px-5 py-4">
              <summary className="cursor-pointer text-[16px] font-medium">{f.q}</summary>
              <p className="mt-3 text-[15px] text-text-1">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
