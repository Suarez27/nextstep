import { SimpleShowLayout } from 'react-admin';

export default function BaseShowLayout({ children, ...props }) {
    return (
        <SimpleShowLayout
            sx={{
                '& .RaSimpleShowLayout-stack': {
                    gap: 2,
                },
                '& .RaLabeled-root': {
                    padding: 2,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: '#fbfdff',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.7)',
                },
                '& .RaLabeled-label': {
                    marginBottom: 0.75,
                    color: 'text.secondary',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontSize: 11,
                },
            }}
            {...props}
        >
            {children}
        </SimpleShowLayout>
    );
}
