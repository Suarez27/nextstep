const { z } = require("zod");

const centerProfileSchema = z.object({
    center_name: z.string().min(2).max(200),
    city: z.string().max(120).default(""),
});

module.exports = {
    centerProfileSchema,
};