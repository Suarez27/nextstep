const express = require("express");
const { authRequired, roleRequired, permissionRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { catalogItemSchema } = require("../validators/catalogItems/catalogItems.schema");

function createCatalogItemsRoutes({ catalogItemsController }) {
    const router = express.Router();

    router.use(authRequired, permissionRequired("adminPanel"), roleRequired("admin"));

    router.get("/", catalogItemsController.listAdmin);
    router.get("/:id", catalogItemsController.getAdmin);
    router.post("/", validate(catalogItemSchema), catalogItemsController.createAdmin);
    router.put("/:id", validate(catalogItemSchema), catalogItemsController.updateAdmin);
    router.delete("/:id", catalogItemsController.deleteAdmin);

    return router;
}

module.exports = { createCatalogItemsRoutes };
