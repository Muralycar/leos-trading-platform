import Link from "next/link";

interface BreadcrumbProps {
  categoryName: string;
  categorySlug: string;
  brandName: string;
  brandSlug: string;
  sku: string;
}

export function Breadcrumb({ categoryName, categorySlug, brandName, brandSlug, sku }: BreadcrumbProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-[13px] text-text-2">
      <Link href="/" className="hover:text-brass">
        Home
      </Link>
      <span>/</span>
      <Link href={`/search?cat=${encodeURIComponent(categorySlug)}`} className="hover:text-brass">
        {categoryName}
      </Link>
      <span>/</span>
      <Link href={`/brands/${brandSlug}`} className="hover:text-brass">
        {brandName}
      </Link>
      <span>/</span>
      <span className="text-text-1">{sku}</span>
    </nav>
  );
}
