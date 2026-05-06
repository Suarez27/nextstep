import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { Box, Stack, Typography } from '@mui/material';
import { CreateButton, useResourceDefinition } from 'react-admin';

export default function AdminEmpty() {
    const resource = useResourceDefinition();
    const label = resource?.options?.label || resource?.name || 'este recurso';

    return (
        <Box
            sx={{
                mt: 2,
                px: 4,
                py: 6,
                borderRadius: 4,
                border: '1px dashed',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                textAlign: 'center',
            }}
        >
            <Stack spacing={1.5} alignItems="center">
                <Box
                    sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: '#eef5fb',
                        color: 'primary.main',
                    }}
                >
                    <InboxOutlinedIcon />
                </Box>

                <Typography variant="h6">Todavia no hay registros</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
                    {`La seccion ${label} aun no tiene contenido. Puedes crear el primer registro desde aqui.`}
                </Typography>

                {resource.hasCreate && <CreateButton label="Crear registro" variant="contained" />}
            </Stack>
        </Box>
    );
}
