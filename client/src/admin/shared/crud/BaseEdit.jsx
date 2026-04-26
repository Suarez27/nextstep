import { DeleteButton, Edit, ListButton, TopToolbar } from 'react-admin';

function BaseEditActions({ deleteLabel = 'Eliminar' }) {
    return (
        <TopToolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
            <ListButton label="Volver al listado" />
            <DeleteButton label={deleteLabel} color="error" variant="outlined" />
        </TopToolbar>
    );
}

export default function BaseEdit({ deleteLabel = 'Eliminar', ...props }) {
    return (
        <Edit
            title="Editar registro"
            actions={<BaseEditActions deleteLabel={deleteLabel} />}
            sx={{
                '& .RaEdit-card': {
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 18px 34px rgba(18, 38, 58, 0.06)',
                    overflow: 'hidden',
                },
                '& .RaEdit-main': {
                    mt: 1,
                },
            }}
            {...props}
        />
    );
}
