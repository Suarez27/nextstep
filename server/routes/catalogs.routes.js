const express = require("express");
const { authRequired, roleRequired, permissionRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { catalogSchema } = require("../validators/catalogs/catalogs.schema");

function createCatalogsRoutes({ catalogsController }) {
    const router = express.Router();

    router.use(authRequired, permissionRequired("adminPanel"), roleRequired("admin"));

    router.get("/", catalogsController.listAdmin);
    router.get("/:id", catalogsController.getAdmin);
    router.post("/", validate(catalogSchema), catalogsController.createAdmin);
    router.put("/:id", validate(catalogSchema), catalogsController.updateAdmin);
    router.delete("/:id", catalogsController.deleteAdmin);

    return router;
}

module.exports = { createCatalogsRoutes };
