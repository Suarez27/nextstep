const { z } = require("zod");

const applicationStatusSchema = z.object({
    status: z.enum(["pendiente", "aceptada", "rechazada"]),
});

module.exports = { applicationStatusSchema };