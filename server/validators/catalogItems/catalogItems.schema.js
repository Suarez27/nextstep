const { z } = require("zod");

const jsonTextSchema = z
    .string()
    .trim()
    .max(10000)
    .nullable()
    .optional()
    .transform((value, ctx) => {
        if (!value) return null;

        try {
            JSON.parse(value);
            return value;
        } catch (_error) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "meta_json debe ser un JSON valido",
            });
            return z.NEVER;
        }
    });

const catalogItemSchema = z.object({
    catalog_id: z.coerce.number().int().min(1),
    value: z.string().trim().min(1).max(120),
    label: z.string().trim().min(1).max(150),
    description: z.string().trim().max(4000).nullable().optional().transform((value) => value || null),
    sort_order: z.coerce.number().int().min(0).max(100000).default(0),
    meta_json: jsonTextSchema,
    is_active: z.boolean().default(true),
});

module.exports = {
    catalogItemSchema,
};
