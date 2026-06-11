import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { Types } from "mongoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export type InteractionKind = "call" | "email" | "meeting" | "note";

/**
 * Interaction — a logged touch against a contact (call, email, meeting, note).
 * The recency of interactions is what powers the cold-deal detection in the
 * pipeline view.
 */
@modelOptions({
  schemaOptions: {
    collection: "tbl_crm_interactions",
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Interaction extends CommonTypegooseEntity {
  @prop({ type: Types.ObjectId, required: true, index: true })
  contactId!: Types.ObjectId;

  @prop({ type: String, default: "note" })
  kind!: InteractionKind;

  @prop({ type: String, default: "" })
  summary!: string;

  /** When the interaction actually happened (defaults to now on quick-log). */
  @prop({ type: Date, default: () => new Date() })
  occurredAt!: Date;
}

export const InteractionModel = getModelForClass(Interaction);
