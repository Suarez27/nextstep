const { z } = require("zod");

const interviewSchema = z.object({
    application_id: z.number().int().min(1),
    interview_at: z.string().min(10).max(40),
    notes: z.string().max(2000).default(""),
});

module.exports = { interviewSchema };