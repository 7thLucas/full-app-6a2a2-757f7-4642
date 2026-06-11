import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

/**
 * Contact — a person/account the solo operator is working.
 * Each contact carries the deal context (stage + value) that feeds the
 * pipeline view. Interactions are stored separately and reference a contact.
 */
@modelOptions({
  schemaOptions: {
    collection: "tbl_crm_contacts",
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Contact extends CommonTypegooseEntity {
  @prop({ type: String, required: true, trim: true })
  name!: string;

  @prop({ type: String, default: "" })
  company!: string;

  @prop({ type: String, default: "" })
  email!: string;

  @prop({ type: String, default: "" })
  phone!: string;

  /** Pipeline stage key (matches a configurable pipeline stage). */
  @prop({ type: String, default: "lead" })
  stage!: string;

  /** Estimated deal value in whole currency units. */
  @prop({ type: Number, default: 0 })
  value!: number;

  @prop({ type: String, default: "" })
  notes!: string;

  /**
   * Last time the operator touched this contact. Denormalized from the most
   * recent interaction (or contact creation) so the pipeline can sort by
   * recency cheaply without joining the interactions collection.
   */
  @prop({ type: Date, default: () => new Date() })
  lastContactedAt!: Date;
}

export const ContactModel = getModelForClass(Contact);
