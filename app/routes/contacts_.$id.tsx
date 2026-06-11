import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  Phone,
  Mail,
  Users,
  StickyNote,
  Pencil,
  Trash2,
  MessageSquarePlus,
  Building2,
  ChevronLeft,
} from "lucide-react";
import { AppShell } from "~/components/crm/app-shell";
import { Modal } from "~/components/crm/modal";
import { ContactForm } from "~/components/crm/contact-form";
import { LogForm } from "~/components/crm/log-form";
import { PrimaryButton, GhostButton } from "~/components/crm/field";
import { useStages } from "~/components/crm/use-stages";
import {
  crmClient,
  type Contact,
  type Interaction,
  type ContactInput,
  type InteractionInput,
  type InteractionKind,
} from "~/lib/crm.client";
import {
  formatCurrency,
  formatRecency,
  initials,
  relativeTime,
  temperatureLabel,
  TEMPERATURE_STYLES,
} from "~/components/crm/format";
import { cn } from "~/lib/utils";

const KIND_ICON: Record<InteractionKind, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: StickyNote,
};
const KIND_LABEL: Record<InteractionKind, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  note: "Note",
};

export default function ContactDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { labelOf } = useStages();

  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [logging, setLogging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    const result = await crmClient.getContact(id);
    if (!result) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setContact(result.contact);
    setInteractions(result.interactions);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLog(input: InteractionInput) {
    setSubmitting(true);
    const logged = await crmClient.logInteraction(id, input);
    setSubmitting(false);
    if (logged) {
      setLogging(false);
      await load();
    }
  }

  async function handleEdit(input: ContactInput) {
    setSubmitting(true);
    const updated = await crmClient.updateContact(id, input);
    setSubmitting(false);
    if (updated) {
      setEditing(false);
      setContact(updated);
    }
  }

  async function handleDelete() {
    setSubmitting(true);
    const ok = await crmClient.deleteContact(id);
    setSubmitting(false);
    if (ok) navigate("/contacts");
  }

  if (loading) {
    return (
      <AppShell>
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-24 rounded bg-[#E9EEF4]" />
          <div className="h-40 rounded-3xl bg-[#E9EEF4]" />
          <div className="h-64 rounded-3xl bg-[#E9EEF4]" />
        </div>
      </AppShell>
    );
  }

  if (notFound || !contact) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-base font-medium text-[#475569]">Contact not found.</p>
          <Link to="/contacts" className="mt-3 text-sm font-medium text-primary">
            Back to contacts
          </Link>
        </div>
      </AppShell>
    );
  }

  const temp = TEMPERATURE_STYLES[contact.temperature];

  return (
    <AppShell
      action={
        <button
          onClick={() => setLogging(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-95 active:scale-95"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Log interaction
        </button>
      }
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[#64748B] transition-colors hover:text-[#0F172A]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header card */}
      <div className="rounded-3xl border border-[#EEF2F6] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-start gap-4">
          <div className="relative">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2FF] text-lg font-bold text-primary">
              {initials(contact.name) || "?"}
            </span>
            <span
              className={cn(
                "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white",
                temp.dot,
              )}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight">{contact.name}</h1>
            {contact.company ? (
              <div className="mt-0.5 flex items-center gap-1.5 text-sm text-[#64748B]">
                <Building2 className="h-3.5 w-3.5" />
                <span className="truncate">{contact.company}</span>
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#475569]">
                {labelOf(contact.stage)}
              </span>
              {contact.value ? (
                <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {formatCurrency(contact.value)}
                </span>
              ) : null}
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  temp.chip,
                )}
              >
                {temperatureLabel(contact.temperature)}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <IconButton onClick={() => setEditing(true)} label="Edit">
              <Pencil className="h-4 w-4" />
            </IconButton>
            <IconButton onClick={() => setConfirmDelete(true)} label="Delete" danger>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        {/* Recency banner */}
        <div
          className={cn(
            "mt-5 flex items-center justify-between rounded-2xl px-4 py-3",
            contact.temperature === "cold"
              ? "bg-[#FEF2F2]"
              : contact.temperature === "warming"
                ? "bg-[#FFFBEB]"
                : "bg-[#F0FDF4]",
          )}
        >
          <span className={cn("text-sm font-medium", temp.chip.split(" ")[1])}>
            {formatRecency(contact.daysSinceContact)}
          </span>
          {contact.temperature !== "fresh" ? (
            <button
              onClick={() => setLogging(true)}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Follow up now
            </button>
          ) : null}
        </div>

        {/* Contact details */}
        {(contact.email || contact.phone) && (
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {contact.email ? (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2.5 rounded-xl border border-[#EEF2F6] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#334155] transition-colors hover:border-primary/30"
              >
                <Mail className="h-4 w-4 text-[#94A3B8]" />
                <span className="truncate">{contact.email}</span>
              </a>
            ) : null}
            {contact.phone ? (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2.5 rounded-xl border border-[#EEF2F6] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#334155] transition-colors hover:border-primary/30"
              >
                <Phone className="h-4 w-4 text-[#94A3B8]" />
                <span className="truncate">{contact.phone}</span>
              </a>
            ) : null}
          </div>
        )}

        {contact.notes ? (
          <div className="mt-4 rounded-xl bg-[#F8FAFC] px-4 py-3">
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#94A3B8]">
              Notes
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-[#334155]">{contact.notes}</p>
          </div>
        ) : null}
      </div>

      {/* Interaction timeline */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Interactions</h2>
          <button
            onClick={() => setLogging(true)}
            className="text-sm font-medium text-primary hover:underline"
          >
            + Log
          </button>
        </div>

        {interactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white px-5 py-10 text-center">
            <p className="text-sm font-medium text-[#475569]">No interactions logged yet.</p>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Log a call, email, or meeting to reset the follow-up clock.
            </p>
          </div>
        ) : (
          <ol className="relative space-y-3 pl-2">
            {interactions.map((it) => {
              const Icon = KIND_ICON[it.kind];
              return (
                <li
                  key={it.id}
                  className="relative flex gap-3 rounded-2xl border border-[#EEF2F6] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#0F172A]">
                        {KIND_LABEL[it.kind]}
                      </span>
                      <span className="shrink-0 text-[12px] text-[#94A3B8]">
                        {relativeTime(it.occurredAt)}
                      </span>
                    </div>
                    {it.summary ? (
                      <p className="mt-0.5 whitespace-pre-wrap text-sm text-[#475569]">
                        {it.summary}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Log modal */}
      <Modal
        open={logging}
        onClose={() => setLogging(false)}
        title="Log interaction"
        subtitle="This resets the follow-up clock for this deal."
      >
        <LogForm
          submitting={submitting}
          onSubmit={handleLog}
          onCancel={() => setLogging(false)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit contact"
        subtitle="Update deal details and stage."
      >
        <ContactForm
          initial={contact}
          submitting={submitting}
          onSubmit={handleEdit}
          onCancel={() => setEditing(false)}
        />
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete contact?"
        subtitle="This removes the contact and all its interactions. This can't be undone."
      >
        <div className="flex gap-2">
          <GhostButton onClick={() => setConfirmDelete(false)} className="flex-1">
            Cancel
          </GhostButton>
          <PrimaryButton
            onClick={handleDelete}
            disabled={submitting}
            className="flex-1 bg-[#DC2626]"
          >
            {submitting ? "Deleting..." : "Delete"}
          </PrimaryButton>
        </div>
      </Modal>
    </AppShell>
  );
}

function IconButton({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
        danger
          ? "border-[#FEE2E2] text-[#DC2626] hover:bg-[#FEF2F2]"
          : "border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]",
      )}
    >
      {children}
    </button>
  );
}
