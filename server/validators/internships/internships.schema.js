const { z } = require("zod");

const internshipSchema = z.object({
    title: z.string().min(4).max(200),
    description: z.string().min(10).max(4000),
    hours_total: z.number().int().min(1).max(2000),
    schedule: z.string().max(120).default(""),
    slots: z.number().int().min(1).max(50),
});

module.exports = { internshipSchema };