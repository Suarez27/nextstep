const { z } = require("zod");

const agreementSchema = z.object({
    internship_id: z.number().int().min(1),
    student_id: z.number().int().min(1),
    notes: z.string().max(2000).default(""),
});

module.exports = { agreementSchema };