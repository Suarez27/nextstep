const { z } = require("zod");

const centerProfileSchema = z.object({
    center_name: z.string().min(2).max(200),
    city: z.string().max(120).default(""),
});

const activeFlag = z
    .preprocess((value) => {
        if (value === "true" || value === "1" || value === 1) return true;
        if (value === "false" || value === "0" || value === 0) return false;
        return value;
    }, z.boolean().default(false));

const centerAdminSchema = centerProfileSchema.extend({
    is_verified: activeFlag,
});

module.exports = {
    centerProfileSchema,
    centerAdminSchema,
};