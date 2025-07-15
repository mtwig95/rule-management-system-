import mongoose, { Schema, Document } from 'mongoose';

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
    ruleIndex: number;
    source: Source[];
    destination: Destination[];
    action: 'Allow' | 'Block';
    createdAt: Date;
    updatedAt: Date;
}

const RuleSchema = new Schema<RuleDocument>(
    {
        tenantId: { type: String, required: true },
        ruleIndex: { type: Number, required: true },
        source: [
            {
                name: { type: String, required: true },
                email: { type: String, required: true },
            },
        ],
        destination: [
            {
                name: { type: String, required: true },
                address: { type: String, required: true },
            },
        ],
        action: {
            type: String,
            enum: ['Allow', 'Block'],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

RuleSchema.index({ tenantId: 1, ruleIndex: 1 }, { unique: true });

export const RuleModel = mongoose.model<RuleDocument>('Rule', RuleSchema);
