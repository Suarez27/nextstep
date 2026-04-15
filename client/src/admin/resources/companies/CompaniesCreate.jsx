import {
    TextInput,
    required,
} from 'react-admin';
import { BaseCreate, BaseForm } from '../../shared/crud';

export default function CompaniesCreate() {
    return (
        <BaseCreate>
            <BaseForm>
                <TextInput source="company_name" label="Empresa" validate={required()} fullWidth />
                <TextInput source="sector" label="Sector" fullWidth />
                <TextInput source="city" label="Ciudad" fullWidth />
                <TextInput source="email" label="Email" fullWidth />
            </BaseForm>
        </BaseCreate>
    );
}