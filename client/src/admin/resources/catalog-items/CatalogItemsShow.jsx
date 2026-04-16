import {
    BooleanField,
    DateField,
    NumberField,
    ReferenceField,
    SimpleShowLayout,
    TextField,
} from 'react-admin';
import { BaseShow } from '../../shared/crud';

export default function CatalogItemsShow() {
    return (
        <BaseShow>
            <SimpleShowLayout>
                <TextField source="id" />
                <ReferenceField source="catalog_id" reference="catalogs" label="Catalogo">
                    <TextField source="name" />
                </ReferenceField>
                <TextField source="value" label="Valor" />
                <TextField source="label" label="Etiqueta" />
                <TextField source="description" label="Descripcion" />
                <NumberField source="sort_order" label="Orden" />
                <TextField source="meta_json" label="Meta JSON" />
                <BooleanField source="is_active" label="Activo" />
                <DateField source="created_at" label="Creado" showTime />
                <DateField source="updated_at" label="Actualizado" showTime />
            </SimpleShowLayout>
        </BaseShow>
    );
}
