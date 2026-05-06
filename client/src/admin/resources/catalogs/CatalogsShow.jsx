import {
    DateField,
    TextField,
} from 'react-admin';
import { AdminBooleanField, BaseShow, BaseShowLayout } from '../../shared/crud';

export default function CatalogsShow() {
    return (
        <BaseShow>
            <BaseShowLayout>
                <TextField source="id" />
                <TextField source="key" label="Clave" />
                <TextField source="name" label="Nombre" />
                <TextField source="description" label="Descripcion" />
                <AdminBooleanField source="is_active" />
                <DateField source="created_at" label="Creado" showTime />
                <DateField source="updated_at" label="Actualizado" showTime />
            </BaseShowLayout>
        </BaseShow>
    );
}
