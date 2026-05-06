function createAgreementsService({ agreementsRepository, nowIso }) {
    return {
        create(authUser, payload) {
            let center = agreementsRepository.findCenterByUserId(authUser.id);
            if (!center) {
                center = { id: 1 };
            }

            return {
                id: agreementsRepository.create({
                    internshipId: payload.internship_id,
                    studentId: payload.student_id,
                    centerId: center.id,
                    notes: payload.notes,
                    signedAt: nowIso(),
                    createdAt: nowIso(),
                }),
            };
        },

        list() {
            return agreementsRepository.listAll();
        },
    };
}

module.exports = { createAgreementsService };