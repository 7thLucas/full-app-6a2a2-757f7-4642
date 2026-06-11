import { Types } from "mongoose";
import { createLogger } from "~/lib/logger";
import { ContactModel } from "./models/contact.model";
import { InteractionModel } from "./models/interaction.model";

const logger = createLogger("CrmSeed");
const DAY_MS = 1000 * 60 * 60 * 24;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
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
        stage: "proposal",
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
        stage: "negotiation",
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
        stage: "contacted",
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
        stage: "proposal",
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
        stage: "contacted",
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
        stage: "won",
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
