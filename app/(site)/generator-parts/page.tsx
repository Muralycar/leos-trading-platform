import { redirect } from "next/navigation";

// Keep the original route useful for existing visitors and search results while
// consolidating generator-parts SEO signals on the new, comprehensive landing page.
export default function GeneratorPartsPage() {
  redirect("/generator-spare-parts-uae");
}
