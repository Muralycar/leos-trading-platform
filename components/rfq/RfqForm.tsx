"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/ui/Icons";

export type RfqVariant = "product" | "sourcing" | "contact" | "search-no-result";

const SOURCE_BY_VARIANT: Record<RfqVariant, string> = {
  product: "product_page",
  sourcing: "sourcing_request",
  contact: "contact",
  "search-no-result": "search_no_result",
};

const PART_NUMBER_LABEL: Record<RfqVariant, string> = {
  product: "Part Number",
  sourcing: "Part Number or Equipment Details",
  contact: "Part Number or Equipment Details (optional)",
  "search-no-result": "Part Number",
};

interface RfqFormProps {
  variant: RfqVariant;
  prefillPartNumber?: string;
  prefillMessage?: string;
  submitLabel?: string;
  className?: string;
}

type Status = "idle" | "submitting" | "success" | "error";

export function RfqForm({
  variant,
  prefillPartNumber = "",
  prefillMessage = "",
  submitLabel = "Submit Request for Quotation",
  className = "",
}: RfqFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      company: String(data.get("company") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      partNumber: String(data.get("partNumber") ?? ""),
      quantity: String(data.get("quantity") ?? ""),
      message: String(data.get("message") ?? ""),
      source: SOURCE_BY_VARIANT[variant],
    };

    try {
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={`py-10 text-center ${className}`}>
        <CheckIcon className="mx-auto mb-4 h-10 w-10 text-ok" />
        <h3>Request received</h3>
        <p className="mx-auto mt-2 max-w-[40ch] text-sm">
          Our team will confirm availability and pricing shortly. For urgent requirements, use WhatsApp.
        </p>
      </div>
    );
  }

  const labelClass = "font-mono text-[11px] uppercase tracking-[.06em] text-text-2";
  const inputClass =
    "w-full rounded-s border border-line-strong bg-bg-1 px-3.5 py-3 text-[14px] text-text-0 placeholder:text-text-2 focus:border-brass focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-5 ${className}`}>
      <div className="grid grid-cols-1 gap-5 min-[601px]:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Name</span>
          <input name="name" type="text" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Company</span>
          <input name="company" type="text" className={inputClass} />
        </label>
      </div>
      <div className="grid grid-cols-1 gap-5 min-[601px]:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Email</span>
          <input name="email" type="email" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Phone</span>
          <input name="phone" type="tel" className={inputClass} />
        </label>
      </div>
      <div className="grid grid-cols-1 gap-5 min-[601px]:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>{PART_NUMBER_LABEL[variant]}</span>
          <input
            name="partNumber"
            type="text"
            defaultValue={prefillPartNumber}
            placeholder={variant === "product" ? undefined : "Part number, or make / model / equipment details"}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Quantity Required</span>
          <input name="quantity" type="text" placeholder="e.g. 2 units" className={inputClass} />
        </label>
      </div>
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Message</span>
        <textarea
          name="message"
          rows={4}
          defaultValue={prefillMessage}
          placeholder="Quantity, urgency, destination country"
          className={inputClass}
        />
      </label>

      {status === "error" && errorMessage ? <p className="text-sm text-warn">{errorMessage}</p> : null}

      <button type="submit" disabled={status === "submitting"} className="btn btn-primary w-full disabled:opacity-60">
        {status === "submitting" ? "Submitting…" : submitLabel}
      </button>
    </form>
  );
}
