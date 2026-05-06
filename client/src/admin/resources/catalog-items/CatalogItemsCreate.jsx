import {
    BooleanInput,
    minLength,
    NumberInput,
    ReferenceInput,
    SelectInput,
    TextInput,
    required,
} from 'react-admin';
import { BaseCreate, BaseForm } from '../../shared/crud';
import { uniqueCatalogItemValueValidator } from '../../shared/validators/catalogs';

export default function CatalogItemsCreate() {
    return (
        <BaseCreate>
            <BaseForm defaultValues={{ is_active: true, sort_order: 0 }}>
                <ReferenceInput source="catalog_id" reference="catalogs" label="Catalogo">
                    <SelectInput optionText="name" optionValue="id" validate={required()} />
                </ReferenceInput>
                <TextInput source="value" label="Valor" validate={[required(), minLength(1), uniqueCatalogItemValueValidator()]} fullWidth />
                <TextInput source="label" label="Etiqueta" validate={required()} fullWidth />
                <TextInput source="description" label="Descripcion" multiline minRows={4} fullWidth />
                <NumberInput source="sort_order" label="Orden" validate={required()} />
                <TextInput source="meta_json" label="Meta JSON" multiline minRows={4} fullWidth />
                <BooleanInput source="is_active" label="Activo" />
            </BaseForm>
        </BaseCreate>
    );
}
