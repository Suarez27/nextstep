const { fail } = require("../utils/http/responses");

function validate(schema) {
    return (req, res, next) => {
        const parsed = schema.safeParse(req.body);

        if (!parsed.success) {
            return fail(res, 400, "Validacion fallida", {
                code: "VALIDATION_ERROR",
                issues: parsed.error.issues,
            });
        }

        req.body = parsed.data;
        return next();
    };
}

module.exports = { validate };