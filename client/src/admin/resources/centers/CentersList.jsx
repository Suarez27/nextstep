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

function CenterVerifyAction() {
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();

    if (!record) return null;

    const isVerified = !!record.is_verified;

    const handleToggle = async (event) => {
        event.stopPropagation();
        try {
            await dataProvider.update('centers', {
                id: record.id,
                data: {
                    center_name: record.center_name || '',
                    city: record.city || '',
                    is_verified: !isVerified,
                },
                previousData: record,
            });
            notify(!isVerified ? 'Centro verificado' : 'Centro marcado como pendiente', { type: 'success' });
            refresh();
        } catch (error) {
            notify(error?.message || 'No se pudo actualizar el centro', { type: 'error' });
        }
    };

    return (
        <Button
            label={isVerified ? 'Marcar pendiente' : 'Aprobar'}
            onClick={handleToggle}
            size="small"
        />
    );
}

const centerFilters = [
    <TextInput key="q" source="q" label="Buscar" alwaysOn />,
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
                <DateField source="created_at" label="Registro" showTime />
                <FunctionField label="Accion" render={() => <CenterVerifyAction />} />
            </BaseDatagrid>
        </BaseList>
    );
}
