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
    validation_note: z.string().trim().max(500).optional().nullable(),
}).superRefine((data, ctx) => {
    if (!data.is_verified) {
        const note = String(data.validation_note || "").trim();
        if (!note) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["validation_note"],
                message: "El motivo es obligatorio al rechazar",
            });
        }
    }
});

module.exports = {
    centerProfileSchema,
    centerAdminSchema,
};