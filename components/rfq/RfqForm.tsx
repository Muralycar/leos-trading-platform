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

const MESSAGE_LABEL: Record<RfqVariant, string> = {
  product: "Message",
  sourcing: "Description / Requirement",
  contact: "Message",
  "search-no-result": "Message",
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
  const showExtendedFields = variant === "sourcing";

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
      whatsapp: String(data.get("whatsapp") ?? ""),
      country: String(data.get("country") ?? ""),
      brand: String(data.get("brand") ?? ""),
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
      <div
        role="status"
        className={`rounded-m border border-ok/40 bg-ok/10 px-6 py-10 text-center ${className}`}
      >
        <CheckIcon className="mx-auto mb-4 h-10 w-10 text-ok" />
        <h3 className="text-text-0">Request received</h3>
        <p className="mx-auto mt-2 max-w-[40ch] text-sm text-text-1">
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
          <span className={labelClass}>{PART_NUMBER_LABEL[variant]}</span>
          <input
            name="partNumber"
            type="text"
            defaultValue={prefillPartNumber}
            placeholder={variant === "product" ? undefined : "Part number, or make / model / equipment details"}
            className={inputClass}
          />
          {showExtendedFields ? (
            <span className="text-[12px] text-text-2">
              No part number? Describe the equipment, model or requirement instead.
            </span>
          ) : null}
        </label>
        {showExtendedFields ? (
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Brand</span>
            <input name="brand" type="text" placeholder="e.g. Caterpillar, Cummins, Kobelco" className={inputClass} />
          </label>
        ) : (
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Quantity Required</span>
            <input name="quantity" type="text" placeholder="e.g. 2 units" className={inputClass} />
          </label>
        )}
      </div>

      {showExtendedFields ? (
        <div className="grid grid-cols-1 gap-5 min-[601px]:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Quantity Required</span>
            <input name="quantity" type="text" placeholder="e.g. 2 units" className={inputClass} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Country</span>
            <input name="country" type="text" placeholder="Destination country" className={inputClass} />
          </label>
        </div>
      ) : null}

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

      {showExtendedFields ? (
        <label className="flex flex-col gap-2">
          <span className={labelClass}>WhatsApp Number</span>
          <input name="whatsapp" type="tel" placeholder="If different from phone" className={inputClass} />
        </label>
      ) : null}

      <label className="flex flex-col gap-2">
        <span className={labelClass}>{MESSAGE_LABEL[variant]}</span>
        <textarea
          name="message"
          rows={4}
          defaultValue={prefillMessage}
          placeholder={
            showExtendedFields
              ? "Machine/model, application, urgency, or destination — anything that helps us source the right part."
              : "Quantity, urgency, destination country"
          }
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
