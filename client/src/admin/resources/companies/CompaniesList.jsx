import {
    EmailField,
    TextField,
    TextInput,
} from 'react-admin';
import { BaseDatagrid, BaseList } from '../../shared/crud';

const companyFilters = [
    <TextInput key="q" source="q" label="Buscar" alwaysOn />,
];

export default function CompaniesList() {
    return (
        <BaseList filters={companyFilters}>
            <BaseDatagrid>
                <TextField source="id" />
                <TextField source="company_name" label="Empresa" />
                <TextField source="sector" label="Sector" />
                <TextField source="city" label="Ciudad" />
                <EmailField source="email" label="Email" />
            </BaseDatagrid>
        </BaseList>
    );
}