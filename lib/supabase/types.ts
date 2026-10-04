// Hand-authored to match supabase/migrations/0001_init_schema.sql exactly.
// Once a live project exists, regenerate with `supabase gen types typescript`
// and diff against this file — this hand-written version is what every
// Phase 3 query is written against until then.
//
// `Relationships: []` on every table/view and `Functions` on the schema are
// required by @supabase/postgrest-js's GenericSchema/GenericTable/GenericView
// constraints (see node_modules/@supabase/postgrest-js/dist/index.d.mts) —
// omitting them makes every .from(...).select(...) result type collapse to
// `never` instead of erroring loudly, so don't drop them even though this
// project doesn't use the relationship-based nested-select feature.

export type ProductStatus = "draft" | "published" | "archived";
export type ProductCondition = "genuine_oem" | "aftermarket" | "obsolete_dead_stock" | "used_serviceable";
export type BrandStatus = "active" | "archived";
export type IdentifierType = "alternative" | "superseded" | "cross_reference";
export type RfqSource = "product_page" | "sourcing_request" | "contact" | "search_no_result";
export type RfqStatus =
  | "new"
  | "reviewing"
  | "waiting_supplier"
  | "quotation_preparation"
  | "quotation_ready"
  | "sent"
  | "accepted"
  | "revision_requested"
  | "lost"
  | "closed";
export type ImportJobStatus =
  | "pending"
  | "mapped"
  | "validated"
  | "previewed"
  | "imported"
  | "failed"
  | "cancelled"
  | "rolled_back";
export type ImportRowStatus =
  | "valid"
  | "duplicate"
  | "missing_required"
  | "unrecognized_category"
  | "unrecognized_brand"
  | "needs_review";
export type ImportRowOutcome = "create" | "update" | "unchanged" | "skip" | "needs_review" | "error";
export type UserRole = "admin" | "editor" | "viewer";
export type AvailabilityStatus = "in_stock" | "limited_stock" | "out_of_stock";
export type ListingDraftStatus = "draft" | "reviewed" | "approved" | "published";
export type QuotationStatus =
  | "draft"
  | "under_review"
  | "approved"
  | "sent"
  | "accepted"
  | "revision_requested"
  | "rejected"
  | "expired"
  | "cancelled";
export type QuotationActivityType =
  | "quotation_created"
  | "quotation_updated"
  | "status_changed"
  | "revision_created"
  | "line_added"
  | "line_removed"
  | "email_sent"
  | "email_failed";
