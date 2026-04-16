import { DeleteButton, EditButton, ListButton, Show, TopToolbar } from 'react-admin';

function BaseShowActions() {
    return (
        <TopToolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
            <ListButton label="Volver al listado" />
            <EditButton label="Editar" />
            <DeleteButton label="Eliminar" color="error" variant="outlined" />
        </TopToolbar>
    );
}

export default function BaseShow(props) {
    return (
        <Show
            title="Detalle"
            actions={<BaseShowActions />}
            sx={{
                '& .RaShow-card': {
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 18px 34px rgba(18, 38, 58, 0.06)',
                    overflow: 'hidden',
                },
                '& .RaShow-main': {
                    mt: 1,
                },
            }}
            {...props}
        />
    );
}
