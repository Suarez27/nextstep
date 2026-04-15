const { fail } = require("../utils/http/responses");

function errorHandler(err, _req, res, _next) {
    console.error(err);

    if (res.headersSent) {
        return;
    }

    return fail(res, err.status || 500, err.message || "Error interno del servidor", {
        code: err.code || "INTERNAL_ERROR",
    });
}

module.exports = { errorHandler };