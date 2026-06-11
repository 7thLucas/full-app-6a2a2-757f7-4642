import type { Request, Response } from "express";
import { CrmService } from "./crm.service";

function fail(res: Response, status: number, message: string) {
  return res.status(status).json({ success: false, message });
}

function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? (id[0] ?? "") : String(id ?? "");
}

export async function listContacts(_req: Request, res: Response) {
  try {
    const data = await CrmService.listContacts();
    return res.json({ success: true, data });
  } catch (error) {
    console.error("[CRM] listContacts failed:", error);
    return fail(res, 500, "Failed to load contacts");
  }
}

export async function followUpToday(req: Request, res: Response) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 20);
    const data = await CrmService.getFollowUpToday(limit);
    return res.json({ success: true, data });
  } catch (error) {
    console.error("[CRM] followUpToday failed:", error);
    return fail(res, 500, "Failed to load follow-up list");
  }
}

export async function getContact(req: Request, res: Response) {
  try {
    const contact = await CrmService.getContact(paramId(req));
    if (!contact) return fail(res, 404, "Contact not found");
    const interactions = await CrmService.listInteractions(paramId(req));
    return res.json({ success: true, data: { contact, interactions } });
  } catch (error) {
    console.error("[CRM] getContact failed:", error);
    return fail(res, 500, "Failed to load contact");
  }
}

export async function createContact(req: Request, res: Response) {
  try {
    const name = String(req.body?.name ?? "").trim();
    if (!name) return fail(res, 400, "Name is required");
    const contact = await CrmService.createContact(req.body);
    return res.status(201).json({ success: true, data: contact });
  } catch (error) {
    console.error("[CRM] createContact failed:", error);
    return fail(res, 500, "Failed to create contact");
  }
}

export async function updateContact(req: Request, res: Response) {
  try {
    const contact = await CrmService.updateContact(paramId(req), req.body);
    if (!contact) return fail(res, 404, "Contact not found");
    return res.json({ success: true, data: contact });
  } catch (error) {
    console.error("[CRM] updateContact failed:", error);
    return fail(res, 500, "Failed to update contact");
  }
}

export async function deleteContact(req: Request, res: Response) {
  try {
    const ok = await CrmService.deleteContact(paramId(req));
    if (!ok) return fail(res, 404, "Contact not found");
    return res.json({ success: true });
  } catch (error) {
    console.error("[CRM] deleteContact failed:", error);
    return fail(res, 500, "Failed to delete contact");
  }
}

export async function listInteractions(req: Request, res: Response) {
  try {
    const data = await CrmService.listInteractions(paramId(req));
    return res.json({ success: true, data });
  } catch (error) {
    console.error("[CRM] listInteractions failed:", error);
    return fail(res, 500, "Failed to load interactions");
  }
}

export async function logInteraction(req: Request, res: Response) {
  try {
    const interaction = await CrmService.logInteraction(paramId(req), req.body);
    if (!interaction) return fail(res, 404, "Contact not found");
    return res.status(201).json({ success: true, data: interaction });
  } catch (error) {
    console.error("[CRM] logInteraction failed:", error);
    return fail(res, 500, "Failed to log interaction");
  }
}
