import { Datagrid } from 'react-admin';

export default function BaseDatagrid({ children, ...props }) {
    return (
        <Datagrid
            rowClick="show"
            bulkActionButtons={false}
            {...props}
        >
            {children}
        </Datagrid>
    );
}