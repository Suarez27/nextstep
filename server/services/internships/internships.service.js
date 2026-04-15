function createInternshipsService({ internshipsRepository, nowIso }) {
    return {
        create(authUser, payload) {
            const company = internshipsRepository.findCompanyByUserId(authUser.id);

            if (!company) {
                const err = new Error("Perfil de empresa incompleto");
                err.status = 400;
                err.code = "COMPANY_PROFILE_INCOMPLETE";
                throw err;
            }

            const id = internshipsRepository.createInternship({
                companyId: company.id,
                payload,
                createdAt: nowIso(),
            });

            return internshipsRepository.findById(id);
        },

        list() {
            return internshipsRepository.listAll();
        },
    };
}

module.exports = { createInternshipsService };