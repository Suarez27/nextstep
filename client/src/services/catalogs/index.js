import { api } from '../api';

const catalogCache = new Map();
const catalogItemsCache = new Map();
const catalogWithItemsCache = new Map();

export async function getActiveCatalogs({ force = false } = {}) {
    if (!force && catalogCache.has('all')) {
        return catalogCache.get('all');
    }

    const data = await api.getActiveCatalogs();
    catalogCache.set('all', data);
    return data;
}

export async function getCatalogItemsByKey(key, { force = false } = {}) {
    if (!key) return [];

    if (!force && catalogItemsCache.has(key)) {
        return catalogItemsCache.get(key);
    }

    const data = await api.getCatalogItemsByKey(key);
    catalogItemsCache.set(key, data);
    return data;
}

export async function getCatalogByKey(key, { force = false } = {}) {
    if (!key) return null;

    if (!force && catalogWithItemsCache.has(key)) {
        return catalogWithItemsCache.get(key);
    }

    const data = await api.getCatalogByKey(key);
    catalogWithItemsCache.set(key, data);
    return data;
}

export function mapCatalogItemsToOptions(items = []) {
    return items.map((item) => ({
        value: item.value,
        label: item.label,
        description: item.description || '',
        item,
    }));
}

export function getCatalogItemMeta(item) {
    if (!item?.meta_json) return {};

    if (typeof item.meta_json === 'object') {
        return item.meta_json;
    }

    try {
        return JSON.parse(item.meta_json);
    } catch {
        return {};
    }
}

export function invalidateCatalogCache(key) {
    if (!key) {
        catalogCache.clear();
        catalogItemsCache.clear();
        catalogWithItemsCache.clear();
        return;
    }

    catalogItemsCache.delete(key);
    catalogWithItemsCache.delete(key);
    catalogCache.delete('all');
}
