# SimpleCRM — Design Guidelines

## Design ethos
Clean, calm, and focused — the interface gets out of the way so a solo operator can glance in and instantly act. Prioritize clarity and speed over density. Apple HIG sensibility: generous whitespace, clear hierarchy, restrained color.

## Color
- **Primary / brand:** deep blue (e.g. `#1E3A8A` / `#1D4ED8`) — used for the logo, primary actions, and active pipeline emphasis.
- **Surface:** near-white / soft gray backgrounds (`#F8FAFC`, `#FFFFFF`) for a calm canvas.
- **Text:** near-black primary (`#0F172A`), muted slate for secondary (`#64748B`).
- **Status accents (pipeline temperature):**
  - Cold / at-risk: amber-to-red (`#F59E0B` warning, `#DC2626` urgent) to flag deals going cold.
  - Healthy / fresh: green (`#16A34A`).
  - Neutral stages: slate.
- Use status color sparingly and purposefully — it is the signal that draws the eye to who needs chasing.

## Typography
- System font stack (SF Pro / system-ui) for a native, fast feel.
- Clear scale: large semibold page titles, medium section headers, regular body, small muted metadata (e.g. "last contacted 9 days ago").
- Emphasize the metadata that signals cold deals — make "days since last touch" legible at a glance.

## Layout & components
- **Pipeline as hero:** the home/landing surface leads with a "follow up today" shortlist, then the staged pipeline.
- **Cards:** contact/deal cards with name, stage, value, and a prominent recency indicator. Rounded corners (`~12px`), subtle elevation/shadow.
- **Stages:** clear visual columns or grouped sections per pipeline stage.
- **Lists over forms:** scannable lists; quick-add and quick-log actions reduce data-entry friction.
- **Spacing:** generous padding; let content breathe.

## Elevation & motion
- Subtle shadows for cards and floating actions; avoid heavy borders.
- Gentle, quick transitions — responsive feel, nothing flashy.

## Tone in UI copy
- Direct and encouraging: "3 deals going cold", "Follow up today", "Last touch: 9 days ago".
- Single-owner voice — no team/assignment language.