import {
    NumberField,
    TextField,
} from 'react-admin';
import { BaseShow, BaseShowLayout } from '../../shared/crud';

export default function InternshipsShow() {
    return (
        <BaseShow>
            <BaseShowLayout>
                <TextField source="id" />
                <TextField source="title" label="Titulo" />
                <TextField source="company_name" label="Empresa" />
                <TextField source="description" label="Descripcion" />
                <NumberField source="hours_total" label="Horas totales" />
                <TextField source="schedule" label="Horario" />
                <NumberField source="slots" label="Plazas" />
            </BaseShowLayout>
        </BaseShow>
    );
}
