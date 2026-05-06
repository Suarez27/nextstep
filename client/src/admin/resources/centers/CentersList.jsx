import {
    Button,
    DateField,
    EmailField,
    FunctionField,
    SelectInput,
    TextField,
    TextInput,
    useDataProvider,
    useNotify,
    useRefresh,
    useRecordContext,
} from 'react-admin';
import { AdminBooleanField, BaseDatagrid, BaseList } from '../../shared/crud';
import { statusBadgeClass, statusLabel } from '../../shared/statusPresentation';

function CenterVerifyAction() {
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();

    if (!record) return null;

    const isVerified = !!record.is_verified;

    const handleToggle = async (event) => {
        event.stopPropagation();
        let validationNote = '';

        if (isVerified) {
            validationNote = window.prompt('Indica el motivo del rechazo del centro:', '') || '';
            if (!validationNote.trim()) {
                notify('Debes indicar un motivo para rechazar', { type: 'warning' });
                return;
            }
        }

        try {
            await dataProvider.update('centers', {
                id: record.id,
                data: {
                    center_name: record.center_name || '',
                    city: record.city || '',
                    is_verified: !isVerified,
                    validation_note: validationNote,
                },
                previousData: record,
            });
            notify(!isVerified ? 'Centro verificado' : 'Centro rechazado', { type: 'success' });
            refresh();
        } catch (error) {
            notify(error?.message || 'No se pudo actualizar el centro', { type: 'error' });
        }
    };

    return (
        <Button
            label={isVerified ? 'Rechazar' : 'Aprobar'}
            onClick={handleToggle}
            size="small"
        />
    );
}

const centerFilters = [
    <TextInput key="q" source="q" label="Buscar" alwaysOn />,
    <SelectInput
        key="verification_status"
        source="verification_status"
        label="Estado validacion"
        choices={[
            { id: 'pending', name: 'Pendiente' },
            { id: 'approved', name: 'Aprobado' },
            { id: 'rejected', name: 'Rechazado' },
        ]}
    />,
    <SelectInput
        key="is_verified"
        source="is_verified"
        label="Verificacion"
        choices={[
            { id: 'true', name: 'Verificados' },
            { id: 'false', name: 'Pendientes' },
        ]}
    />,
];

export default function CentersList() {
    return (
        <BaseList filters={centerFilters} sort={{ field: 'center_name', order: 'ASC' }}>
            <BaseDatagrid>
                <TextField source="id" />
                <TextField source="center_name" label="Centro" />
                <TextField source="city" label="Ciudad" />
                <EmailField source="email" label="Email de acceso" />
                <AdminBooleanField source="is_verified" label="Verificado" />
                <FunctionField
                    source="verification_status"
                    label="Estado"
                    render={(record) => (
                        <span className={statusBadgeClass(record?.verification_status)}>
                            {statusLabel(record?.verification_status)}
                        </span>
                    )}
                />
                <DateField source="created_at" label="Registro" showTime />
                <FunctionField label="Accion" render={() => <CenterVerifyAction />} />
            </BaseDatagrid>
        </BaseList>
    );
}
