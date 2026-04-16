import { Datagrid } from 'react-admin';

export default function BaseDatagrid({ children, ...props }) {
    return (
        <Datagrid
            rowClick="show"
            bulkActionButtons={false}
            sx={{
                '& .RaDatagrid-tableWrapper': {
                    overflowX: 'auto',
                },
                '& .RaDatagrid-headerCell': {
                    py: 1.5,
                    whiteSpace: 'nowrap',
                },
                '& .RaDatagrid-rowCell': {
                    py: 1.25,
                    verticalAlign: 'middle',
                },
                '& .column-id': {
                    width: 88,
                    color: 'text.secondary',
                    fontWeight: 700,
                },
                '& .RaDatagrid-clickableRow': {
                    cursor: 'pointer',
                },
            }}
            {...props}
        >
            {children}
        </Datagrid>
    );
}
