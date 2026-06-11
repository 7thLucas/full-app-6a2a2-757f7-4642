import { Types } from "mongoose";
import { ContactModel } from "./models/contact.model";
import { InteractionModel, type InteractionKind } from "./models/interaction.model";
import { ConfigurableModel } from "~/modules/configurables/src/models/configurables.model";
import { defaultConfigurablesData } from "~/modules/configurables/src/constants/configurables.default";

const DAY_MS = 1000 * 60 * 60 * 24;

export type DealTemperature = "cold" | "warming" | "fresh";

export interface ContactInput {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  stage?: string;
  value?: number;
  notes?: string;
}

export interface InteractionInput {
  kind?: InteractionKind;
  summary?: string;
  occurredAt?: string | Date;
}

export interface ContactDto {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  stage: string;
  value: number;
  notes: string;
  lastContactedAt: string;
  daysSinceContact: number;
  temperature: DealTemperature;
  createdAt: string;
  updatedAt: string;
}

export interface InteractionDto {
  id: string;
  contactId: string;
  kind: InteractionKind;
  summary: string;
  occurredAt: string;
  createdAt: string;
}

/** "Won" deals are closed and never need chasing — exclude from cold detection. */
const CLOSED_STAGES = new Set(["won", "lost", "closed"]);

async function getThresholds(): Promise<{ cold: number; warming: number }> {
  try {
    const doc = await ConfigurableModel.findOne({ _singleton: true }).lean().exec();
    const data = (doc?.configurable_data ?? {}) as Record<string, unknown>;
    const cold = Number(data.coldThresholdDays);
    const warming = Number(data.warmingThresholdDays);
    return {
      cold: Number.isFinite(cold) && cold > 0 ? cold : defaultConfigurablesData.coldThresholdDays,
      warming:
        Number.isFinite(warming) && warming > 0
          ? warming
          : defaultConfigurablesData.warmingThresholdDays,
    };
  } catch {
    return {
      cold: defaultConfigurablesData.coldThresholdDays,
      warming: defaultConfigurablesData.warmingThresholdDays,
    };
  }
}

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / DAY_MS);
}

function classify(
  daysSinceContact: number,
  stage: string,
  thresholds: { cold: number; warming: number },
): DealTemperature {
  if (CLOSED_STAGES.has(stage)) return "fresh";
  if (daysSinceContact >= thresholds.cold) return "cold";
  if (daysSinceContact >= thresholds.warming) return "warming";
  return "fresh";
}

function toContactDto(
  doc: any,
  now: Date,
  thresholds: { cold: number; warming: number },
): ContactDto {
  const lastContactedAt: Date = doc.lastContactedAt ?? doc.createdAt ?? now;
  const daysSinceContact = Math.max(0, daysBetween(new Date(lastContactedAt), now));
  return {
    id: String(doc._id),
    name: doc.name,
    company: doc.company ?? "",
    email: doc.email ?? "",
    phone: doc.phone ?? "",
    stage: doc.stage ?? "lead",
    value: doc.value ?? 0,
    notes: doc.notes ?? "",
    lastContactedAt: new Date(lastContactedAt).toISOString(),
    daysSinceContact,
    temperature: classify(daysSinceContact, doc.stage ?? "lead", thresholds),
    createdAt: new Date(doc.createdAt ?? now).toISOString(),
    updatedAt: new Date(doc.updatedAt ?? now).toISOString(),
  };
}

