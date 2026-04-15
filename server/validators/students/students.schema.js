const { z } = require("zod");

const studentProfileSchema = z.object({
    cv_text: z.string().max(6000).default(""),
    skills: z.string().max(1500).default(""),
});

const createStudentSchema = z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200),
    password: z.string().min(8).max(120),
    center_id: z.number().int().min(1).optional(),
});

const resetStudentPasswordSchema = z.object({
    password: z.string().min(8).max(120),
});

module.exports = {
    studentProfileSchema,
    createStudentSchema,
    resetStudentPasswordSchema,
};