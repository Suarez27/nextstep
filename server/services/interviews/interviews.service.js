function createInterviewsService({ interviewsRepository, nowIso }) {
    return {
        create(payload) {
            return { id: interviewsRepository.create({ payload, createdAt: nowIso() }) };
        },

        listMy() {
            return interviewsRepository.listMy();
        },
    };
}

module.exports = { createInterviewsService };