import {
    TextInput,
    required,
} from 'react-admin';
import { BaseEdit, BaseForm } from '../../shared/crud';

export default function CompaniesEdit() {
    return (
        <BaseEdit>
            <BaseForm>
                <TextInput source="id" disabled />
                <TextInput source="company_name" label="Empresa" validate={required()} fullWidth />
                <TextInput source="sector" label="Sector" fullWidth />
                <TextInput source="city" label="Ciudad" fullWidth />
                <TextInput source="email" label="Email" fullWidth />
            </BaseForm>
        </BaseEdit>
    );
}