import {
    SimpleShowLayout,
    TextField,
    EmailField,
} from 'react-admin';
import { BaseShow } from '../../shared/crud';

export default function CompaniesShow() {
    return (
        <BaseShow>
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="company_name" label="Empresa" />
                <TextField source="sector" label="Sector" />
                <TextField source="city" label="Ciudad" />
                <EmailField source="email" label="Email" />
            </SimpleShowLayout>
        </BaseShow>
    );
}