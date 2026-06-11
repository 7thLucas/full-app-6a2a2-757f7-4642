import { Types } from "mongoose";
import { createLogger } from "~/lib/logger";
import { ContactModel } from "./models/contact.model";
import { InteractionModel } from "./models/interaction.model";
import { PIPELINE_STAGES, STAGE_KEYS, normalizeStage } from "./stages";
import { ConfigurableModel } from "~/modules/configurables/src/models/configurables.model";

const logger = createLogger("CrmSeed");
const DAY_MS = 1000 * 60 * 60 * 24;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
}

/**
 * One-time/idempotent migration: collapse any legacy pipeline stages onto the
 * three canonical stages (Lead / Active / Past) so no record is left with an
 * orphaned stage value, and keep the configurables singleton in sync.
 */
export async function migrateCrmStages(): Promise<void> {
  try {
    // 1. Normalize contact stage values.
    const contacts = await ContactModel.find({}).select({ stage: 1 }).lean().exec();
    let migrated = 0;
    for (const c of contacts) {
      const next = normalizeStage((c as { stage?: unknown }).stage);
      if (next !== (c as { stage?: unknown }).stage) {
        await ContactModel.updateOne({ _id: c._id }, { $set: { stage: next } }).exec();
        migrated += 1;
      }
    }
    if (migrated > 0) {
      logger.info(`Migrated ${migrated} contact(s) onto the new three pipeline stages`);
    }

    // 2. Keep the configurables singleton's pipelineStages in sync (only when
    //    it still holds a different stage set, e.g. the legacy five stages).
    const doc = await ConfigurableModel.findOne({ _singleton: true }).exec();
    if (doc) {
      const data = (doc.configurable_data ?? {}) as Record<string, unknown>;
      const current = Array.isArray(data.pipelineStages)
        ? (data.pipelineStages as { key?: string }[])
        : [];
      const currentKeys = current.map((s) => s?.key).join(",");
      if (currentKeys !== STAGE_KEYS.join(",")) {
        doc.set("configurable_data", { ...data, pipelineStages: PIPELINE_STAGES });
        doc.markModified("configurable_data");
        await doc.save();
        logger.info("Updated configurables pipelineStages to Lead / Active / Past");
      }
    }
  } catch (error) {
    logger.error("❌ Failed to migrate CRM pipeline stages:", error);
  }
}

/**
 * Seed a realistic solo-operator pipeline so the app opens to a meaningful
 * "follow up today" list on first run. Idempotent: skips if any contact exists.
 */
export async function seedCrm(): Promise<void> {
  try {
    const existing = await ContactModel.countDocuments({ deletedAt: null }).exec();
    if (existing > 0) return;

    logger.info("Seeding demo CRM pipeline...");

    const seedContacts = [
      {
        name: "Maya Lindqvist",
        company: "Northwind Studio",
        email: "maya@northwind.studio",
        phone: "+1 415 555 0142",
        stage: "active",
        value: 12000,
        notes: "Sent proposal, awaiting feedback on scope.",
        lastTouchDays: 11,
        kind: "email" as const,
        touchSummary: "Emailed revised proposal v2.",
      },
      {
        name: "Devon Park",
        company: "Park & Co Legal",
        email: "devon@parkco.legal",
        phone: "+1 312 555 0199",
        stage: "active",
        value: 24000,
        notes: "Negotiating annual retainer. Price-sensitive.",
        lastTouchDays: 9,
        kind: "call" as const,
        touchSummary: "Call about retainer terms.",
      },
      {
        name: "Aisha Rahman",
        company: "Brightloom",
        email: "aisha@brightloom.io",
        phone: "+44 20 7946 0321",
        stage: "active",
        value: 8000,
        notes: "Warm intro from a past client.",
        lastTouchDays: 8,
        kind: "meeting" as const,
        touchSummary: "Intro meeting — good fit, wants a quote.",
      },
      {
        name: "Carlos Mendes",
        company: "Mendes Fitness",
        email: "carlos@mendesfit.com",
        phone: "+1 305 555 0177",
        stage: "lead",
        value: 4500,
        notes: "Inbound from website form.",
        lastTouchDays: 5,
        kind: "note" as const,
        touchSummary: "Logged inbound inquiry.",
      },
      {
        name: "Hannah Cole",
        company: "Cole Interiors",
        email: "hannah@coleinteriors.com",
        phone: "+1 206 555 0188",
        stage: "active",
        value: 15500,
        notes: "Reviewing proposal with her partner.",
        lastTouchDays: 3,
        kind: "call" as const,
        touchSummary: "Quick check-in call.",
      },
      {
        name: "Tomás Iglesias",
        company: "Iglesias Imports",
        email: "tomas@iglesiasimports.com",
        phone: "+34 91 555 0210",
        stage: "active",
        value: 6200,
        notes: "Followed up after trade show.",
        lastTouchDays: 1,
        kind: "email" as const,
        touchSummary: "Sent follow-up after trade show.",
      },
      {
        name: "Priya Nair",
        company: "Nair Consulting",
        email: "priya@nairconsulting.com",
        phone: "+1 408 555 0166",
        stage: "past",
        value: 18000,
        notes: "Closed! Kickoff scheduled.",
        lastTouchDays: 2,
        kind: "meeting" as const,
        touchSummary: "Signed contract, scheduled kickoff.",
      },
    ];

    for (const c of seedContacts) {
      const lastContactedAt = daysAgo(c.lastTouchDays);
      const contact = await ContactModel.create({
        name: c.name,
        company: c.company,
        email: c.email,
        phone: c.phone,
        stage: c.stage,
        value: c.value,
        notes: c.notes,
        lastContactedAt,
      });

      await InteractionModel.create({
        contactId: new Types.ObjectId(contact._id),
        kind: c.kind,
        summary: c.touchSummary,
        occurredAt: lastContactedAt,
      });
    }

    logger.info(`✅ Seeded ${seedContacts.length} demo contacts`);
  } catch (error) {
    logger.error("❌ Failed to seed CRM demo data:", error);
  }
}
