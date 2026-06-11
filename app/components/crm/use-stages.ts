import { useMemo } from "react";
import { useConfigurables } from "~/modules/configurables";

export interface Stage {
  key: string;
  label: string;
}

const FALLBACK_STAGES: Stage[] = [
  { key: "lead", label: "Lead" },
  { key: "active", label: "Active" },
  { key: "past", label: "Past" },
];

/** Pipeline stages from configurables, with a labels lookup map. */
export function useStages(): { stages: Stage[]; labelOf: (key: string) => string } {
  const { config } = useConfigurables();

  return useMemo(() => {
    const stages =
      Array.isArray(config?.pipelineStages) && config.pipelineStages.length > 0
        ? (config.pipelineStages as Stage[])
        : FALLBACK_STAGES;
    const map = new Map(stages.map((s) => [s.key, s.label]));
    return {
      stages,
      labelOf: (key: string) => map.get(key) ?? key,
    };
  }, [config?.pipelineStages]);
}
