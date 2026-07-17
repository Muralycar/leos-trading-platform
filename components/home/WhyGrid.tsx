const WHY_ITEMS = [
  {
    title: "Genuine OEM Sourcing",
    body: "Traceable parts sourced direct from manufacturer channels — not gray-market substitutes.",
    path: "M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6l-9-4Z M8.5 12 11 14.5 15.5 10",
  },
  {
    title: "Dead-Stock & Obsolete",
    body: "We specialize in discontinued and hard-to-find part numbers other suppliers have written off.",
    path: "M3 7h18v13H3z M3 11h18M8 7V4h8v3",
  },
  {
    title: "Global Sourcing Network",
    body: "Multi-manufacturer reach across generator, truck and construction equipment lines.",
    path: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M3 12h18M12 3a13 13 0 0 1 0 18 13 13 0 0 1 0-18Z",
  },
  {
    title: "Fast RFQ Turnaround",
    body: "Typical dispatch of 48–72 hours once a quote is confirmed, anywhere in the MEA region.",
    path: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3.5 2",
  },
];

export function WhyGrid() {
  return (
    <section className="py-16">
      <div className="wrap">
        <div className="mb-12 max-w-[640px]">
          <div className="eyebrow">Why Leos</div>
          <h2 className="mt-3.5">Built for parts that are hard to move</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-px border border-line bg-line min-[901px]:grid-cols-4">
        {WHY_ITEMS.map((item) => (
          <div key={item.title} className="bg-bg-0 p-7">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="mb-5 h-6 w-6 text-brass">
              <path d={item.path} />
            </svg>
            <h3 className="mb-2.5 text-lg">{item.title}</h3>
            <p className="text-sm">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
