const express = require("express");

function createCatalogsPublicRoutes({ catalogsController }) {
    const router = express.Router();

    router.get("/", catalogsController.listActive);
    router.get("/:key/items", catalogsController.getActiveItemsByKey);
    router.get("/:key", catalogsController.getActiveWithItemsByKey);

    return router;
}

module.exports = { createCatalogsPublicRoutes };
