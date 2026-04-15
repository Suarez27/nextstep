const { z } = require("zod");

const registerSchema = z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200),
    password: z.string().min(8).max(120),
    role: z.enum(["centro", "empresa"]),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

module.exports = {
    registerSchema,
    loginSchema,
};