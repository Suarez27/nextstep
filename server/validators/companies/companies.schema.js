const { z } = require("zod");

const optionalText = (max) =>
    z
        .string()
        .trim()
        .max(max)
        .optional()
        .nullable()
        .transform((value) => value || "");

const optionalEmail = z
    .preprocess(
        (value) => {
            if (typeof value === "string" && value.trim() === "") return undefined;
            return value;
        },
        z.string().trim().email().max(200).optional().nullable()
    )
    .transform((value) => (value ? value.toLowerCase() : ""));

const activeFlag = z
    .preprocess((value) => {
        if (value === "true" || value === "1" || value === 1) return true;
        if (value === "false" || value === "0" || value === 0) return false;
        return value;
    }, z.boolean().default(true));

const companyProfileSchema = z.object({
    company_name: z.string().trim().min(2).max(200),
    sector: optionalText(120),
    city: optionalText(120),
    description: optionalText(4000),
    contact_email: optionalEmail,
    contact_phone: optionalText(50),
    contact_person: optionalText(150),
});

const companyAdminSchema = companyProfileSchema.extend({
    email: optionalEmail,
    is_active: activeFlag,
});

module.exports = {
    companyProfileSchema,
    companyAdminSchema,
};
