import {
    BooleanInput,
    minLength,
    TextInput,
    required,
} from 'react-admin';
import { BaseEdit, BaseForm } from '../../shared/crud';
import { uniqueCatalogKeyValidator } from '../../shared/validators/catalogs';

export default function CatalogsEdit() {
    return (
        <BaseEdit>
            <BaseForm>
                <TextInput source="id" disabled />
                <TextInput source="key" label="Clave" validate={[required(), minLength(2), uniqueCatalogKeyValidator()]} fullWidth />
                <TextInput source="name" label="Nombre" validate={required()} fullWidth />
                <TextInput source="description" label="Descripcion" multiline minRows={4} fullWidth />
                <BooleanInput source="is_active" label="Activo" />
            </BaseForm>
        </BaseEdit>
    );
}
