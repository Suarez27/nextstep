import {
    DateField,
    NumberField,
    TextField,
} from 'react-admin';
import { AdminBooleanField, BaseShow, BaseShowLayout } from '../../shared/crud';

export default function InternshipsShow() {
    return (
        <BaseShow deleteLabel="Desactivar">
            <BaseShowLayout>
                <TextField source="id" />
                <TextField source="title" label="Titulo" />
                <TextField source="company_name" label="Empresa" />
                <TextField source="area_label" label="Area" />
                <TextField source="description" label="Descripcion" />
                <TextField source="requirements" label="Requisitos" />
                <NumberField source="hours_total" label="Horas totales" />
                <TextField source="schedule" label="Horario" />
                <NumberField source="slots" label="Plazas totales" />
                <NumberField source="accepted_applications_count" label="Candidaturas aceptadas" />
                <NumberField source="available_slots" label="Plazas disponibles" />
                <TextField source="status" label="Estado" />
                <AdminBooleanField source="is_active" />
                <DateField source="start_date" label="Fecha inicio estimada" />
                <DateField source="end_date" label="Fecha fin estimada" />
                <DateField source="application_deadline" label="Fecha limite candidatura" />
                <DateField source="created_at" label="Creada" showTime />
                <DateField source="updated_at" label="Actualizada" showTime />
            </BaseShowLayout>
        </BaseShow>
    );
}
