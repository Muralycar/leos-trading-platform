# Image Asset Map & Real Inventory Examples

## Image Asset Map
Full per-image photography analysis (composition/lighting/sharpness/background/branding + recommendation) already lives in `source/brand-guidelines.html` (`#photography` section) — treat that as the authoritative enhancement guide. Summary by usage slot:

| Slot | Page(s) | Recommended source | Aspect | Notes |
|---|---|---|---|---|
| Hero background | Homepage | Placeholder (`image-slot`) until real warehouse photography exists | full-bleed, `cover` | Dark scrim gradient overlays it — see `.hero-scrim` in `styles.css` |
| Category tile — Generator Parts | Homepage, Products | `assets/kohler-command-pro.png` (re-graded per guidelines, currently used as-is) | 4:3 in a fixed-height media box | |
| Category tiles — Truck/Equipment/Mining/Marine/Tyres | Homepage, Products | Placeholder | 4:3 | No client photography yet for these categories |
| Product gallery | Product detail | Real photo when it exists and carries no conflicting printed part number (see rule below); else placeholder | square | |
| Warehouse/operations imagery | About, Export, Sourcing | Placeholder | 4:3 | Excluded stock photos explained below |
| Brand logos | Brands, header, footer | `assets/logo-crest.png` (Leos own crest) — third-party brand logos (Kohler, Iveco, etc.) are NOT bundled; source official brand marks with permission before using them anywhere | — | |

**Critical rule carried over from design QA**: never pair a real product photo with a database record if the photo has a printed part number visible on it that differs from that record's SKU — that's actively misleading, worse than a placeholder. Several supplied photos (a fuel-filter jug printed "GM41469", a PCB board printed "E184323") were deliberately kept as generic category-level imagery rather than pinned to any specific SKU, because those exact numbers don't exist in the real spreadsheets.

## Excluded Source Images (do not use publicly)
- Two "warehouse" stock photos showing a home-appliance/refrigerator warehouse with visible competing brands (LG, Zephyr, Liebherr) — wrong business entirely.
- Kohler "Genuine Parts" brochure scan, Kobelco/Iveco marketing collateral, a generic tire lineup, a boat-parts diagram, a "Parts of Generator" infographic — all third-party marketing/stock graphics, not Leos-owned photography.
- A router/power-tool product photo among the uploads — unrelated to the business, exclude.

## Real Inventory Examples (from client spreadsheets — do not extend or invent further without new source data)
Curated in `source/data.js` (`LEOS_PARTS`), ~21 records sampled from the client's real stock files:
- **Kohler** (329 SKUs total in source file) — e.g. `KH330560633` Oil Filter (qty 86), `KH267373` Sea Water Pump (qty 1, paired with the one clean matching photo).
- **Iveco** (1,614 SKUs total) — e.g. `42127244` Wheel Pin (qty 1,540), `1907570` Oil Filter Cartridge (qty 254).
- **Kobelco** (313 SKUs total) — e.g. `KOYN24E00016S005` Fuse (qty 58), `KO2405P482` Bush (qty 10).
- **Toyota** (1 SKU, added to prove the model isn't hard-coded to the launch 3 brands) — `90915-YZZD2` Oil Filter, qty 24.

Full spreadsheets (2,256+ real rows) are with the client — request them directly for the production import rather than re-deriving from this sample. Aggregate stats shown site-wide (2,256+ SKUs, ~20,000 units, 3 live brands) were computed from the real files, not estimated.
