import { permanentRedirect } from "next/navigation";

// Keep the original route useful for existing visitors and search results while
// consolidating generator-parts SEO signals on the new, comprehensive landing page.
// Permanent (308), so search engines transfer the old URL to the new one.
export default function GeneratorPartsPage() {
  permanentRedirect("/generator-spare-parts-uae");
}
