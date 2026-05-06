function createVerificationAuditsService({ verificationAuditsRepository }) {
    return {
        listAdmin(query) {
            const page = Number(query.page || 1);
            const perPage = Number(query.perPage || 10);
            const sortField = query.sortField || "id";
            const sortOrder = (query.sortOrder || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

            let filter = {};
            try {
                filter = query.filter ? JSON.parse(query.filter) : {};
            } catch (_error) {
                filter = {};
            }

            const result = verificationAuditsRepository.listAdmin({
                page: page > 0 ? page : 1,
                perPage: perPage > 0 ? perPage : 10,
                sortField,
                sortOrder,
                filter,
            });

            return {
                data: result.rows,
                meta: { total: result.total },
            };
        },

        getById(id) {
            const audit = verificationAuditsRepository.findById(id);
            if (!audit) {
                const err = new Error("Registro de auditoria no encontrado");
                err.status = 404;
                err.code = "AUDIT_NOT_FOUND";
                throw err;
            }
            return audit;
        },
    };
}

module.exports = { createVerificationAuditsService };
