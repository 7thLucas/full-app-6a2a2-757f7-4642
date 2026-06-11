import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Flame, CheckCircle2, TrendingUp } from "lucide-react";
import { AppShell } from "~/components/crm/app-shell";
import { ContactCard } from "~/components/crm/contact-card";
import { Modal } from "~/components/crm/modal";
import { ContactForm } from "~/components/crm/contact-form";
import { useStages } from "~/components/crm/use-stages";
import { useConfigurables } from "~/modules/configurables";
import { crmClient, type Contact, type ContactInput } from "~/lib/crm.client";
import { formatCurrency } from "~/components/crm/format";
import { cn } from "~/lib/utils";

export function meta() {
  return [{ title: "Pipeline · SimpleCRM" }];
}

export default function PipelinePage() {
  const { config } = useConfigurables();
  const { stages, labelOf } = useStages();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [followUp, setFollowUp] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const [all, chase] = await Promise.all([
      crmClient.listContacts(),
      crmClient.followUpToday(5),
    ]);
    setContacts(all);
    setFollowUp(chase);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(input: ContactInput) {
    setSubmitting(true);
    const created = await crmClient.createContact(input);
    setSubmitting(false);
    if (created) {
      setAdding(false);
      await load();
    }
  }

  const openValue = useMemo(
    () =>
      contacts
        .filter((c) => c.stage !== "past")
        .reduce((sum, c) => sum + (c.value || 0), 0),
    [contacts],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Contact[]>();
    for (const s of stages) map.set(s.key, []);
    for (const c of contacts) {
      if (!map.has(c.stage)) map.set(c.stage, []);
      map.get(c.stage)!.push(c);
    }
    return map;
  }, [contacts, stages]);

  const followUpHeading = config?.followUpHeading || "Follow up today";
  const followUpSub =
    config?.followUpSubheading || "These deals are going cold. Reach out before they slip.";
  const emptyMsg =
    config?.emptyFollowUpMessage || "You're all caught up. No deals are going cold today.";

  return (
    <AppShell
      action={
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-95 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add contact
        </button>
      }
    >
      {loading ? (
        <PipelineSkeleton />
      ) : contacts.length === 0 ? (
        <EmptyState onAdd={() => setAdding(true)} />
      ) : (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={<Flame className="h-4 w-4 text-[#DC2626]" />}
              label="Going cold"
              value={String(followUp.length)}
              tone="cold"
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4 text-primary" />}
              label="Open value"
              value={formatCurrency(openValue)}
            />
            <StatCard
              icon={<CheckCircle2 className="h-4 w-4 text-[#16A34A]" />}
              label="Active deals"
              value={String(contacts.filter((c) => c.stage !== "past").length)}
            />
          </div>

          {/* Follow up today — the hero */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-xl font-bold tracking-tight">{followUpHeading}</h2>
              {followUp.length > 0 ? (
                <span className="text-sm font-medium text-[#DC2626]">
                  {followUp.length} need{followUp.length === 1 ? "s" : ""} attention
                </span>
              ) : null}
            </div>
            <p className="mb-4 text-sm text-[#64748B]">{followUpSub}</p>

            {followUp.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-[#DCFCE7] bg-[#F0FDF4] p-5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#16A34A]" />
                <p className="text-sm font-medium text-[#15803D]">{emptyMsg}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {followUp.map((c) => (
                  <ContactCard
                    key={c.id}
                    contact={c}
                    stageLabel={labelOf(c.stage)}
                    emphasis
                  />
                ))}
              </div>
            )}
          </section>

          {/* Full pipeline by stage */}
          <section>
            <h2 className="mb-4 text-xl font-bold tracking-tight">Pipeline</h2>
            <div className="space-y-6">
              {stages.map((stage) => {
                const items = grouped.get(stage.key) ?? [];
                if (items.length === 0) return null;
                const stageValue = items.reduce((s, c) => s + (c.value || 0), 0);
                return (
                  <div key={stage.key}>
                    <div className="mb-2.5 flex items-center gap-2.5">
                      <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[#475569]">
                        {stage.label}
                      </h3>
                      <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#64748B]">
                        {items.length}
                      </span>
                      {stageValue > 0 ? (
                        <span className="ml-auto text-[12px] font-medium text-[#94A3B8]">
                          {formatCurrency(stageValue)}
                        </span>
                      ) : null}
                    </div>
                    <div className="space-y-2.5">
                      {items.map((c) => (
                        <ContactCard key={c.id} contact={c} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add contact"
        subtitle="Drop in a new deal — you can log interactions next."
      >
        <ContactForm
          submitting={submitting}
          onSubmit={handleCreate}
          onCancel={() => setAdding(false)}
        />
      </Modal>
    </AppShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "cold";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        tone === "cold" ? "border-[#FEE2E2]" : "border-[#EEF2F6]",
      )}
    >
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#F8FAFC]">
        {icon}
      </div>
      <div className="text-xl font-bold tracking-tight">{value}</div>
      <div className="text-[12px] text-[#64748B]">{label}</div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#CBD5E1] bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2FF]">
        <TrendingUp className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">Your pipeline starts here</h2>
      <p className="mt-1.5 max-w-xs text-sm text-[#64748B]">
        Add your first contact and SimpleCRM will tell you exactly who to chase before they go
        cold.
      </p>
      <button
        onClick={onAdd}
        className="mt-5 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95"
      >
        <Plus className="h-4 w-4" />
        Add your first contact
      </button>
    </div>
  );
}

function PipelineSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-[#E9EEF4]" />
        ))}
      </div>
      <div className="space-y-2.5">
        <div className="h-6 w-40 rounded bg-[#E9EEF4]" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[76px] rounded-2xl bg-[#E9EEF4]" />
        ))}
      </div>
    </div>
  );
}
