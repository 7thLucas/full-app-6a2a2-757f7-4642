import { apiRequest } from "~/lib/api.client";

export type DealTemperature = "cold" | "warming" | "fresh";
export type InteractionKind = "call" | "email" | "meeting" | "note";

export interface Contact {
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

export interface Interaction {
  id: string;
  contactId: string;
  kind: InteractionKind;
  summary: string;
  occurredAt: string;
  createdAt: string;
}

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
  occurredAt?: string;
}

export const crmClient = {
  async followUpToday(limit = 5): Promise<Contact[]> {
    const res = await apiRequest<Contact[]>("/api/crm/follow-up", {
      method: "GET",
      params: { limit },
    });
    return res.data ?? [];
  },

  async listContacts(): Promise<Contact[]> {
    const res = await apiRequest<Contact[]>("/api/crm/contacts", { method: "GET" });
    return res.data ?? [];
  },

  async getContact(
    id: string,
  ): Promise<{ contact: Contact; interactions: Interaction[] } | null> {
    const res = await apiRequest<{ contact: Contact; interactions: Interaction[] }>(
      `/api/crm/contacts/${id}`,
      { method: "GET" },
    );
    return res.data ?? null;
  },

  async createContact(input: ContactInput): Promise<Contact | null> {
    const res = await apiRequest<Contact>("/api/crm/contacts", {
      method: "POST",
      data: input,
    });
    return res.data ?? null;
  },

  async updateContact(id: string, input: ContactInput): Promise<Contact | null> {
    const res = await apiRequest<Contact>(`/api/crm/contacts/${id}`, {
      method: "PATCH",
      data: input,
    });
    return res.data ?? null;
  },

  async deleteContact(id: string): Promise<boolean> {
    const res = await apiRequest(`/api/crm/contacts/${id}`, { method: "DELETE" });
    return Boolean(res.success);
  },

  async logInteraction(id: string, input: InteractionInput): Promise<Interaction | null> {
    const res = await apiRequest<Interaction>(`/api/crm/contacts/${id}/interactions`, {
      method: "POST",
      data: input,
    });
    return res.data ?? null;
  },
};