export type QuotationEmailStatus = "queued" | "sent" | "delivered" | "bounced" | "failed";

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          description: string | null;
          industries: string[] | null;
          seo_title: string | null;
          seo_description: string | null;
          status: BrandStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          description?: string | null;
          industries?: string[] | null;
          seo_title?: string | null;
          seo_description?: string | null;
          status?: BrandStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["brands"]["Insert"]>;
        Relationships: [];
      };
      equipment_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["equipment_categories"]["Insert"]>;
        Relationships: [];
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_categories"]["Insert"]>;
        Relationships: [];
      };
      warehouse_locations: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["warehouse_locations"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      import_jobs: {
        Row: {
          id: string;
          brand_id: string | null;
          equipment_category_id: string | null;
          uploaded_by: string | null;
          file_name: string;
          file_checksum: string | null;
          storage_path: string;
          status: ImportJobStatus;
          row_count: number | null;
          report: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_id?: string | null;
          equipment_category_id?: string | null;
          uploaded_by?: string | null;
          file_name: string;
          file_checksum?: string | null;
          storage_path: string;
          status?: ImportJobStatus;
          row_count?: number | null;
          report?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["import_jobs"]["Insert"]>;
        Relationships: [];
      };
      import_templates: {
        Row: {
          id: string;
          brand_id: string | null;
          name: string;
          column_mapping: Record<string, unknown>;
          default_equipment_category_id: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          brand_id?: string | null;
          name: string;
          column_mapping: Record<string, unknown>;
          default_equipment_category_id?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["import_templates"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          brand_id: string;
          equipment_category_id: string;
          oem_part_number: string;
          oem_part_number_normalized: string;
          description: string;
          equipment_make: string | null;
          equipment_model: string | null;
          application: string | null;
          condition: ProductCondition | null;
          country_of_origin: string | null;
          weight: number | null;
          dimensions: string | null;
          price: number | null;
          currency: string | null;
          min_order_qty: number | null;
          public_notes: string | null;
          internal_notes: string | null;
          status: ProductStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          equipment_category_id: string;
          oem_part_number: string;
          description: string;
          equipment_make?: string | null;
          equipment_model?: string | null;
          application?: string | null;
          condition?: ProductCondition | null;
          country_of_origin?: string | null;
          weight?: number | null;
          dimensions?: string | null;
          price?: number | null;
          currency?: string | null;
          min_order_qty?: number | null;
          public_notes?: string | null;
          internal_notes?: string | null;
          status?: ProductStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_identifiers: {
        Row: {
          id: string;
          product_id: string;
          identifier_type: IdentifierType;
          value: string;
          value_normalized: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          identifier_type: IdentifierType;
          value: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_identifiers"]["Insert"]>;
        Relationships: [];
      };
      product_category_map: {
        Row: {
          product_id: string;
          product_category_id: string;
        };
        Insert: {
          product_id: string;
          product_category_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_category_map"]["Insert"]>;
        Relationships: [];
      };
      inventory_batches: {
        Row: {
          id: string;
          product_id: string;
          quantity: number;
          condition: string | null;
          warehouse_location_id: string | null;
          bin_location: string | null;
          arrival_date: string | null;
          supplier_reference: string | null;
          purchase_reference: string | null;
          internal_cost: number | null;
          source_line: number | null;
          import_job_id: string | null;
          is_current: boolean;
          superseded_by_import_job_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          quantity: number;
          condition?: string | null;
          warehouse_location_id?: string | null;
          bin_location?: string | null;
          arrival_date?: string | null;
          supplier_reference?: string | null;
          purchase_reference?: string | null;
          internal_cost?: number | null;
          source_line?: number | null;
          import_job_id?: string | null;
          is_current?: boolean;
          superseded_by_import_job_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inventory_batches"]["Insert"]>;
        Relationships: [];
      };
      product_media: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          alt_text: string | null;
          sort_order: number;
          is_primary: boolean;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["product_media"]["Insert"]>;
        Relationships: [];
      };
      technical_documents: {
        Row: {
          id: string;
          product_id: string | null;
          brand_id: string | null;
          title: string;
          storage_path: string;
          is_public: boolean;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          brand_id?: string | null;
          title: string;
          storage_path: string;
          is_public?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["technical_documents"]["Insert"]>;
        Relationships: [];
      };
      import_rows: {
        Row: {
          id: string;
          import_job_id: string;
          raw_data: Record<string, unknown>;
          mapped_product_id: string | null;
          validation_status: ImportRowStatus;
          outcome: ImportRowOutcome | null;
          error_notes: string | null;
        };
        Insert: {
          id?: string;
          import_job_id: string;
          raw_data: Record<string, unknown>;
          mapped_product_id?: string | null;
          validation_status: ImportRowStatus;
          outcome?: ImportRowOutcome | null;
          error_notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["import_rows"]["Insert"]>;
        Relationships: [];
      };
      rfq_enquiries: {
        Row: {
          id: string;
          name: string;
          company: string | null;
          email: string;
          phone: string | null;
          whatsapp: string | null;
          country: string | null;
          brand: string | null;
          part_number: string | null;
          product_id: string | null;
          quantity_required: string | null;
          message: string | null;
          attachment_url: string | null;
          internal_notes: string | null;
          source: RfqSource;
          status: RfqStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          company?: string | null;
          email: string;
          phone?: string | null;
          whatsapp?: string | null;
          country?: string | null;
          brand?: string | null;
          part_number?: string | null;
          product_id?: string | null;
          quantity_required?: string | null;
          message?: string | null;
          attachment_url?: string | null;
          internal_notes?: string | null;
          source: RfqSource;
          status?: RfqStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rfq_enquiries"]["Insert"]>;
        Relationships: [];
      };
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          sections: Record<string, unknown>;
          seo_title: string | null;
          seo_description: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          sections?: Record<string, unknown>;
          seo_title?: string | null;
          seo_description?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pages"]["Insert"]>;
        Relationships: [];
      };
      settings: {
        Row: {
          id: true;
          phone_primary: string;
          phone_secondary: string | null;
          whatsapp_number: string;
          email: string;
          address: string;
        };
        Insert: {
          id?: true;
          phone_primary: string;
          phone_secondary?: string | null;
          whatsapp_number: string;
          email: string;
          address: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };
      listing_drafts: {
        Row: {
          id: string;
          product_id: string;
          version: number;
          is_current: boolean;
          status: ListingDraftStatus;
          review_data: Record<string, unknown>;
          generated_outputs: Record<string, unknown>;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          reviewed_at: string | null;
          approved_at: string | null;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          version?: number;
          is_current?: boolean;
          status?: ListingDraftStatus;
          review_data?: Record<string, unknown>;
          generated_outputs?: Record<string, unknown>;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_at?: string | null;
          approved_at?: string | null;
          published_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["listing_drafts"]["Insert"]>;
        Relationships: [];
      };
      rfq_status_history: {
        Row: {
          id: string;
          rfq_id: string;
          old_status: RfqStatus;
          new_status: RfqStatus;
          changed_by: string | null;
          changed_by_email: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          old_status: RfqStatus;
          new_status: RfqStatus;
          changed_by?: string | null;
          changed_by_email?: string | null;
          changed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rfq_status_history"]["Insert"]>;
        Relationships: [];
      };
      rfq_internal_notes: {
        Row: {
          id: string;
          rfq_id: string;
          author_id: string | null;
          author_email: string | null;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          author_id?: string | null;
          author_email?: string | null;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rfq_internal_notes"]["Insert"]>;
        Relationships: [];
      };
      quotation_number_counters: {
        Row: { year: number; last_number: number };
        Insert: { year: number; last_number?: number };
        Update: Partial<Database["public"]["Tables"]["quotation_number_counters"]["Insert"]>;
        Relationships: [];
      };
      quotations: {
        Row: {
          id: string;
          rfq_id: string;
          quotation_number: string;
          revision: number;
          revision_label: string;
          is_current: boolean;
          status: QuotationStatus;
          customer_name: string;
          company_name: string | null;
          customer_email: string;
          customer_phone: string | null;
          customer_address: string | null;
          country: string | null;
          customer_reference: string | null;
          po_number: string | null;
          quotation_date: string;
          valid_until: string | null;
          expected_delivery: string | null;
          currency: string | null;
          exchange_rate: number | null;
          salesperson: string | null;
          prepared_by: string | null;
          approved_by: string | null;
          incoterm: string | null;
          delivery_terms: string | null;
          payment_terms: string | null;
          shipment_terms: string | null;
          warranty: string | null;
          country_of_origin_note: string | null;
          shipping_method: string | null;
          port_of_loading: string | null;
          port_of_destination: string | null;
          bank_details: string | null;
          swift_code: string | null;
          iban: string | null;
          signature_reference: string | null;
          notes: string | null;
          internal_notes: string | null;
          freight: number;
          packing_charges: number;
          insurance: number;
          other_charges: number;
          rounding_adjustment: number;
          subtotal: number;
          total_discount: number;
          tax_total: number;
          grand_total: number;
          created_by: string | null;
          created_by_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          quotation_number: string;
          revision?: number;
          is_current?: boolean;
          status?: QuotationStatus;
          customer_name: string;
          company_name?: string | null;
          customer_email: string;
          customer_phone?: string | null;
          customer_address?: string | null;
          country?: string | null;
          customer_reference?: string | null;
          po_number?: string | null;
          quotation_date?: string;
          valid_until?: string | null;
          expected_delivery?: string | null;
          currency?: string | null;
          exchange_rate?: number | null;
          salesperson?: string | null;
          prepared_by?: string | null;
          approved_by?: string | null;
          incoterm?: string | null;
          delivery_terms?: string | null;
          payment_terms?: string | null;
          shipment_terms?: string | null;
          warranty?: string | null;
          country_of_origin_note?: string | null;
          shipping_method?: string | null;
          port_of_loading?: string | null;
          port_of_destination?: string | null;
          bank_details?: string | null;
          swift_code?: string | null;
          iban?: string | null;
          signature_reference?: string | null;
          notes?: string | null;
          internal_notes?: string | null;
          freight?: number;
          packing_charges?: number;
          insurance?: number;
          other_charges?: number;
          rounding_adjustment?: number;
          created_by?: string | null;
          created_by_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quotations"]["Insert"]>;
        Relationships: [];
      };
      quotation_items: {
        Row: {
          id: string;
          quotation_id: string;
          sort_order: number;
          product_id: string | null;
          part_number: string | null;
          description: string;
          brand: string | null;
          quantity: number;
          unit: string | null;
          unit_price: number;
          discount_percent: number;
          tax_percent: number;
          lead_time: string | null;
          country_of_origin: string | null;
          condition: ProductCondition | null;
          remarks: string | null;
          line_subtotal: number;
          line_discount_amount: number;
          line_tax_amount: number;
          line_total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quotation_id: string;
          sort_order: number;
          product_id?: string | null;
          part_number?: string | null;
          description: string;
          brand?: string | null;
          quantity?: number;
          unit?: string | null;
          unit_price?: number;
          discount_percent?: number;
          tax_percent?: number;
          lead_time?: string | null;
          country_of_origin?: string | null;
          condition?: ProductCondition | null;
          remarks?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quotation_items"]["Insert"]>;
        Relationships: [];
      };
      quotation_activity: {
        Row: {
          id: string;
          quotation_id: string;
          event_type: QuotationActivityType;
          old_status: QuotationStatus | null;
          new_status: QuotationStatus | null;
          details: Record<string, unknown>;
          actor_id: string | null;
          actor_email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quotation_id: string;
          event_type: QuotationActivityType;
          old_status?: QuotationStatus | null;
          new_status?: QuotationStatus | null;
          details?: Record<string, unknown>;
          actor_id?: string | null;
          actor_email?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quotation_activity"]["Insert"]>;
        Relationships: [];
      };
      quotation_access_tokens: {
        Row: {
          id: string;
          quotation_id: string;
          token_hash: string;
          created_by: string | null;
          created_by_email: string | null;
          created_at: string;
          expires_at: string | null;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          quotation_id: string;
          token_hash: string;
          created_by?: string | null;
          created_by_email?: string | null;
          created_at?: string;
          expires_at?: string | null;
          revoked_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["quotation_access_tokens"]["Insert"]>;
        Relationships: [];
      };
      quotation_email_log: {
        Row: {
          id: string;
          quotation_id: string;
          quotation_revision: number;
          recipient: string;
          sender: string;
          subject: string;
          provider: string;
          provider_message_id: string | null;
          delivery_status: QuotationEmailStatus;
          sent_by: string | null;
          sent_by_email: string | null;
          sent_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quotation_id: string;
          quotation_revision: number;
          recipient: string;
          sender: string;
          subject: string;
          provider?: string;
          provider_message_id?: string | null;
          delivery_status?: QuotationEmailStatus;
          sent_by?: string | null;
          sent_by_email?: string | null;
          sent_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quotation_email_log"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      product_public_availability: {
        Row: {
          product_id: string;
          quantity: number;
          status: AvailabilityStatus;
        };
        Relationships: [];
      };
      product_public_view: {
        Row: {
          id: string;
          oem_part_number: string;
          oem_part_number_normalized: string;
          description: string;
          brand_slug: string;
          brand_name: string;
          equipment_category_slug: string;
          equipment_category_name: string;
          product_category_slug: string | null;
          product_category_name: string | null;
          image_path: string | null;
          quantity: number;
          status: AvailabilityStatus;
        };
        Relationships: [];
      };
      product_admin_view: {
        Row: {
          id: string;
          brand_id: string;
          brand_slug: string;
          brand_name: string;
          equipment_category_id: string;
          equipment_category_slug: string;
          equipment_category_name: string;
          oem_part_number: string;
          oem_part_number_normalized: string;
          description: string;
          equipment_make: string | null;
          equipment_model: string | null;
          application: string | null;
          condition: ProductCondition | null;
          country_of_origin: string | null;
          weight: number | null;
          dimensions: string | null;
          price: number | null;
          currency: string | null;
          min_order_qty: number | null;
          public_notes: string | null;
          internal_notes: string | null;
          status: ProductStatus;
          created_at: string;
          updated_at: string;
          quantity: number;
          availability_status: AvailabilityStatus;
        };
        Relationships: [];
      };
    };
    Functions: {
      // Real bulk UPDATEs (migration 0010) — see lib/admin/import/rows.ts
      // and lib/admin/import/confirm.ts for why a REST upsert can't safely
      // do this (Postgres validates NOT NULL on the tentative INSERT row
      // before ON CONFLICT decides to redirect to UPDATE).
      bulk_set_import_row_outcome: {
        Args: { updates: { id: string; outcome: string; mapped_product_id: string | null }[] };
        Returns: void;
      };
      bulk_update_product_fields: {
        Args: { updates: Record<string, string | number | null>[] };
        Returns: void;
      };
      // migrations/0011_listing_drafts.sql — atomically flips the old
      // is_current draft off and inserts the new version in one statement.
      revise_listing_draft: {
        Args: {
          p_product_id: string;
          p_review_data: Record<string, unknown>;
          p_generated_outputs: Record<string, unknown>;
          p_created_by: string | null;
        };
        Returns: Database["public"]["Tables"]["listing_drafts"]["Row"];
      };
      // migrations/0012_rfq_management.sql — atomically updates the status
      // and logs the transition to rfq_status_history in one statement.
      change_rfq_status: {
        Args: {
          p_rfq_id: string;
          p_new_status: RfqStatus;
          p_changed_by: string | null;
          p_changed_by_email: string | null;
        };
        Returns: Database["public"]["Tables"]["rfq_enquiries"]["Row"];
      };
      // migrations/0014_quotations.sql — atomically allocates the next
      // sequential number for the year and creates revision 0.
      create_quotation_from_rfq: {
        Args: {
          p_rfq_id: string;
          p_currency: string | null;
          p_created_by: string | null;
          p_created_by_email: string | null;
        };
        Returns: Database["public"]["Tables"]["quotations"]["Row"];
      };
      // migrations/0014_quotations.sql — atomically retires the current
      // revision and creates the next one, copying header + line items.
      create_quotation_revision: {
        Args: {
          p_quotation_id: string;
          p_created_by: string | null;
          p_created_by_email: string | null;
        };
        Returns: Database["public"]["Tables"]["quotations"]["Row"];
      };
      // migrations/0014_quotations.sql — atomically updates the status and
      // logs the transition to quotation_activity in one statement.
      change_quotation_status: {
        Args: {
          p_quotation_id: string;
          p_new_status: QuotationStatus;
          p_changed_by: string | null;
          p_changed_by_email: string | null;
        };
        Returns: Database["public"]["Tables"]["quotations"]["Row"];
      };
    };
    Enums: {
      product_status: ProductStatus;
      product_condition: ProductCondition;
      brand_status: BrandStatus;
      identifier_type: IdentifierType;
      rfq_source: RfqSource;
      rfq_status: RfqStatus;
      import_job_status: ImportJobStatus;
      import_row_status: ImportRowStatus;
      import_row_outcome: ImportRowOutcome;
      user_role: UserRole;
      listing_draft_status: ListingDraftStatus;
      quotation_status: QuotationStatus;
      quotation_activity_type: QuotationActivityType;
      quotation_email_status: QuotationEmailStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
