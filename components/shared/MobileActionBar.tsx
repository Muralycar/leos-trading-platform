import { PhoneIcon, WhatsAppIcon } from "@/components/ui/Icons";

interface MobileActionBarProps {
  waHref: string;
  phoneHref: string;
  /** In-page anchor of the enquiry form, e.g. "#rfq". */
  quoteHref: string;
  quoteLabel?: string;
}

/**
 * Phone-only bar pinned to the bottom of detail pages, so WhatsApp / Call /
 * Quote stay within thumb reach while reading. Hidden from 901px up, where the
 * page's own buttons are already in view. The body gets matching bottom
 * padding via `.mobile-action-bar` in globals.css so the footer is never covered.
 */
export function MobileActionBar({ waHref, phoneHref, quoteHref, quoteLabel = "Request Quote" }: MobileActionBarProps) {
  return (
    <div className="mobile-action-bar fixed inset-x-0 bottom-0 z-40 border-t border-line-strong bg-bg-0/[.95] px-3 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] backdrop-blur-[10px] min-[901px]:hidden">
      <div className="mx-auto flex max-w-[560px] gap-2">
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-s bg-[#25D366] text-[13px] font-semibold text-white"
        >
          <WhatsAppIcon className="h-5 w-5" />
          WhatsApp
        </a>
        <a
          href={phoneHref}
          aria-label="Call"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-s border border-line-strong text-text-0"
        >
          <PhoneIcon className="h-5 w-5" />
        </a>
        <a
          href={quoteHref}
          className="flex h-12 flex-1 items-center justify-center rounded-s bg-yellow text-[13px] font-semibold text-black"
        >
          {quoteLabel}
        </a>
      </div>
    </div>
  );
}
