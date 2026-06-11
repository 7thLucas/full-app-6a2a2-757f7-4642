import { Router } from "express";
// Import module-discovered routes
import moduleRoutes from "./routes";
import { initializeModels } from "./models";
// CRM (app-level, registered explicitly — lives outside app/modules)
import "./crm/models/contact.model";
import "./crm/models/interaction.model";
import crmRoutes from "./crm/crm.routes";

// Initialize module models (configurables, etc.)
await initializeModels();

const router = Router();

// App-level CRM API
router.use(crmRoutes);
// Module-discovered API (configurables, injected scaffolds)
router.use(moduleRoutes);

export default router;
