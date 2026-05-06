const { z } = require("zod");

const followupSchema = z.object({
    student_id: z.number().int().min(1),
    content: z.string().min(4).max(3000),
    progress: z.number().int().min(0).max(100),
});

module.exports = { followupSchema };