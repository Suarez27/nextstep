import {
    NumberField,
    TextField,
    TextInput,
} from 'react-admin';
import { BaseDatagrid, BaseList } from '../../shared/crud';

const internshipFilters = [
    <TextInput key="q" source="q" label="Buscar" alwaysOn />,
];

export default function InternshipsList() {
    return (
        <BaseList filters={internshipFilters}>
            <BaseDatagrid>
                <TextField source="id" />
                <TextField source="title" label="Titulo" />
                <TextField source="company_name" label="Empresa" />
                <NumberField source="hours_total" label="Horas" />
                <NumberField source="slots" label="Plazas" />
                <TextField source="schedule" label="Horario" />
            </BaseDatagrid>
        </BaseList>
    );
}
