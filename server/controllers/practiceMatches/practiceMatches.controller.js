const { ok, created } = require("../../utils/http/responses");

function createPracticeMatchesController({ practiceMatchesService }) {
    return {
        getMatches: (req, res, next) => {
            try {
                const internshipId = Number(req.params.internshipId);
                const userId = req.user.id;
                
                const result = practiceMatchesService.getMatches(internshipId, userId);
                return ok(res, result);
            } catch (error) {
                return next(error);
            }
        },

        saveMatch: (req, res, next) => {
            try {
                const internshipId = Number(req.params.internshipId);
                const userId = req.user.id;
                const { studentId, matchStatus, score, notes } = req.body;
                
                const data = {
                    internshipId,
                    studentId: Number(studentId),
                    matchStatus,
                    score,
                    notes
                };
                
                const result = practiceMatchesService.saveMatch(userId, data);
                return created(res, result);
            } catch (error) {
                return next(error);
            }
        }
    };
}

module.exports = { createPracticeMatchesController };
