const API_ROOT = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
const API_BASE = API_ROOT.endsWith('/api') ? `${API_ROOT}/admin` : `${API_ROOT}/api/admin`;

async function httpClient(url, options = {}) {
    const token = localStorage.getItem('ns_token');

    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const text = await response.text();
    let json = {};
    try {
        json = text ? JSON.parse(text) : {};
    } catch {
        json = {};
    }

    if (!response.ok) {
        throw new Error(json.error || `Error ${response.status}`);
    }

    return json;
}

export const dataProvider = {
    async getList(resource, params) {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;

        const query = new URLSearchParams({
            page: String(page),
            perPage: String(perPage),
            sortField: field,
            sortOrder: order,
            filter: JSON.stringify(params.filter || {}),
        });

        const result = await httpClient(`${API_BASE}/${resource}?${query.toString()}`);

        return {
            data: result.data || [],
            total: result.meta?.total ?? result.total ?? 0,
        };
    },

    async getOne(resource, params) {
        const result = await httpClient(`${API_BASE}/${resource}/${params.id}`);
        return { data: result.data };
    },

    async create(resource, params) {
        const result = await httpClient(`${API_BASE}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        });

        return { data: result.data };
    },

    async update(resource, params) {
        const result = await httpClient(`${API_BASE}/${resource}/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        });

        return { data: result.data };
    },

    async delete(resource, params) {
        const result = await httpClient(`${API_BASE}/${resource}/${params.id}`, {
            method: 'DELETE',
        });

        return { data: result.data };
    },

    async getMany(resource, params) {
        const results = await Promise.all(
            params.ids.map(async (id) => {
                const result = await httpClient(`${API_BASE}/${resource}/${id}`);
                return result.data;
            })
        );

        return { data: results };
    },

    async getManyReference(resource, params) {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;

        const query = new URLSearchParams({
            page: String(page),
            perPage: String(perPage),
            sortField: field,
            sortOrder: order,
            target: params.target,
            id: String(params.id),
            filter: JSON.stringify(params.filter || {}),
        });

        const result = await httpClient(`${API_BASE}/${resource}?${query.toString()}`);

        return {
            data: result.data || [],
            total: result.meta?.total ?? result.total ?? 0,
        };
    },
};
