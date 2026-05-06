import {
    DateField,
    EmailField,
    SelectInput,
    TextField,
    TextInput,
} from 'react-admin';
import { AdminBooleanField, BaseDatagrid, BaseList } from '../../shared/crud';

const companyFilters = [
    <TextInput key="q" source="q" label="Buscar" alwaysOn />,
    <SelectInput
        key="is_active"
        source="is_active"
        label="Estado"
        choices={[
            { id: 'true', name: 'Activas' },
            { id: 'false', name: 'Inactivas' },
        ]}
    />,
];

export default function CompaniesList() {
    return (
        <BaseList filters={companyFilters} sort={{ field: 'company_name', order: 'ASC' }}>
            <BaseDatagrid>
                <TextField source="id" />
                <TextField source="company_name" label="Empresa" />
                <TextField source="sector" label="Sector" />
                <TextField source="city" label="Ciudad" />
                <TextField source="contact_person" label="Contacto" />
                <EmailField source="contact_email" label="Email contacto" />
                <TextField source="contact_phone" label="Telefono" />
                <AdminBooleanField source="is_active" />
                <DateField source="updated_at" label="Actualizada" showTime />
            </BaseDatagrid>
        </BaseList>
    );
}
