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
export type RfqStatus = "new" | "in_progress" | "quoted" | "closed";
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
    Functions: Record<string, never>;
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
    };
    CompositeTypes: Record<string, never>;
  };
}
