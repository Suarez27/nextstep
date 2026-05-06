import {
    BooleanInput,
    TextInput,
    email,
    maxLength,
    required,
} from 'react-admin';
import { BaseCreate, BaseForm } from '../../shared/crud';

const companyNameValidation = [required(), maxLength(200)];
const emailValidation = [email(), maxLength(200)];

export default function CompaniesCreate() {
    return (
        <BaseCreate>
            <BaseForm defaultValues={{ is_active: true }}>
                <TextInput source="company_name" label="Empresa" validate={companyNameValidation} fullWidth />
                <TextInput source="sector" label="Sector" validate={maxLength(120)} fullWidth />
                <TextInput source="city" label="Ciudad" validate={maxLength(120)} fullWidth />
                <TextInput source="description" label="Descripcion" validate={maxLength(4000)} multiline minRows={4} fullWidth />
                <TextInput source="contact_person" label="Persona de contacto" validate={maxLength(150)} fullWidth />
                <TextInput source="contact_phone" label="Telefono de contacto" validate={maxLength(50)} fullWidth />
                <TextInput source="contact_email" label="Email de contacto" type="email" validate={emailValidation} fullWidth />
                <TextInput source="email" label="Email de acceso" type="email" validate={emailValidation} fullWidth />
                <BooleanInput source="is_active" label="Activa" />
            </BaseForm>
        </BaseCreate>
    );
}
