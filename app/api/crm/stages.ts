/**
 * Single source of truth for the sales pipeline stages.
 *
 * The pipeline has exactly three stages, in this order:
 *   Lead  → a new/early prospect not yet being actively worked
 *   Active → a deal in progress (warm, contacted, proposal, negotiation…)
 *   Past  → a closed deal (won/lost/closed) that needs no chasing
 */
export interface PipelineStage {
  key: string;
  label: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { key: "lead", label: "Lead" },
  { key: "active", label: "Active" },
  { key: "past", label: "Past" },
];

export const STAGE_KEYS = PIPELINE_STAGES.map((s) => s.key);

export const DEFAULT_STAGE = "lead";

/** Closed deals live in "Past" and are excluded from cold/follow-up detection. */
export const CLOSED_STAGE = "past";

/**
 * Map any historical/legacy stage value onto one of the three new stages.
 * Early/new → Lead, in-progress/warm → Active, won/lost/closed → Past.
 */
export function normalizeStage(raw: unknown): string {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase();

  // Already a valid new stage.
  if (STAGE_KEYS.includes(value)) return value;

  switch (value) {
    // Early / new prospects.
    case "":
    case "lead":
    case "leads":
    case "new":
    case "prospect":
    case "cold":
      return "lead";

    // In-progress / warm deals.
    case "contacted":
    case "contact":
    case "qualified":
    case "proposal":
    case "negotiation":
    case "negotiating":
    case "warm":
    case "warming":
    case "in-progress":
    case "in_progress":
    case "active":
    case "open":
      return "active";

    // Closed deals.
    case "won":
    case "lost":
    case "closed":
    case "closed-won":
    case "closed-lost":
    case "complete":
    case "completed":
    case "past":
      return "past";

    default:
      // Unknown legacy value — default to the first stage so nothing is orphaned.
      return DEFAULT_STAGE;
  }
}
