import {
    DateField,
    EmailField,
    FunctionField,
    TextField,
} from 'react-admin';
import { AdminBooleanField, BaseShow, BaseShowLayout } from '../../shared/crud';
import { statusLabel } from '../../shared/statusPresentation';

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
                <FunctionField
                    source="verification_status"
                    label="Estado validacion"
                    render={(record) => statusLabel(record?.verification_status)}
                />
                <TextField source="verification_note" label="Motivo" />
                <TextField source="verified_by_user_id" label="Validado por" />
                <DateField source="verified_at" label="Fecha validacion" showTime />
                <DateField source="created_at" label="Registro" showTime />
            </BaseShowLayout>
        </BaseShow>
    );
}
