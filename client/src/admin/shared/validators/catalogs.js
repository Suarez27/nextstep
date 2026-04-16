const API_ROOT = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
const API_BASE = API_ROOT.endsWith('/api') ? `${API_ROOT}/admin` : `${API_ROOT}/api/admin`;

async function fetchAdminList(resource, filter = {}) {
    const token = localStorage.getItem('ns_token');

    const query = new URLSearchParams({
        page: '1',
        perPage: '100',
        sortField: 'id',
        sortOrder: 'ASC',
        filter: JSON.stringify(filter),
    });

    const response = await fetch(`${API_BASE}/${resource}?${query.toString()}`, {
        headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(json.error || `Error ${response.status}`);
    }

    return json.data || [];
}

export function uniqueCatalogKeyValidator() {
    return async (value, values = {}) => {
        const nextValue = String(value || '').trim();
        if (!nextValue) return undefined;

        try {
            const rows = await fetchAdminList('catalogs', { q: nextValue });
            const duplicate = rows.find((row) => row.key === nextValue && row.id !== values.id);
            return duplicate ? 'Ya existe un catalogo con esta clave.' : undefined;
        } catch {
            return undefined;
        }
    };
}

export function uniqueCatalogItemValueValidator() {
    return async (value, values = {}) => {
        const nextValue = String(value || '').trim();
        const catalogId = Number(values.catalog_id || 0);

        if (!nextValue || !catalogId) return undefined;

        try {
            const rows = await fetchAdminList('catalog-items', {
                q: nextValue,
                catalog_id: catalogId,
            });

            const duplicate = rows.find(
                (row) =>
                    Number(row.catalog_id) === catalogId &&
                    row.value === nextValue &&
                    row.id !== values.id
            );

            return duplicate ? 'Ya existe un item con este valor dentro del catalogo.' : undefined;
        } catch {
            return undefined;
        }
    };
}
