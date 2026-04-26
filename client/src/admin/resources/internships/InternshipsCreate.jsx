import {
    BooleanInput,
    DateInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    TextInput,
    maxLength,
    minValue,
    required,
} from 'react-admin';
import { BaseCreate, BaseForm } from '../../shared/crud';
import {
    areaReferenceProps,
    companyReferenceProps,
    internshipDefaultValues,
    internshipStatusChoices,
} from './choices';

const requiredText = [required(), maxLength(4000)];
const positiveNumber = [required(), minValue(1)];

export default function InternshipsCreate() {
    return (
        <BaseCreate>
            <BaseForm defaultValues={internshipDefaultValues}>
                <ReferenceInput source="company_id" label="Empresa" {...companyReferenceProps}>
                    <SelectInput optionText="company_name" optionValue="id" validate={required()} />
                </ReferenceInput>

                <TextInput source="title" label="Titulo" validate={[required(), maxLength(200)]} fullWidth />
                <TextInput source="description" label="Descripcion" multiline minRows={4} validate={requiredText} fullWidth />

                <ReferenceInput source="area_item_id" label="Area" {...areaReferenceProps}>
                    <SelectInput optionText="label" optionValue="id" emptyText="Sin area" />
                </ReferenceInput>

                <NumberInput source="hours_total" label="Horas totales" min={1} validate={positiveNumber} />
                <TextInput source="schedule" label="Horario" validate={[required(), maxLength(120)]} fullWidth />
                <NumberInput source="slots" label="Plazas" min={1} validate={positiveNumber} />
                <TextInput source="requirements" label="Requisitos" multiline minRows={4} validate={maxLength(4000)} fullWidth />

                <DateInput source="start_date" label="Fecha inicio estimada" />
                <DateInput source="end_date" label="Fecha fin estimada" />
                <DateInput source="application_deadline" label="Fecha limite candidatura" />

                <SelectInput source="status" label="Estado" choices={internshipStatusChoices} validate={required()} />
                <BooleanInput source="is_active" label="Activa" />
            </BaseForm>
        </BaseCreate>
    );
}
