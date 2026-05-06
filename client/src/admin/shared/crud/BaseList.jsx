import { CreateButton, FilterButton, List, TopToolbar } from 'react-admin';
import AdminEmpty from './AdminEmpty';

function BaseListActions() {
    return (
        <TopToolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
            <FilterButton />
            <CreateButton label="Nuevo" variant="contained" />
        </TopToolbar>
    );
}

export default function BaseList(props) {
    return (
        <List
            actions={<BaseListActions />}
            empty={<AdminEmpty />}
            perPage={12}
            sx={{
                '& .RaList-main': {
                    mt: 1,
                },
                '& .RaList-actions': {
                    mb: 1,
                },
                '& .RaList-content': {
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 18px 34px rgba(18, 38, 58, 0.06)',
                },
                '& .RaFilterForm-form': {
                    gap: 1.5,
                    alignItems: 'flex-end',
                    p: { xs: 1.5, md: 2 },
                    mb: 2,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                },
                '& .RaFilterForm-input': {
                    minWidth: { xs: '100%', sm: 220 },
                },
            }}
            {...props}
        />
    );
}
