import {
    NumberInput,
    ReferenceInput,
    SelectInput,
    TextInput,
    required,
} from 'react-admin';
import { BaseEdit, BaseForm } from '../../shared/crud';

export default function InternshipsEdit() {
    return (
        <BaseEdit>
            <BaseForm>
                <TextInput source="id" disabled />

                <ReferenceInput source="company_id" reference="companies" label="Empresa">
                    <SelectInput optionText="company_name" optionValue="id" validate={required()} />
                </ReferenceInput>

                <TextInput source="title" label="Título" validate={required()} fullWidth />
                <TextInput source="description" label="Descripción" multiline minRows={4} validate={required()} fullWidth />
                <NumberInput source="hours_total" label="Horas totales" validate={required()} />
                <TextInput source="schedule" label="Horario" fullWidth />
                <NumberInput source="slots" label="Plazas" validate={required()} />
            </BaseForm>
        </BaseEdit>
    );
}