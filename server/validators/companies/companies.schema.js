const { z } = require("zod");

const companyProfileSchema = z.object({
    company_name: z.string().min(2).max(200),
    sector: z.string().max(120).default(""),
    city: z.string().max(120).default(""),
});

module.exports = {
    companyProfileSchema,
};