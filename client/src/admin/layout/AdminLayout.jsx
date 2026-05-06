import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import { Box, Stack, Typography } from '@mui/material';
import { AppBar, Layout, TitlePortal } from 'react-admin';
import AdminMenu from './AdminMenu';

function AdminAppBar() {
    return (
        <AppBar
            userMenu={false}
            toolbar={
                <Stack direction="row" alignItems="center" spacing={{ xs: 1.25, md: 2 }} sx={{ width: '100%' }}>
                    <Box
                        sx={{
                            width: { xs: 38, md: 42 },
                            height: { xs: 38, md: 42 },
                            borderRadius: 3,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            boxShadow: '0 10px 18px rgba(29, 78, 216, 0.2)',
                        }}
                    >
                        <AdminPanelSettingsOutlinedIcon fontSize="small" />
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.1 }}>
                            NextStep
                        </Typography>
                        <Typography variant="h6" sx={{ lineHeight: 1.2, fontSize: { xs: '1rem', md: '1.125rem' } }}>
                            Admin
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            gap: 1,
                            px: 1.5,
                            py: 0.75,
                            borderRadius: 999,
                            bgcolor: '#eef5fb',
                            color: 'text.secondary',
                        }}
                    >
                        <WbSunnyOutlinedIcon sx={{ fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Modo claro
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: { xs: 'none', lg: 'block' },
                            '& .RaTitlePortal-title': { fontWeight: 700, color: 'text.primary' },
                        }}
                    >
                        <TitlePortal />
                    </Box>
                </Stack>
            }
        />
    );
}

export default function AdminLayout(props) {
    return (
        <Layout
            {...props}
            appBar={AdminAppBar}
            menu={AdminMenu}
            sx={{
                '& .RaLayout-contentWithSidebar': {
                    background:
                        'radial-gradient(circle at top right, rgba(29, 78, 216, 0.08), transparent 24%), #f4f8fb',
                },
                '& .RaLayout-content': {
                    padding: { xs: 2, md: 3 },
                },
                '& .RaSidebar-fixed': {
                    top: 88,
                    height: 'calc(100vh - 88px)',
                },
            }}
        />
    );
}
