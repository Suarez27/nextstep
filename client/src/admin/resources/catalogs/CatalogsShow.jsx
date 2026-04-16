import {
    BooleanField,
    DateField,
    SimpleShowLayout,
    TextField,
} from 'react-admin';
import { BaseShow } from '../../shared/crud';

export default function CatalogsShow() {
    return (
        <BaseShow>
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="key" label="Clave" />
                <TextField source="name" label="Nombre" />
                <TextField source="description" label="Descripcion" />
                <BooleanField source="is_active" label="Activo" />
                <DateField source="created_at" label="Creado" showTime />
                <DateField source="updated_at" label="Actualizado" showTime />
            </SimpleShowLayout>
        </BaseShow>
    );
}
