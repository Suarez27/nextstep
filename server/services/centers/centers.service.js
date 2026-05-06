function createCentersService({ centersRepository, nowIso }) {
    function ensureForUser(userId, fallbackName = "Centro Educativo", fallbackCity = "") {
        let center = centersRepository.findByUserId(userId);
        if (center) return center;

        centersRepository.createForUser({
            userId,
            centerName: fallbackName,
            city: fallbackCity,
            createdAt: nowIso(),
        });

        center = centersRepository.findByUserId(userId);
        return center;
    }

    return {
        getMyCenter({ userId, userName }) {
            return ensureForUser(userId, `Centro de ${userName}`, "");
        },

        updateMyCenter({ userId, userName, payload }) {
            const center = ensureForUser(userId, `Centro de ${userName}`, "");

            centersRepository.updateById({
                id: center.id,
                centerName: payload.center_name,
                city: payload.city,
            });

            return centersRepository.findById(center.id);
        },

        listApproved() {
            return centersRepository.listApproved();
        },

        listAdmin(query) {
            const page = Number(query.page || 1);
            const perPage = Number(query.perPage || 10);
            const sortField = query.sortField || "id";
            const sortOrder = (query.sortOrder || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";

            let filter = {};
            try {
                filter = query.filter ? JSON.parse(query.filter) : {};
            } catch (_error) {
                filter = {};
            }

            const result = centersRepository.listAdmin({
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
            const center = centersRepository.findById(id);
            if (!center) {
                const err = new Error("Centro no encontrado");
                err.status = 404;
                err.code = "CENTER_NOT_FOUND";
                throw err;
            }
            return center;
        },

        updateAdmin(id, payload) {
            const existing = centersRepository.findById(id);
            if (!existing) {
                const err = new Error("Centro no encontrado");
                err.status = 404;
                err.code = "CENTER_NOT_FOUND";
                throw err;
            }

            centersRepository.updateAdmin({ id, payload });
            return centersRepository.findById(id);
        },
    };
}

module.exports = { createCentersService };