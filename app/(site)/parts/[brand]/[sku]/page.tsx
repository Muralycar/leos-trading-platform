import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProductParams, getProductByBrandAndSku, getRelatedProducts, getSiteSettings } from "@/lib/data/inventory";
import { waLink, mailtoLink } from "@/lib/whatsapp";
import { AVAILABILITY_LABEL } from "@/lib/types";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Breadcrumb } from "@/components/product/Breadcrumb";
import { Gallery } from "@/components/product/Gallery";
import { SpecTable } from "@/components/product/SpecTable";
import { RelatedParts } from "@/components/product/RelatedParts";
import { RfqForm } from "@/components/rfq/RfqForm";

interface PageProps {
  params: Promise<{ brand: string; sku: string }>;
}

export async function generateStaticParams() {
  return getAllProductParams();
}

function descriptionSentence(brand: string): string {
  return `Real stock item from Leos Trading's ${brand} inventory — condition and exact fitment confirmed at RFQ stage.`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand, sku } = await params;
  const product = await getProductByBrandAndSku(brand, sku);
  if (!product) return {};
  return {
    title: `${product.oemPartNumber} — ${product.description} | ${product.brandName} | Leos Trading FZE`,
    description: descriptionSentence(product.brandName),
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { brand, sku } = await params;
  const product = await getProductByBrandAndSku(brand, sku);
  if (!product) notFound();

  const [related, settings] = await Promise.all([getRelatedProducts(product, 4), getSiteSettings()]);
  const desc = descriptionSentence(product.brandName);
  const waMessage = `Inquiry — Part Number ${product.oemPartNumber} (${product.description})`;

  return (
    <>
      <div className="wrap pt-6">
        <Breadcrumb
          categoryName={product.equipmentCategoryName}
          categorySlug={product.equipmentCategorySlug}
          brandName={product.brandName}
          brandSlug={product.brandSlug}
          sku={product.oemPartNumber}
        />
      </div>

      <div className="wrap grid grid-cols-1 gap-10 py-10 min-[901px]:grid-cols-2 min-[901px]:gap-16 min-[901px]:py-12">
        <Gallery imagePath={product.imagePath} description={product.description} />

        <div>
          <div className="mb-4 flex flex-wrap gap-2.5">
            <span className="tag">{product.brandName}</span>
            <span className="tag">{product.equipmentCategoryName}</span>
            <AvailabilityBadge quantity={product.quantity} />
          </div>
          <div className="font-mono text-[15px] text-brass">{product.oemPartNumber}</div>
          <h1 className="mt-2 text-[clamp(26px,3vw,38px)]">{product.description}</h1>
          <p className="mt-3.5 text-[15px]">{desc}</p>

          <SpecTable
            rows={[
              { label: "Brand", value: product.brandName },
              {
                label: "Category",
                value: `${product.equipmentCategoryName} — ${product.productCategoryName ?? "General Hardware"}`,
              },
              {
                label: "Available Quantity",
                value:
                  product.status === "on_request"
                    ? AVAILABILITY_LABEL.on_request
                    : `${product.quantity} unit${product.quantity === 1 ? "" : "s"}`,
              },
            ]}
          />

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#rfq" className="btn btn-primary">
              Request Quotation
            </a>
            <a href={waLink(settings, waMessage)} target="_blank" rel="noreferrer" className="btn btn-wa">
              <WhatsAppIcon className="h-3.5 w-3.5" />
              WhatsApp Inquiry
            </a>
            <a href={mailtoLink(settings, `RFQ — ${product.oemPartNumber}`)} className="btn btn-ghost">
              Email Inquiry
            </a>
          </div>

          <div className="mt-6 rounded-m border border-line bg-bg-1 px-5 py-4 text-sm text-text-1">
            <span className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[.06em] text-brass">
              Technical Notes
            </span>
            Condition and exact fitment confirmed at RFQ stage — send your equipment serial number for cross-reference.
          </div>

          <details className="mt-10 rounded-m border border-dashed border-line-strong px-5 py-4">
            <summary className="cursor-pointer font-mono text-[11.5px] uppercase tracking-[.06em] text-text-2">
              Page SEO Metadata
            </summary>
            <div className="mt-4 flex flex-col gap-2.5 text-[13px]">
              <div>
                <span className="block font-mono text-[10.5px] uppercase text-text-2">Meta Title</span>
                <p className="text-text-0">
                  {product.oemPartNumber} — {product.description} | {product.brandName} | Leos Trading FZE
                </p>
              </div>
              <div>
                <span className="block font-mono text-[10.5px] uppercase text-text-2">Meta Description</span>
                <p className="text-text-0">{desc}</p>
              </div>
              <div>
                <span className="block font-mono text-[10.5px] uppercase text-text-2">URL Slug</span>
                <p className="text-text-0">
                  /parts/{product.brandSlug}/{product.oemPartNumber.toLowerCase()}
                </p>
              </div>
            </div>
          </details>
        </div>
      </div>

      <section className="py-16">
        <div className="wrap">
          <div className="mb-8">
            <div className="eyebrow">Related Parts</div>
            <h2 className="mt-3 text-[28px]">Same category</h2>
          </div>
          <RelatedParts products={related} />
        </div>
      </section>

      <section id="rfq" className="border-t border-line bg-bg-1">
        <div className="wrap grid grid-cols-1 gap-10 py-16 min-[901px]:grid-cols-[1fr_1.3fr] min-[901px]:gap-14">
          <div className="min-[901px]:sticky min-[901px]:top-24 min-[901px]:self-start">
            <div className="eyebrow">Request Quotation</div>
            <h2 className="mt-3.5 text-[32px]">Send us the part number or equipment details</h2>
            <p className="mt-4 text-[15px]">
              Availability subject to confirmation. Our team responds with pricing, lead time and export documentation.
            </p>
            <div className="mt-5 font-mono text-[13px] text-brass">
              RE: {product.oemPartNumber} — {product.description}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={waLink(settings, waMessage)} target="_blank" rel="noreferrer" className="btn btn-wa btn-sm">
                <WhatsAppIcon className="h-3.5 w-3.5" />
                WhatsApp Inquiry
              </a>
              <a href={mailtoLink(settings, `RFQ — ${product.oemPartNumber}`)} className="btn btn-ghost btn-sm">
                Email Inquiry
              </a>
            </div>
          </div>
          <div className="rounded-m border border-line bg-bg-0 p-8">
            <RfqForm variant="product" prefillPartNumber={product.oemPartNumber} />
          </div>
        </div>
      </section>
    </>
  );
}
