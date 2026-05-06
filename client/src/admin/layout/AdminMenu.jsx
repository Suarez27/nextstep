import ApartmentIcon from '@mui/icons-material/Apartment';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import WorkIcon from '@mui/icons-material/Work';
import { Box, Divider, Typography } from '@mui/material';
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
                    Backoffice
                </Typography>
                <Typography variant="h6" sx={{ lineHeight: 1.2, pr: 1 }}>
                    Gestion administrativa
                </Typography>
            </Box>

            <Divider sx={{ mx: 2, mb: 1.5 }} />

            <Menu.ResourceItem name="companies" primaryText="Empresas" leftIcon={<ApartmentIcon />} />
            <Menu.ResourceItem name="internships" primaryText="Practicas" leftIcon={<WorkIcon />} />
            <Menu.ResourceItem name="catalogs" primaryText="Catalogos" leftIcon={<AutoStoriesIcon />} />
            <Menu.ResourceItem name="catalog-items" primaryText="Items de catalogo" leftIcon={<ChecklistRtlIcon />} />
        </Menu>
    );
}
