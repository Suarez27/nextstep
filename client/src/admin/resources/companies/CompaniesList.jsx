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

function CompanyVerifyAction() {
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
            validationNote = window.prompt('Indica el motivo del rechazo de la empresa:', '') || '';
            if (!validationNote.trim()) {
                notify('Debes indicar un motivo para rechazar', { type: 'warning' });
                return;
            }
        }

        try {
            await dataProvider.update('companies', {
                id: record.id,
                data: {
                    company_name: record.company_name || '',
                    sector: record.sector || '',
                    city: record.city || '',
                    description: record.description || '',
                    contact_email: record.contact_email || '',
                    contact_phone: record.contact_phone || '',
                    contact_person: record.contact_person || '',
                    email: record.email || '',
                    is_active: !!record.is_active,
                    is_verified: !isVerified,
                    validation_note: validationNote,
                },
                previousData: record,
            });
            notify(!isVerified ? 'Empresa verificada' : 'Empresa rechazada', { type: 'success' });
            refresh();
        } catch (error) {
            notify(error?.message || 'No se pudo actualizar la empresa', { type: 'error' });
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

const companyFilters = [
    <TextInput key="q" source="q" label="Buscar" alwaysOn />,
    <SelectInput
        key="is_active"
        source="is_active"
        label="Estado"
        choices={[
            { id: 'true', name: 'Activas' },
            { id: 'false', name: 'Inactivas' },
        ]}
    />,
    <SelectInput
        key="is_verified"
        source="is_verified"
        label="Verificacion"
        choices={[
            { id: 'true', name: 'Verificadas' },
            { id: 'false', name: 'Pendientes' },
        ]}
    />,
];

export default function CompaniesList() {
    return (
        <BaseList filters={companyFilters} sort={{ field: 'company_name', order: 'ASC' }}>
            <BaseDatagrid>
                <TextField source="id" />
                <TextField source="company_name" label="Empresa" />
                <TextField source="sector" label="Sector" />
                <TextField source="city" label="Ciudad" />
                <TextField source="contact_person" label="Contacto" />
                <EmailField source="contact_email" label="Email contacto" />
                <TextField source="contact_phone" label="Telefono" />
                <AdminBooleanField source="is_active" />
                <AdminBooleanField source="is_verified" label="Verificada" />
                <DateField source="updated_at" label="Actualizada" showTime />
                <FunctionField label="Accion" render={() => <CompanyVerifyAction />} />
            </BaseDatagrid>
        </BaseList>
    );
}
