/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
      maxLength: 140,
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "followUpHeading",
      type: "string",
      required: false,
      label: "Follow-up Section Heading",
      maxLength: 80,
    },
    {
      fieldName: "followUpSubheading",
      type: "string",
      required: false,
      label: "Follow-up Section Subheading",
      maxLength: 160,
    },
    {
      fieldName: "emptyFollowUpMessage",
      type: "string",
      required: false,
      label: "Empty Follow-up Message",
      maxLength: 160,
    },
    {
      fieldName: "pipelineStages",
      type: "array",
      required: false,
      label: "Pipeline Stages",
      item: {
        type: "object",
        fields: [
          { fieldName: "key", type: "string", required: true, label: "Key" },
          { fieldName: "label", type: "string", required: true, label: "Label" },
        ],
      },
    },
    {
      fieldName: "coldThresholdDays",
      type: "number",
      required: false,
      label: "Cold Threshold (days)",
      min: 1,
      max: 365,
    },
    {
      fieldName: "warmingThresholdDays",
      type: "number",
      required: false,
      label: "Warming Threshold (days)",
      min: 1,
      max: 365,
    },
  ],
};
