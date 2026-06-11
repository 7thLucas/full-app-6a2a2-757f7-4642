import { Router } from "express";
import {
  listContacts,
  followUpToday,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  listInteractions,
  logInteraction,
} from "./crm.controller";

const router = Router();

// Pipeline / follow-up
router.get("/crm/follow-up", followUpToday);

// Contacts
router.get("/crm/contacts", listContacts);
router.post("/crm/contacts", createContact);
router.get("/crm/contacts/:id", getContact);
router.patch("/crm/contacts/:id", updateContact);
router.delete("/crm/contacts/:id", deleteContact);

// Interactions
router.get("/crm/contacts/:id/interactions", listInteractions);
router.post("/crm/contacts/:id/interactions", logInteraction);

export default router;
