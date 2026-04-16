const { z } = require("zod");

const catalogSchema = z.object({
    key: z.string().trim().min(2).max(100),
    name: z.string().trim().min(2).max(150),
    description: z.string().trim().max(4000).nullable().optional().transform((value) => value || null),
    is_active: z.boolean().default(true),
});

module.exports = {
    catalogSchema,
};
