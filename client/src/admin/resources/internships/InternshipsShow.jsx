import {
    NumberField,
    SimpleShowLayout,
    TextField,
} from 'react-admin';
import { BaseShow } from '../../shared/crud';

export default function InternshipsShow() {
    return (
        <BaseShow>
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="title" label="Título" />
                <TextField source="company_name" label="Empresa" />
                <TextField source="description" label="Descripción" />
                <NumberField source="hours_total" label="Horas totales" />
                <TextField source="schedule" label="Horario" />
                <NumberField source="slots" label="Plazas" />
            </SimpleShowLayout>
        </BaseShow>
    );
}