import {
    BooleanInput,
    NumberField,
    NumberInput,
    ReferenceField,
    TextField,
    TextInput,
} from 'react-admin';
import { AdminBooleanField, BaseDatagrid, BaseList } from '../../shared/crud';

const catalogItemFilters = [
    <TextInput key="q" source="q" label="Buscar" alwaysOn />,
    <NumberInput key="catalog_id" source="catalog_id" label="ID de catalogo" />,
    <BooleanInput key="is_active" source="is_active" label="Solo activos" />,
];

export default function CatalogItemsList() {
    return (
        <BaseList filters={catalogItemFilters} sort={{ field: 'sort_order', order: 'ASC' }}>
            <BaseDatagrid>
                <TextField source="id" />
                <ReferenceField source="catalog_id" reference="catalogs" label="Catalogo">
                    <TextField source="name" />
                </ReferenceField>
                <TextField source="value" label="Valor" />
                <TextField source="label" label="Etiqueta" />
                <NumberField source="sort_order" label="Orden" />
                <AdminBooleanField source="is_active" />
            </BaseDatagrid>
        </BaseList>
    );
}
