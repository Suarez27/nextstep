const { z } = require("zod");

const APPLICATION_STATUSES = [
    "enviada",
    "en_revision",
    "aceptada",
    "rechazada",
    "a_entrevista",
];

const applicationStatusSchema = z.object({
    status: z.enum(APPLICATION_STATUSES),
    notes: z.string().trim().max(1000).optional(),
    internal_notes: z.string().trim().max(2000).optional(),
});

module.exports = {
    APPLICATION_STATUSES,
    applicationStatusSchema,
};
