const jwt = require("jsonwebtoken");
const { canAccess } = require("../utils/permissions");

const JWT_SECRET = process.env.JWT_SECRET || "nextstep-dev-secret";

function authRequired(req, res, next) {
    const raw = req.headers.authorization || "";
    const [type, token] = raw.split(" ");

    if (type !== "Bearer" || !token) {
        return res.status(401).json({ error: "Token requerido" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (_e) {
        return res.status(401).json({ error: "Token invalido" });
    }
}

function roleRequired(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Sin permisos" });
        }
        return next();
    };
}

function permissionRequired(permissionKey) {
    return (req, res, next) => {
        if (!req.user || !canAccess(permissionKey, req.user.role)) {
            return res.status(403).json({ error: "Sin permisos" });
        }
        return next();
    };
}

module.exports = {
    authRequired,
    roleRequired,
    permissionRequired,
};