function toInteractionDto(doc: any): InteractionDto {
  return {
    id: String(doc._id),
    contactId: String(doc.contactId),
    kind: doc.kind ?? "note",
    summary: doc.summary ?? "",
    occurredAt: new Date(doc.occurredAt ?? doc.createdAt).toISOString(),
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export class CrmService {
  static async listContacts(): Promise<ContactDto[]> {
    const now = new Date();
    const thresholds = await getThresholds();
    const docs = await ContactModel.find({ deletedAt: null })
      .sort({ lastContactedAt: 1 })
      .lean()
      .exec();
    return docs.map((d) => toContactDto(d, now, thresholds));
  }

  /**
   * The hero query: the "chase these now" shortlist. Open, non-closed deals
   * sorted by how cold they are (oldest last-touch first), limited to the top
   * few so the operator instantly sees who to follow up with today.
   */
  static async getFollowUpToday(limit = 5): Promise<ContactDto[]> {
    const contacts = await CrmService.listContacts();
    return contacts
      .filter((c) => c.temperature === "cold" || c.temperature === "warming")
      .sort((a, b) => {
        // cold before warming, then by most days since contact
        if (a.temperature !== b.temperature) return a.temperature === "cold" ? -1 : 1;
        return b.daysSinceContact - a.daysSinceContact;
      })
      .slice(0, limit);
  }

  static async getContact(id: string): Promise<ContactDto | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const now = new Date();
    const thresholds = await getThresholds();
    const doc = await ContactModel.findOne({ _id: id, deletedAt: null }).lean().exec();
    return doc ? toContactDto(doc, now, thresholds) : null;
  }

  static async createContact(input: ContactInput): Promise<ContactDto> {
    const now = new Date();
    const thresholds = await getThresholds();
    const doc = await ContactModel.create({
      name: input.name.trim(),
      company: input.company?.trim() ?? "",
      email: input.email?.trim() ?? "",
      phone: input.phone?.trim() ?? "",
      stage: input.stage ?? "lead",
      value: Number(input.value) || 0,
      notes: input.notes?.trim() ?? "",
      lastContactedAt: now,
    });
    return toContactDto(doc.toObject(), now, thresholds);
  }

  static async updateContact(id: string, input: ContactInput): Promise<ContactDto | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const now = new Date();
    const thresholds = await getThresholds();
    const update: Record<string, unknown> = {};
    if (input.name !== undefined) update.name = input.name.trim();
    if (input.company !== undefined) update.company = input.company.trim();
    if (input.email !== undefined) update.email = input.email.trim();
    if (input.phone !== undefined) update.phone = input.phone.trim();
    if (input.stage !== undefined) update.stage = input.stage;
    if (input.value !== undefined) update.value = Number(input.value) || 0;
    if (input.notes !== undefined) update.notes = input.notes.trim();

    const doc = await ContactModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: update },
      { new: true },
    )
      .lean()
      .exec();
    return doc ? toContactDto(doc, now, thresholds) : null;
  }

  static async deleteContact(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await ContactModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
    ).exec();
    if (!res) return false;
    await InteractionModel.deleteMany({ contactId: new Types.ObjectId(id) }).exec();
    return true;
  }

  static async listInteractions(contactId: string): Promise<InteractionDto[]> {
    if (!Types.ObjectId.isValid(contactId)) return [];
    const docs = await InteractionModel.find({ contactId: new Types.ObjectId(contactId) })
      .sort({ occurredAt: -1 })
      .lean()
      .exec();
    return docs.map(toInteractionDto);
  }

  /**
   * Log an interaction and bump the contact's lastContactedAt so the deal
   * resets to "fresh" — this is the core loop that keeps the pipeline honest.
   */
  static async logInteraction(
    contactId: string,
    input: InteractionInput,
  ): Promise<InteractionDto | null> {
    if (!Types.ObjectId.isValid(contactId)) return null;
    const contact = await ContactModel.findOne({ _id: contactId, deletedAt: null }).exec();
    if (!contact) return null;

    const occurredAt = input.occurredAt ? new Date(input.occurredAt) : new Date();
    const doc = await InteractionModel.create({
      contactId: new Types.ObjectId(contactId),
      kind: input.kind ?? "note",
      summary: input.summary?.trim() ?? "",
      occurredAt,
    });

    // Keep the denormalized recency in sync (only advance forward).
    if (!contact.lastContactedAt || occurredAt > contact.lastContactedAt) {
      contact.lastContactedAt = occurredAt;
      await contact.save();
    }

    return toInteractionDto(doc.toObject());
  }
}
