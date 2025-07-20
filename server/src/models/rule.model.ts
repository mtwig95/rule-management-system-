import mongoose, { Schema, Document } from "mongoose";

export interface Source {
  name: string;
  email: string;
}

export interface Destination {
  name: string;
  address: string;
}

export interface RuleDocument extends Document {
  tenantId: string;
  name: string;
  ruleIndex: number;
  source: Source[];
  destination: Destination[];
  action: "Allow" | "Block";
  createdAt: Date;
  updatedAt: Date;
}

const RuleSchema = new Schema<RuleDocument>(
  {
    tenantId: { type: String, required: true },
    name: { type: String },
    ruleIndex: { type: Number, required: true },
    source: [
      {
        name: { type: String },
        email: { type: String },
      },
    ],
    destination: [
      {
        name: { type: String },
        address: { type: String },
      },
    ],
    action: {
      type: String,
      enum: ["Allow", "Block"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

RuleSchema.index({ tenantId: 1, ruleIndex: 1 }, { unique: true });

export const RuleModel = mongoose.model<RuleDocument>("Rule", RuleSchema);
