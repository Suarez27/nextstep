const { z } = require("zod");

const registerSchema = z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200),
    password: z.string().min(8).max(120),
    role: z.enum(["centro", "empresa", "alumno"]),
    center_id: z
        .preprocess((value) => {
            if (value === "" || value === null || typeof value === "undefined") return undefined;
            return Number(value);
        }, z.number().int().positive().optional()),
}).superRefine((data, ctx) => {
    if (data.role === "alumno" && !data.center_id) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["center_id"],
            message: "center_id es obligatorio para alumnos",
        });
    }
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

module.exports = {
    registerSchema,
    loginSchema,
};