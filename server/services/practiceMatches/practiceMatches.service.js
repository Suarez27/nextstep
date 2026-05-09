function createPracticeMatchesService({ practiceMatchesRepository, ensureCenterForUser }) {
    return {
        getMatches: (internshipId, userId) => {
            const center = ensureCenterForUser(userId);
            return practiceMatchesRepository.getMatchesByInternship(internshipId, center.id);
        },

        saveMatch: (userId, data) => {
            const center = ensureCenterForUser(userId);
            const timestamp = new Date().toISOString();
            
            const matchData = {
                ...data,
                centerId: center.id,
                createdByUserId: userId,
                createdAt: timestamp,
                updatedAt: timestamp
            };
            
            const matchId = practiceMatchesRepository.upsertMatch(matchData);
            return { id: matchId, ...matchData };
        }
    };
}

module.exports = { createPracticeMatchesService };
