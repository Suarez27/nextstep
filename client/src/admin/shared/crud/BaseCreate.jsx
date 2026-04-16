import { Create, ListButton, TopToolbar } from 'react-admin';

function BaseCreateActions() {
    return (
        <TopToolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
            <ListButton label="Volver al listado" />
        </TopToolbar>
    );
}

export default function BaseCreate(props) {
    return (
        <Create
            title="Nuevo registro"
            actions={<BaseCreateActions />}
            sx={{
                '& .RaCreate-card': {
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 18px 34px rgba(18, 38, 58, 0.06)',
                    overflow: 'hidden',
                },
                '& .RaCreate-main': {
                    mt: 1,
                },
            }}
            {...props}
        />
    );
}
