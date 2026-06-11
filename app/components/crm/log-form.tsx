import { useState } from "react";
import { Phone, Mail, Users, StickyNote } from "lucide-react";
import type { InteractionInput, InteractionKind } from "~/lib/crm.client";
import { Field, TextArea, PrimaryButton, GhostButton } from "./field";
import { cn } from "~/lib/utils";

const KINDS: { key: InteractionKind; label: string; icon: typeof Phone }[] = [
  { key: "call", label: "Call", icon: Phone },
  { key: "email", label: "Email", icon: Mail },
  { key: "meeting", label: "Meeting", icon: Users },
  { key: "note", label: "Note", icon: StickyNote },
];

interface LogFormProps {
  submitting?: boolean;
  onSubmit: (input: InteractionInput) => void;
  onCancel: () => void;
}

export function LogForm({ submitting, onSubmit, onCancel }: LogFormProps) {
  const [kind, setKind] = useState<InteractionKind>("call");
  const [summary, setSummary] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ kind, summary: summary.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Type">
        <div className="grid grid-cols-4 gap-2">
          {KINDS.map((k) => {
            const Icon = k.icon;
            const active = kind === k.key;
            return (
              <button
                key={k.key}
                type="button"
                onClick={() => setKind(k.key)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border py-3 text-[12px] font-medium transition-all",
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]",
                )}
              >
                <Icon className="h-4 w-4" />
                {k.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="What happened?">
        <TextArea
          autoFocus
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Left a voicemail, sent the deck, agreed to reconnect Friday..."
        />
      </Field>

      <div className="mt-1 flex gap-2">
        <GhostButton type="button" onClick={onCancel} className="flex-1">
          Cancel
        </GhostButton>
        <PrimaryButton type="submit" disabled={submitting} className="flex-1">
          {submitting ? "Logging..." : "Log & reset clock"}
        </PrimaryButton>
      </div>
    </form>
  );
}
