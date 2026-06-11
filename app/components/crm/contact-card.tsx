import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import type { Contact } from "~/lib/crm.client";
import {
  formatCurrency,
  formatRecency,
  initials,
  temperatureLabel,
  TEMPERATURE_STYLES,
} from "./format";
import { cn } from "~/lib/utils";

interface ContactCardProps {
  contact: Contact;
  stageLabel?: string;
  /** Highlight style for the follow-up shortlist. */
  emphasis?: boolean;
}

export function ContactCard({ contact, stageLabel, emphasis }: ContactCardProps) {
  const temp = TEMPERATURE_STYLES[contact.temperature];

  return (
    <Link
      to={`/contacts/${contact.id}`}
      className={cn(
        "group flex items-center gap-3.5 rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)]",
        emphasis ? "border-transparent ring-1 ring-[#FECACA]" : "border-[#EEF2F6]",
      )}
    >
      <div className="relative">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF2FF] text-sm font-semibold text-primary">
          {initials(contact.name) || "?"}
        </span>
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white",
            temp.dot,
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[15px] font-semibold tracking-tight">
            {contact.name}
          </span>
          {stageLabel ? (
            <span className="shrink-0 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#64748B]">
              {stageLabel}
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[12px] text-[#64748B]">
          {contact.company ? <span className="truncate">{contact.company}</span> : null}
          {contact.company && contact.value ? <span>·</span> : null}
          {contact.value ? (
            <span className="font-medium text-[#334155]">{formatCurrency(contact.value)}</span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 text-right">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
            temp.chip,
          )}
        >
          {temperatureLabel(contact.temperature)}
        </span>
        <span className="text-[11px] text-[#94A3B8]">
          {formatRecency(contact.daysSinceContact)}
        </span>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-[#CBD5E1] transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
