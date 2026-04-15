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
    };
}

module.exports = { createCentersService };