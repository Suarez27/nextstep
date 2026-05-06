const { z } = require("zod");

const INTERNSHIP_STATUSES = [
    "borrador",
    "publicada",
    "pausada",
    "cerrada",
    "cancelada",
];

const emptyToNull = (value) => {
    if (value === "" || value === undefined || value === null) return null;
    return value;
};

const nullableId = z.preprocess(
    emptyToNull,
    z.coerce.number().int().min(1).nullable()
);

const optionalText = (max) =>
    z
        .string()
        .trim()
        .max(max)
        .optional()
        .nullable()
        .transform((value) => value || null);

const optionalDate = z
    .preprocess(emptyToNull, z.string().trim().max(40).nullable())
    .optional()
    .transform((value) => value || null);

const activeFlag = z.preprocess((value) => {
    if (value === "" || value === null || typeof value === "undefined") return true;
    if (value === "true" || value === "1" || value === 1) return true;
    if (value === "false" || value === "0" || value === 0) return false;
    return value;
}, z.boolean().default(true));

const internshipBaseSchema = z.object({
    area_item_id: nullableId.default(null),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(4000),
    hours_total: z.coerce.number().int().min(1).max(2000),
    schedule: z.string().trim().min(1).max(120),
    slots: z.coerce.number().int().min(1).max(1000),
    requirements: optionalText(4000),
    status: z.enum(INTERNSHIP_STATUSES),
    start_date: optionalDate,
    end_date: optionalDate,
    application_deadline: optionalDate,
    is_active: activeFlag,
});

const internshipSchema = internshipBaseSchema;

const adminInternshipSchema = internshipBaseSchema.extend({
    company_id: z.coerce.number().int().min(1),
});

module.exports = {
    INTERNSHIP_STATUSES,
    internshipSchema,
    adminInternshipSchema,
};
