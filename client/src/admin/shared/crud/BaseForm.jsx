import { SimpleForm } from 'react-admin';

export default function BaseForm({ children, ...props }) {
    return (
        <SimpleForm
            sx={{ maxWidth: 900 }}
            {...props}
        >
            {children}
        </SimpleForm>
    );
}