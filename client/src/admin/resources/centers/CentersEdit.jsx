import {
    BooleanInput,
    TextInput,
    maxLength,
    required,
} from 'react-admin';
import { BaseEdit, BaseForm } from '../../shared/crud';

export default function CentersEdit() {
    return (
        <BaseEdit>
            <BaseForm>
                <TextInput source="id" disabled />
                <TextInput source="center_name" label="Centro" validate={[required(), maxLength(200)]} fullWidth />
                <TextInput source="city" label="Ciudad" validate={maxLength(120)} fullWidth />
                <BooleanInput source="is_verified" label="Verificado por admin" />
                <TextInput source="validation_note" label="Motivo (obligatorio si rechazas)" validate={maxLength(500)} multiline minRows={3} fullWidth />
            </BaseForm>
        </BaseEdit>
    );
}
