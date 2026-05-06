import {
    DateField,
    EmailField,
    TextField,
} from 'react-admin';
import { AdminBooleanField, BaseShow, BaseShowLayout } from '../../shared/crud';

export default function CompaniesShow() {
    return (
        <BaseShow>
            <BaseShowLayout>
                <TextField source="id" />
                <TextField source="user_id" label="Usuario" />
                <TextField source="company_name" label="Empresa" />
                <TextField source="sector" label="Sector" />
                <TextField source="city" label="Ciudad" />
                <TextField source="description" label="Descripcion" />
                <TextField source="contact_person" label="Persona de contacto" />
                <TextField source="contact_phone" label="Telefono de contacto" />
                <EmailField source="contact_email" label="Email de contacto" />
                <EmailField source="email" label="Email de acceso" />
                <AdminBooleanField source="is_active" />
                <AdminBooleanField source="is_verified" label="Verificada" />
                <TextField source="verification_status" label="Estado validacion" />
                <TextField source="verification_note" label="Motivo" />
                <TextField source="verified_by_user_id" label="Validado por" />
                <DateField source="verified_at" label="Fecha validacion" showTime />
                <DateField source="created_at" label="Creada" showTime />
                <DateField source="updated_at" label="Actualizada" showTime />
            </BaseShowLayout>
        </BaseShow>
    );
}
