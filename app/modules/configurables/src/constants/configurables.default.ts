/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TPipelineStage = {
  key: string;
  label: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  tagline: string;
  logoUrl: string;
  brandColor: TBrandColor;
  followUpHeading: string;
  followUpSubheading: string;
  emptyFollowUpMessage: string;
  pipelineStages: TPipelineStage[];
  coldThresholdDays: number;
  warmingThresholdDays: number;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "SimpleCRM",
  tagline: "Follow up before a lead goes cold.",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#1D4ED8",
    secondary: "#1E3A8A",
    accent: "#2563EB",
  },
  followUpHeading: "Follow up today",
  followUpSubheading: "These deals are going cold. Reach out before they slip.",
  emptyFollowUpMessage: "You're all caught up. No deals are going cold today.",
  pipelineStages: [
    { key: "lead", label: "Lead" },
    { key: "contacted", label: "Contacted" },
    { key: "proposal", label: "Proposal" },
    { key: "negotiation", label: "Negotiation" },
    { key: "won", label: "Won" },
  ],
  coldThresholdDays: 7,
  warmingThresholdDays: 4,
};
