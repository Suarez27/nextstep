import {
    DateField,
    EmailField,
    TextField,
} from 'react-admin';
import { AdminBooleanField, BaseShow, BaseShowLayout } from '../../shared/crud';

export default function CentersShow() {
    return (
        <BaseShow>
            <BaseShowLayout>
                <TextField source="id" />
                <TextField source="user_id" label="Usuario" />
                <TextField source="center_name" label="Centro" />
                <TextField source="city" label="Ciudad" />
                <EmailField source="email" label="Email de acceso" />
                <AdminBooleanField source="is_verified" label="Verificado" />
                <DateField source="created_at" label="Registro" showTime />
            </BaseShowLayout>
        </BaseShow>
    );
}
