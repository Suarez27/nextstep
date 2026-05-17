const { z } = require("zod");

const followupSchema = z.object({
    assignment_id: z.number().int().min(1),
    student_id: z.number().int().min(1).optional(),
    content: z.string().min(4).max(3000),
    progress: z.number().int().min(0).max(100).optional(),
});

module.exports = { followupSchema };