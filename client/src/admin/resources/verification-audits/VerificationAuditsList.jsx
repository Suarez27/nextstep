import {
    DateField,
    SelectInput,
    TextField,
    TextInput,
} from 'react-admin';
import { BaseDatagrid, BaseList } from '../../shared/crud';

const filters = [
    <TextInput key="q" source="q" label="Buscar" alwaysOn />,
    <SelectInput
        key="entity_type"
        source="entity_type"
        label="Entidad"
        choices={[
            { id: 'center', name: 'Centro' },
            { id: 'company', name: 'Empresa' },
            { id: 'student', name: 'Alumno' },
        ]}
    />,
    <SelectInput
        key="new_status"
        source="new_status"
        label="Estado nuevo"
        choices={[
            { id: 'approved', name: 'Aprobado' },
            { id: 'rejected', name: 'Rechazado' },
            { id: 'pending', name: 'Pendiente' },
        ]}
    />,
];

export default function VerificationAuditsList() {
    return (
        <BaseList filters={filters} sort={{ field: 'created_at', order: 'DESC' }}>
            <BaseDatagrid rowClick={false}>
                <TextField source="id" />
                <TextField source="entity_type" label="Entidad" />
                <TextField source="entity_id" label="ID entidad" />
                <TextField source="previous_status" label="Estado previo" />
                <TextField source="new_status" label="Estado nuevo" />
                <TextField source="note" label="Motivo" />
                <TextField source="validated_by_email" label="Validado por" />
                <DateField source="created_at" label="Fecha" showTime />
            </BaseDatagrid>
        </BaseList>
    );
}
