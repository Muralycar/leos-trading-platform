-- Optional starter listings: brands we source on request. No photos, no
-- invented specs. Safe to re-run (skips slugs that already exist).

insert into public.machines (slug, title, category, brand, model, condition, description, status, is_published)
values
('volvo-fh-tractor-units-sourcing', 'Volvo FH Tractor Units – Available on Request', 'truck', 'Volvo', 'FH', null,
 'We source new and used Volvo FH tractor units on request. Tell us your required year, mileage, axle configuration and budget, and we will find matching units and send you full details and photos.',
 'sourcing', true),
('iveco-tractor-units-sourcing', 'Iveco Tractor Units – Available on Request', 'truck', 'Iveco', null, null,
 'We source new and used Iveco tractor units on request. Send us your required model, year, mileage and budget, and we will come back with available units, specifications and photos.',
 'sourcing', true),
('toyota-forklifts-sourcing', 'Toyota Forklifts – Available on Request', 'forklift', 'Toyota', null, null,
 'We supply new and used Toyota forklifts on request. Tell us the capacity, fuel type (diesel, LPG or electric), mast height and budget, and we will find suitable units for you.',
 'sourcing', true),
('linde-forklifts-sourcing', 'Linde Forklifts – Available on Request', 'forklift', 'Linde', null, null,
 'We supply new and used Linde forklifts on request. Send us the capacity, fuel type, mast height and budget you need, and we will source matching units and send details and photos.',
 'sourcing', true)
on conflict (slug) do nothing;
