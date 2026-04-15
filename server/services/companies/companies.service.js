function createCompaniesService({ companiesRepository, nowIso }) {
    return {
        getMyCompany(userId) {
            const company = companiesRepository.findByUserId(userId);

            if (!company) {
                const err = new Error("Perfil de empresa no encontrado");
                err.status = 404;
                err.code = "COMPANY_PROFILE_NOT_FOUND";
                throw err;
            }

            return company;
        },

        updateMyCompany(userId, payload) {
            const existing = companiesRepository.findByUserId(userId);

            if (!existing) {
                companiesRepository.createForUser({
                    userId,
                    companyName: payload.company_name,
                    sector: payload.sector,
                    city: payload.city,
                    createdAt: nowIso(),
                });
            } else {
                companiesRepository.updateByUserId({
                    userId,
                    companyName: payload.company_name,
                    sector: payload.sector,
                    city: payload.city,
                });
            }

            return companiesRepository.findByUserId(userId);
        },
    };
}

module.exports = { createCompaniesService };