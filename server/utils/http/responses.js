function ok(res, data, meta) {
    if (typeof meta !== "undefined") {
        return res.json({ data, meta });
    }
    return res.json({ data });
}

function created(res, data, meta) {
    if (typeof meta !== "undefined") {
        return res.status(201).json({ data, meta });
    }
    return res.status(201).json({ data });
}

function fail(res, status, error, options = {}) {
    const payload = { error };

    if (options.code) payload.code = options.code;
    if (options.issues) payload.issues = options.issues;
    if (options.meta) payload.meta = options.meta;

    return res.status(status).json(payload);
}

module.exports = {
    ok,
    created,
    fail,
};