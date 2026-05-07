import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Divider, Typography } from '@mui/material';
import { Menu } from 'react-admin';

export default function AdminMenu() {
    return (
        <Menu
            sx={{
                pt: 2,
                '& .RaMenuItemLink-root': {
                    minHeight: 48,
                    px: 1.5,
                },
                '& .RaMenuItemLink-icon': {
                    minWidth: 34,
                },
            }}
        >
            <Box sx={{ px: 2.5, pb: 1.5 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1 }}>
                    Administracion
                </Typography>
                <Typography variant="h6" sx={{ lineHeight: 1.2, pr: 1 }}>
                    Gestion administrativa
                </Typography>
            </Box>

            <Divider sx={{ mx: 2, mb: 1.5 }} />

            <Menu.ResourceItem name="companies" primaryText="Empresas" leftIcon={<BusinessIcon />} />
            <Menu.ResourceItem name="centers" primaryText="Centros" leftIcon={<BusinessIcon />} />
            <Menu.ResourceItem name="internships" primaryText="Practicas" leftIcon={<BusinessIcon />} />
            <Menu.ResourceItem name="catalogs" primaryText="Catalogos" leftIcon={<AutoStoriesIcon />} />
            <Menu.ResourceItem name="catalog-items" primaryText="Items de catalogo" leftIcon={<ChecklistRtlIcon />} />
            <Menu.ResourceItem name="verification-audits" primaryText="Auditoria validaciones" leftIcon={<ChecklistRtlIcon />} />

            <Divider sx={{ mx: 2, mt: 1.5, mb: 1 }} />

            <Box sx={{ px: 1.5, pb: 1 }}>
                <Button
                    component="a"
                    href="/dashboard"
                    startIcon={<ArrowBackIcon />}
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                    Volver al panel
                </Button>
            </Box>
        </Menu>
    );
}
