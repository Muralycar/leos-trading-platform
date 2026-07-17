# Route Map

| Route | Type | Notes |
|---|---|---|
| `/` | Static + live data (ISR) | Homepage; stats/categories/featured parts pulled from DB at build/revalidate time |
| `/search` | Dynamic (client + server) | Query string driven (`?q=&cat=&brand=`); server action or API route does the actual filtered query |
| `/parts/[brand]/[sku]` | Dynamic, DB-driven | One page per published product; generate `generateStaticParams` from published products, `revalidate` on publish/update |
| `/brands` | Static + live data | Brand directory |
| `/brands/[brand]` | Dynamic, DB-driven | Brand landing page (build per `pages.md`) |
| `/categories/[category]` | Dynamic, DB-driven | Category landing page (build per `pages.md`) |
| `/products` | Static | Overview of all 6 (+N) top-level categories, mirrors homepage category grid |
| `/sourcing` | Static | Anchored sections; `#request` form posts to `/api/rfq` |
| `/export` | Static | |
| `/about` | Static | |
| `/contact` | Static | Contact form posts to `/api/rfq` with `source: 'contact'` |
| `/request-a-part` | Optional alias | Can be a redirect to `/sourcing#request`, or its own route if the client wants a dedicated URL for ads/SEO |
| `/admin` | Dynamic, auth-gated | Redirect to `/admin/login` if unauthenticated |
| `/admin/products`, `/admin/brands`, `/admin/categories`, `/admin/import`, `/admin/rfq`, `/admin/settings` | Dynamic, auth-gated | See `admin-spec.md` |
| `/api/search` | API route | Backs `/search`; also usable for a future autocomplete |
| `/api/rfq` | API route | All RFQ/Contact/Sourcing forms post here |
| `/api/admin/import/*` | API route(s), auth-gated | Upload, map, validate, preview, confirm — see `inventory-import-spec.md` |
| `/sitemap.xml` | Generated | Must include every published product/brand/category page; regenerate on publish |

Static pages (`/about`, `/export`, `/sourcing`, `/contact`, `/brands` shell) can be plain Server Components with hard-coded JSX copy from `pages.md` — only the *data-driven* fragments within them (brand directory, form target) need to be dynamic.
