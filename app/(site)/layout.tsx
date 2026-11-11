import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { ORGANIZATION_JSON_LD, WEBSITE_JSON_LD, jsonLdHtml } from "@/lib/seo";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Site-wide entity data, so every page (not just the homepage) identifies who publishes it. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml([ORGANIZATION_JSON_LD, WEBSITE_JSON_LD])} />
      <Header />
      {children}
      <Footer />
    </>
  );
}
