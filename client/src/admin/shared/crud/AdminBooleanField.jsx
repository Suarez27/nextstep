import { Chip } from '@mui/material';
import { useRecordContext } from 'react-admin';

export default function AdminBooleanField({
    source,
    trueLabel = 'Activo',
    falseLabel = 'Inactivo',
    ...props
}) {
    const record = useRecordContext(props);
    const value = Boolean(record?.[source]);

    return (
        <Chip
            size="small"
            label={value ? trueLabel : falseLabel}
            sx={{
                minWidth: 88,
                fontWeight: 700,
                color: value ? '#166534' : '#8a2d1d',
                backgroundColor: value ? '#e9f8ef' : '#fff1ed',
                border: '1px solid',
                borderColor: value ? '#b7e4c7' : '#fed7cc',
            }}
        />
    );
}
