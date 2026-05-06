import {
    DateField,
    EmailField,
    SelectInput,
    TextField,
    TextInput,
} from 'react-admin';
import { AdminBooleanField, BaseDatagrid, BaseList } from '../../shared/crud';

const centerFilters = [
    <TextInput key="q" source="q" label="Buscar" alwaysOn />,
    <SelectInput
        key="is_verified"
        source="is_verified"
        label="Verificacion"
        choices={[
            { id: 'true', name: 'Verificados' },
            { id: 'false', name: 'Pendientes' },
        ]}
    />,
];

export default function CentersList() {
    return (
        <BaseList filters={centerFilters} sort={{ field: 'center_name', order: 'ASC' }}>
            <BaseDatagrid>
                <TextField source="id" />
                <TextField source="center_name" label="Centro" />
                <TextField source="city" label="Ciudad" />
                <EmailField source="email" label="Email de acceso" />
                <AdminBooleanField source="is_verified" label="Verificado" />
                <DateField source="created_at" label="Registro" showTime />
            </BaseDatagrid>
        </BaseList>
    );
}
