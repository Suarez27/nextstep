import {
    TextField,
    EmailField,
} from 'react-admin';
import { BaseShow, BaseShowLayout } from '../../shared/crud';

export default function CompaniesShow() {
    return (
        <BaseShow>
            <BaseShowLayout>
                <TextField source="id" />
                <TextField source="company_name" label="Empresa" />
                <TextField source="sector" label="Sector" />
                <TextField source="city" label="Ciudad" />
                <EmailField source="email" label="Email" />
            </BaseShowLayout>
        </BaseShow>
    );
}
