import { Box, Typography } from '@mui/material';
import { DeleteButton, SaveButton, SimpleForm, Toolbar, useRecordContext } from 'react-admin';

function BaseFormToolbar() {
    const record = useRecordContext();

    return (
        <Toolbar
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                mt: 1,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                flexWrap: 'wrap',
            }}
        >
            <Box />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {record?.id ? <DeleteButton label="Eliminar" color="error" variant="outlined" /> : null}
                <SaveButton label="Guardar" variant="contained" />
            </Box>
        </Toolbar>
    );
}

export default function BaseForm({ children, ...props }) {
    return (
        <SimpleForm toolbar={<BaseFormToolbar />} sx={{ maxWidth: 980 }} {...props}>
            <Box
                sx={{
                    px: { xs: 0, md: 1 },
                    py: 0.5,
                    '& .RaInput-root': {
                        mb: 2.5,
                    },
                    '& .MuiFormControl-root': {
                        minWidth: { xs: '100%', sm: 240 },
                    },
                    '& .RaInputHelperText-root': {
                        mt: 0.5,
                        ml: 0,
                    },
                    '& .MuiFormHelperText-root.Mui-error': {
                        fontWeight: 600,
                    },
                }}
            >
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        Datos principales
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Completa la informacion del registro y revisa los campos obligatorios antes de guardar.
                    </Typography>
                </Box>
                {children}
            </Box>
        </SimpleForm>
    );
}
