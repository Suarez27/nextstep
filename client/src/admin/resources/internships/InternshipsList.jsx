import {
    DateField,
    NumberField,
    ReferenceInput,
    SelectInput,
    TextField,
    TextInput,
} from 'react-admin';
import { AdminBooleanField, BaseDatagrid, BaseList } from '../../shared/crud';
import {
    areaReferenceProps,
    companyReferenceProps,
    internshipStatusChoices,
} from './choices';

const activeChoices = [
    { id: 'true', name: 'Activas' },
    { id: 'false', name: 'Inactivas' },
];

const internshipFilters = [
    <TextInput key="q" source="q" label="Buscar" alwaysOn />,
    <ReferenceInput key="company_id" source="company_id" label="Empresa" {...companyReferenceProps}>
        <SelectInput optionText="company_name" optionValue="id" />
    </ReferenceInput>,
    <ReferenceInput key="area_item_id" source="area_item_id" label="Area" {...areaReferenceProps}>
        <SelectInput optionText="label" optionValue="id" />
    </ReferenceInput>,
    <SelectInput key="status" source="status" label="Estado" choices={internshipStatusChoices} />,
    <SelectInput key="is_active" source="is_active" label="Activo" choices={activeChoices} />,
];

export default function InternshipsList() {
    return (
        <BaseList filters={internshipFilters} sort={{ field: 'created_at', order: 'DESC' }}>
            <BaseDatagrid>
                <TextField source="id" />
                <TextField source="title" label="Titulo" />
                <TextField source="company_name" label="Empresa" />
                <TextField source="area_label" label="Area" />
                <TextField source="status" label="Estado" />
                <AdminBooleanField source="is_active" />
                <NumberField source="slots" label="Plazas" />
                <NumberField source="accepted_applications_count" label="Aceptadas" />
                <NumberField source="available_slots" label="Disponibles" />
                <NumberField source="hours_total" label="Horas" />
                <DateField source="application_deadline" label="Limite" />
                <DateField source="updated_at" label="Actualizada" showTime />
            </BaseDatagrid>
        </BaseList>
    );
}
