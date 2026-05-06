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

        updateAdmin(id, payload, actorUserId) {
            const existing = centersRepository.findById(id);
            if (!existing) {
                const err = new Error("Centro no encontrado");
                err.status = 404;
                err.code = "CENTER_NOT_FOUND";
                throw err;
            }

            const previousStatus = existing.verification_status || (existing.is_verified ? "approved" : "pending");
            const shouldApprove = !!payload.is_verified;
            const note = String(payload.validation_note || "").trim();

            if (!shouldApprove && !note) {
                const err = new Error("Debes indicar un motivo al rechazar o desactivar un centro");
                err.status = 400;
                err.code = "VALIDATION_NOTE_REQUIRED";
                throw err;
            }

            const nextStatus = shouldApprove ? "approved" : "rejected";
            const now = nowIso();
            const auditNote = note || null;

            centersRepository.updateAdmin({
                id,
                payload: {
                    ...payload,
                    verification_status: nextStatus,
                    verification_note: auditNote,
                    verified_by_user_id: actorUserId,
                    verified_at: now,
                },
            });

            if (previousStatus !== nextStatus || auditNote) {
                centersRepository.createVerificationAudit({
                    entityId: id,
                    previousStatus,
                    newStatus: nextStatus,
                    note: auditNote,
                    validatedByUserId: actorUserId,
                    createdAt: now,
                });
            }

            return centersRepository.findById(id);
        },
    };
}

module.exports = { createCentersService };