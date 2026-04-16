import { useEffect, useMemo, useState } from 'react';
import {
    getCatalogByKey,
    getCatalogItemMeta,
    getCatalogItemsByKey,
    mapCatalogItemsToOptions,
} from '../../services/catalogs';

export function useCatalog(key) {
    const [catalog, setCatalog] = useState(null);
    const [loading, setLoading] = useState(Boolean(key));
    const [error, setError] = useState('');

    useEffect(() => {
        let ignore = false;

        if (!key) {
            setCatalog(null);
            setLoading(false);
            setError('');
            return () => {
                ignore = true;
            };
        }

        setLoading(true);
        setError('');

        getCatalogByKey(key)
            .then((data) => {
                if (!ignore) setCatalog(data);
            })
            .catch((err) => {
                if (!ignore) {
                    setCatalog(null);
                    setError(err.message || 'No se pudo cargar el catalogo.');
                }
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [key]);

    return { catalog, items: catalog?.items || [], loading, error };
}

export function useCatalogItems(key) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(Boolean(key));
    const [error, setError] = useState('');

    useEffect(() => {
        let ignore = false;

        if (!key) {
            setItems([]);
            setLoading(false);
            setError('');
            return () => {
                ignore = true;
            };
        }

        setLoading(true);
        setError('');

        getCatalogItemsByKey(key)
            .then((data) => {
                if (!ignore) setItems(data);
            })
            .catch((err) => {
                if (!ignore) {
                    setItems([]);
                    setError(err.message || 'No se pudieron cargar los items del catalogo.');
                }
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [key]);

    return { items, loading, error };
}

export function useCatalogOptions(key) {
    const { items, loading, error } = useCatalogItems(key);

    const options = useMemo(() => mapCatalogItemsToOptions(items), [items]);

    return { items, options, loading, error };
}

export function useCatalogDocumentType(key, value) {
    const { items, loading, error } = useCatalogItems(key);

    const item = useMemo(
        () => items.find((entry) => entry.value === value) || null,
        [items, value]
    );

    const meta = useMemo(() => getCatalogItemMeta(item), [item]);

    return { item, meta, loading, error };
}
