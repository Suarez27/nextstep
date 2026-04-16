import {
    BooleanField,
    BooleanInput,
    TextField,
    TextInput,
} from 'react-admin';
import { BaseDatagrid, BaseList } from '../../shared/crud';

const catalogFilters = [
    <TextInput key="q" source="q" label="Buscar" alwaysOn />,
    <BooleanInput key="is_active" source="is_active" label="Solo activos" />,
];

export default function CatalogsList() {
    return (
        <BaseList filters={catalogFilters} sort={{ field: 'name', order: 'ASC' }}>
            <BaseDatagrid>
                <TextField source="id" />
                <TextField source="key" label="Clave" />
                <TextField source="name" label="Nombre" />
                <TextField source="description" label="Descripcion" />
                <BooleanField source="is_active" label="Activo" />
            </BaseDatagrid>
        </BaseList>
    );
}
