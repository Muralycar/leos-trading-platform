import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Staff area, API routes, private quotation links and internal search results stay out of search.
        disallow: ["/admin/", "/api/", "/quotation/", "/search"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
