import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus, Search, Users } from "lucide-react";
import { AppShell } from "~/components/crm/app-shell";
import { ContactCard } from "~/components/crm/contact-card";
import { Modal } from "~/components/crm/modal";
import { ContactForm } from "~/components/crm/contact-form";
import { Select, TextInput } from "~/components/crm/field";
import { useStages } from "~/components/crm/use-stages";
import { crmClient, type Contact, type ContactInput } from "~/lib/crm.client";
import { cn } from "~/lib/utils";

export function meta() {
  return [{ title: "Contacts · SimpleCRM" }];
}

export default function ContactsPage() {
  const { stages, labelOf } = useStages();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "cold">("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const all = await crmClient.listContacts();
    setContacts(all);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (filter === "cold" && c.temperature !== "cold" && c.temperature !== "warming")
        return false;
      if (stageFilter !== "all" && c.stage !== stageFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [contacts, query, filter, stageFilter]);

  const coldCount = contacts.filter(
    (c) => c.temperature === "cold" || c.temperature === "warming",
  ).length;

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
      <div className="mb-5 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
        <span className="text-sm text-[#64748B]">{contacts.length} total</span>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, company, email"
            className="pl-10"
          />
        </div>
        <div className="relative shrink-0">
          <Select
            aria-label="Filter by stage"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="sm:w-44"
          >
            <option value="all">All stages</option>
            {stages.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </Select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
        </div>
        <div className="flex shrink-0 gap-1 rounded-xl bg-[#F1F5F9] p-1">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterPill>
          <FilterPill active={filter === "cold"} onClick={() => setFilter("cold")}>
            Needs follow-up {coldCount > 0 ? `(${coldCount})` : ""}
          </FilterPill>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[76px] rounded-2xl bg-[#E9EEF4]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#CBD5E1] bg-white px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF]">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-[#475569]">
            {contacts.length === 0 ? "No contacts yet." : "No matches."}
          </p>
          <p className="mt-1 text-sm text-[#94A3B8]">
            {contacts.length === 0
              ? "Add your first contact to get started."
              : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((c) => (
            <ContactCard key={c.id} contact={c} stageLabel={labelOf(c.stage)} />
          ))}
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

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all",
        active ? "bg-white text-primary shadow-sm" : "text-[#64748B] hover:text-[#0F172A]",
      )}
    >
      {children}
    </button>
  );
}
