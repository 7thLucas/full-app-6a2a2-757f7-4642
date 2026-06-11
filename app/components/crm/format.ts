import type { DealTemperature, InteractionKind } from "~/lib/crm.client";

export function formatCurrency(value: number): string {
  if (!value) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRecency(days: number): string {
  if (days <= 0) return "Touched today";
  if (days === 1) return "Last touch: yesterday";
  return `Last touch: ${days} days ago`;
}

export function temperatureLabel(t: DealTemperature): string {
  if (t === "cold") return "Going cold";
  if (t === "warming") return "Cooling off";
  return "Fresh";
}

export const TEMPERATURE_STYLES: Record<
  DealTemperature,
  { dot: string; chip: string; bar: string }
> = {
  cold: {
    dot: "bg-[#DC2626]",
    chip: "bg-[#FEF2F2] text-[#DC2626]",
    bar: "bg-[#DC2626]",
  },
  warming: {
    dot: "bg-[#F59E0B]",
    chip: "bg-[#FFFBEB] text-[#B45309]",
    bar: "bg-[#F59E0B]",
  },
  fresh: {
    dot: "bg-[#16A34A]",
    chip: "bg-[#F0FDF4] text-[#15803D]",
    bar: "bg-[#16A34A]",
  },
};

export const INTERACTION_META: Record<
  InteractionKind,
  { label: string; icon: string }
> = {
  call: { label: "Call", icon: "phone" },
  email: { label: "Email", icon: "mail" },
  meeting: { label: "Meeting", icon: "users" },
  note: { label: "Note", icon: "sticky-note" },
};

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const day = 1000 * 60 * 60 * 24;
  const days = Math.floor(diff / day);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
