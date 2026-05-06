import {
    DateField,
    FunctionField,
    SelectInput,
    TextInput,
} from 'react-admin';
import { BaseDatagrid, BaseList } from '../../shared/crud';
import { statusBadgeClass, statusLabel } from '../../shared/statusPresentation';

function entityLabel(value) {
    const key = String(value || '').toLowerCase();
    if (key === 'center') return 'Centro';
    if (key === 'company') return 'Empresa';
    if (key === 'student') return 'Alumno';
    return value || 'Entidad';
}

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
                <FunctionField source="id" label="ID" render={(record) => record?.id} />
                <FunctionField source="entity_type" label="Entidad" render={(record) => entityLabel(record?.entity_type)} />
                <FunctionField source="entity_id" label="ID entidad" render={(record) => record?.entity_id} />
                <FunctionField
                    source="previous_status"
                    label="Estado previo"
                    render={(record) => (
                        <span className={statusBadgeClass(record?.previous_status)}>
                            {statusLabel(record?.previous_status)}
                        </span>
                    )}
                />
                <FunctionField
                    source="new_status"
                    label="Estado nuevo"
                    render={(record) => (
                        <span className={statusBadgeClass(record?.new_status)}>
                            {statusLabel(record?.new_status)}
                        </span>
                    )}
                />
                <FunctionField source="note" label="Motivo" render={(record) => record?.note || '-'} />
                <FunctionField source="validated_by_email" label="Validado por" render={(record) => record?.validated_by_email || '-'} />
                <DateField source="created_at" label="Fecha" showTime />
            </BaseDatagrid>
        </BaseList>
    );
}
