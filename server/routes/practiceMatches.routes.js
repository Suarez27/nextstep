const express = require("express");
const { authRequired, roleRequired } = require("../middlewares/auth");

function createPracticeMatchesRoutes({ practiceMatchesController }) {
    const router = express.Router();

    router.get(
        "/:internshipId/matches",
        authRequired,
        roleRequired("centro"),
        practiceMatchesController.getMatches
    );

    router.post(
        "/:internshipId/matches",
        authRequired,
        roleRequired("centro"),
        practiceMatchesController.saveMatch
    );

    return router;
}

module.exports = { createPracticeMatchesRoutes };
