import { useState } from "react";
import { useConfigurables } from "~/modules/configurables";
import type { Contact, ContactInput } from "~/lib/crm.client";
import { Field, TextInput, TextArea, Select, PrimaryButton, GhostButton } from "./field";

interface ContactFormProps {
  initial?: Contact;
  submitting?: boolean;
  onSubmit: (input: ContactInput) => void;
  onCancel: () => void;
}

const FALLBACK_STAGES = [
  { key: "lead", label: "Lead" },
  { key: "contacted", label: "Contacted" },
  { key: "proposal", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "won", label: "Won" },
];

export function ContactForm({ initial, submitting, onSubmit, onCancel }: ContactFormProps) {
  const { config } = useConfigurables();
  const stages =
    Array.isArray(config?.pipelineStages) && config.pipelineStages.length > 0
      ? config.pipelineStages
      : FALLBACK_STAGES;

  const [name, setName] = useState(initial?.name ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [stage, setStage] = useState(initial?.stage ?? stages[0]?.key ?? "lead");
  const [value, setValue] = useState(initial?.value ? String(initial.value) : "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      stage,
      value: Number(value) || 0,
      notes: notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Name">
        <TextInput
          autoFocus
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Company">
          <TextInput
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Inc."
          />
        </Field>
        <Field label="Deal value">
          <TextInput
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Email">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@acme.com"
          />
        </Field>
        <Field label="Phone">
          <TextInput
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 000 0000"
          />
        </Field>
      </div>

      <Field label="Stage">
        <Select value={stage} onChange={(e) => setStage(e.target.value)}>
          {stages.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Notes">
        <TextArea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Context, next steps, anything worth remembering."
        />
      </Field>

      <div className="mt-1 flex gap-2">
        <GhostButton type="button" onClick={onCancel} className="flex-1">
          Cancel
        </GhostButton>
        <PrimaryButton type="submit" disabled={submitting || !name.trim()} className="flex-1">
          {submitting ? "Saving..." : initial ? "Save changes" : "Add contact"}
        </PrimaryButton>
      </div>
    </form>
  );
}
