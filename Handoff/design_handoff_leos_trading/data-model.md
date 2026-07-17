# Data Model

Normalized relational schema for Supabase Postgres. `?` = optional. Public = safe to expose via public API/queries (RLS allows anon read of published rows only); Private = admin/service-role only.

## brands
| Field | Type | Req | Public/Private | Notes |
|---|---|---|---|---|
| id | uuid pk | yes | public | |
| name | text unique | yes | public | e.g. "Kohler" |
| slug | text unique | yes | public | for `/brands/[brand]` |
| logo_url | text? | no | public | Supabase Storage path |
| description | text? | no | public | |
| industries | text[]? | no | public | e.g. ["Generator","Marine"] |
| seo_title | text? | no | public | |
| seo_description | text? | no | public | |
| status | enum(active,archived) | yes | public | |
| created_at | timestamptz | yes | private | |

## equipment_categories
| Field | Type | Req | Public/Private |
|---|---|---|---|
| id | uuid pk | yes | public |
| name | text unique | yes | public — e.g. "Generator Parts" |
| slug | text unique | yes | public |
| parent_id | uuid? fk→equipment_categories | no | public — allows sub-categories |

## product_categories (product-type taxonomy, distinct from equipment_categories)
| Field | Type | Req | Public/Private |
|---|---|---|---|
| id | uuid pk | yes | public |
| name | text unique | yes | public — e.g. "Filters", "Gaskets & Seals" |
| slug | text unique | yes | public |

## products
| Field | Type | Req | Public/Private | Example |
|---|---|---|---|---|
| id | uuid pk (internal SKU) | yes | public | `8f3a...` |
| brand_id | uuid fk→brands | yes | public | |
| equipment_category_id | uuid fk→equipment_categories | yes | public | |
| oem_part_number | text | yes* | public | `KH330560633` (*or internal SKU if OEM unknown) |
| oem_part_number_normalized | text generated | yes | private (index only) | uppercased, punctuation-stripped, for search/dupe check |
| description | text | yes | public | `Oil Filter` |
| equipment_make | text? | no | public | |
| equipment_model | text? | no | public | |
| application | text? | no | public | |
| condition | enum(genuine_oem,aftermarket,obsolete_dead_stock,used_serviceable)? | no | public | |
| country_of_origin | text? | no | public | |
| weight | numeric? | no | public | |
| dimensions | text? | no | public | |
| price | numeric? | no | private by default | only expose if client confirms public pricing |
| currency | text? | no | private | |
| min_order_qty | integer? | no | public | |
| public_notes | text? | no | public | |
| internal_notes | text? | no | private | |
| status | enum(draft,published,archived) | yes | — | gates all public visibility |
| created_at, updated_at | timestamptz | yes | private | |

## product_identifiers (alternative / superseded numbers — one-to-many)
| Field | Type | Req | Public/Private |
|---|---|---|---|
| id | uuid pk | yes | public |
| product_id | uuid fk→products | yes | public |
| identifier_type | enum(alternative,superseded,cross_reference) | yes | public |
| value | text | yes | public |
| value_normalized | text generated | yes | private (index) |

## product_category_map (many-to-many: a product may sit in multiple product_categories)
| product_id | uuid fk | equipment note: composite pk (product_id, product_category_id) |
| product_category_id | uuid fk |

## product_applications (many-to-many, optional)
| product_id | uuid fk |
| application | text — free text or fk to a controlled `applications` table if the client wants it structured later |

## inventory_batches (stock lots — supports multiple batches per product)
| Field | Type | Req | Public/Private |
|---|---|---|---|
| id | uuid pk | yes | private |
| product_id | uuid fk→products | yes | private |
| quantity | integer | yes | private (public sees the SUM via a view) |
| condition | text? | no | private |
| warehouse_location_id | uuid fk→warehouse_locations | no | private |
| bin_location | text? | no | private |
| arrival_date | date? | no | private |
| supplier_reference | text? | no | private — never public |
| purchase_reference | text? | no | private — never public |
| internal_cost | numeric? | no | private — never public |

Expose a Postgres **view** `product_public_availability` = `SUM(quantity)` + computed status (`in_stock` / `limited_stock` / `on_request`) per product — this view, not the batch table, is what public queries read.

## warehouse_locations
| id, name, address, is_active |

## product_media
| id, product_id fk, storage_path, alt_text, sort_order, is_primary |

## technical_documents
| id, product_id fk?, brand_id fk?, title, storage_path, is_public |

## import_jobs
| id, brand_id fk, uploaded_by fk→users, file_name, storage_path, status(pending,mapped,validated,previewed,imported,failed), row_count, created_at |

## import_templates (saved column mappings, reusable per brand/supplier)
| id, brand_id fk?, name, column_mapping jsonb, default_equipment_category_id fk?, created_by fk→users |

## import_rows (staging table before publish)
| id, import_job_id fk, raw_data jsonb, mapped_product_id fk? (once matched/created), validation_status(valid,duplicate,missing_required,unrecognized_category,unrecognized_brand,needs_review), error_notes text? |

## rfq_enquiries
| Field | Type | Req | Public/Private |
|---|---|---|---|
| id | uuid pk | yes | private |
| name | text | yes | private |
| company | text? | no | private |
| email | text | yes | private |
| phone | text? | no | private |
| whatsapp | text? | no | private |
| country | text? | no | private |
| brand | text? | no | private |
| part_number | text? | no | private |
| product_id | uuid fk→products? | no | private |
| quantity_required | text? | no | private |
| message | text? | no | private |
| attachment_url | text? | no | private |
| source | enum(product_page,sourcing_request,contact,search_no_result) | yes | private |
| status | enum(new,contacted,quoted,won,lost) | yes | private |
| created_at | timestamptz | yes | private |

## pages (lightweight CMS for static-ish copy on About/Export/Sourcing/Contact)
| id, slug, title, sections jsonb, seo_title, seo_description, updated_at |

## settings (singleton row)
| id, phone_primary, phone_secondary, whatsapp_number, email, address, site_title, default_meta_description |

## users / roles
| id (references Supabase auth.users), role enum(admin,editor,viewer), created_at |

## Duplicate Detection Rule
Unique constraint on `(brand_id, oem_part_number_normalized)`. On import, a row matching an existing pair is flagged `duplicate` in `import_rows` and the admin chooses an update behavior (skip / update all / update quantity only / add to quantity / update-if-empty / import as new batch / mark for review) per `inventory-import-spec.md`.
