import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="wrap py-24 text-center">
      <div className="eyebrow mx-auto w-fit">Part Not Found</div>
      <h1 className="mt-4 text-[clamp(28px,4vw,44px)]">This part isn&apos;t in our current listing</h1>
      <p className="mx-auto mt-4 max-w-[50ch] text-[15px]">
        The part number or link you followed doesn&apos;t match anything in our published inventory. Search available
        stock, or send us the part number and our sourcing network will confirm supply.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/search" className="btn btn-primary">
          Search Available Stock
        </Link>
        <Link href="/sourcing#request" className="btn btn-ghost">
          Request a Part
        </Link>
      </div>
    </div>
  );
}
