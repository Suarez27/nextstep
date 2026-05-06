const { z } = require("zod");

function normalizedOptionalString(max) {
    return z.preprocess((value) => {
        if (typeof value === "undefined") return undefined;
        if (value === null) return "";
        return String(value).trim();
    }, z.string().max(max).optional());
}

const studentProfileSchema = z.object({
    cv_text: normalizedOptionalString(6000),
    skills: normalizedOptionalString(1500),
    cv_pdf_url: normalizedOptionalString(500),
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

const documentValidationSchema = z.object({
    notes: normalizedOptionalString(1000),
});

const documentRejectionSchema = z.object({
    notes: z.preprocess((value) => String(value || "").trim(), z.string().min(1).max(1000)),
});

const studentRejectionSchema = z.object({
    notes: z.preprocess((value) => String(value || "").trim(), z.string().min(1).max(500)),
});

module.exports = {
    studentProfileSchema,
    createStudentSchema,
    resetStudentPasswordSchema,
    documentValidationSchema,
    documentRejectionSchema,
    studentRejectionSchema,
};
