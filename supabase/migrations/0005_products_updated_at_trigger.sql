-- products.updated_at has existed since 0001 with a default of now() at
-- insert time, but nothing ever kept it current on UPDATE — verified live:
-- editing a product's description/status left updated_at frozen at its
-- original insert timestamp. Reuses set_updated_at(), already created for
-- rfq_enquiries in 0003_rfq_dashboard.sql, rather than duplicating it.

create trigger products_set_updated_at
  before update on products
  for each row
  execute function set_updated_at();
