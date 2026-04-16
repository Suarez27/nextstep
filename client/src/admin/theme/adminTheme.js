import { createTheme } from '@mui/material/styles';

const brand = {
    ink: '#12263a',
    slate: '#607287',
    primary: '#1d4ed8',
    primarySoft: '#dbeafe',
    accent: '#0f766e',
    border: '#d7e1ea',
    surface: '#ffffff',
    surfaceAlt: '#f4f8fb',
    surfaceSoft: '#eef5fb',
    success: '#15803d',
    warning: '#b7791f',
    error: '#b42318',
};

const adminTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: brand.primary,
            contrastText: '#ffffff',
        },
        secondary: {
            main: brand.accent,
            contrastText: '#ffffff',
        },
        background: {
            default: brand.surfaceAlt,
            paper: brand.surface,
        },
        text: {
            primary: brand.ink,
            secondary: brand.slate,
        },
        divider: brand.border,
        success: {
            main: brand.success,
        },
        warning: {
            main: brand.warning,
        },
        error: {
            main: brand.error,
        },
    },
    shape: {
        borderRadius: 14,
    },
    typography: {
        fontFamily: '"Segoe UI", "Public Sans", "Helvetica Neue", Arial, sans-serif',
        h5: {
            fontWeight: 700,
            color: brand.ink,
        },
        h6: {
            fontWeight: 700,
            color: brand.ink,
        },
        subtitle2: {
            fontWeight: 700,
            color: brand.ink,
        },
        body1: {
            fontSize: '0.95rem',
            lineHeight: 1.55,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
        },
        button: {
            textTransform: 'none',
            fontWeight: 700,
            letterSpacing: 0.1,
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: brand.surfaceAlt,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: 'rgba(255,255,255,0.94)',
                    color: brand.ink,
                    borderBottom: `1px solid ${brand.border}`,
                    boxShadow: '0 10px 28px rgba(18, 38, 58, 0.08)',
                    backdropFilter: 'blur(10px)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: `linear-gradient(180deg, ${brand.surface} 0%, ${brand.surfaceAlt} 100%)`,
                    borderRight: `1px solid ${brand.border}`,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                rounded: {
                    borderRadius: 18,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    minHeight: 40,
                    paddingInline: 16,
                    borderRadius: 12,
                    boxShadow: 'none',
                    fontSize: '0.92rem',
                },
                containedPrimary: {
                    boxShadow: '0 10px 20px rgba(29, 78, 216, 0.2)',
                },
                outlinedError: {
                    color: brand.error,
                    borderColor: '#f4b4a6',
                    backgroundColor: '#fff8f6',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    fontWeight: 700,
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 14,
                },
                standardError: {
                    backgroundColor: '#fff3f0',
                    color: brand.error,
                },
                standardSuccess: {
                    backgroundColor: '#edf8f0',
                    color: brand.success,
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    backgroundColor: '#fbfdff',
                    borderRadius: 12,
                },
                notchedOutline: {
                    borderColor: brand.border,
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: brand.slate,
                    fontWeight: 600,
                },
            },
        },
        MuiFormHelperText: {
            styleOverrides: {
                root: {
                    marginLeft: 0,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    backgroundColor: brand.surfaceSoft,
                    color: brand.ink,
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    letterSpacing: 0.25,
                },
                root: {
                    borderBottom: `1px solid ${brand.border}`,
                    fontSize: '0.92rem',
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    transition: 'background-color 120ms ease',
                    '&:hover td': {
                        backgroundColor: '#f8fbff',
                    },
                },
            },
        },
        RaLayout: {
            styleOverrides: {
                appFrame: {
                    marginTop: 88,
                },
                contentWithSidebar: {
                    marginTop: 0,
                },
                content: {
                    backgroundColor: brand.surfaceAlt,
                },
            },
        },
        RaSidebar: {
            styleOverrides: {
                root: {
                    '& .RaSidebar-drawerPaper': {
                        width: 286,
                        boxShadow: '10px 0 28px rgba(18, 38, 58, 0.04)',
                    },
                },
            },
        },
        RaMenuItemLink: {
            styleOverrides: {
                root: {
                    margin: '4px 12px',
                    borderRadius: 12,
                    color: brand.slate,
                    fontWeight: 600,
                    '& .RaMenuItemLink-icon': {
                        color: brand.slate,
                    },
                    '&:hover': {
                        backgroundColor: brand.primarySoft,
                        color: brand.ink,
                    },
                    '&.RaMenuItemLink-active': {
                        backgroundColor: '#e8f2ec',
                        color: '#0f5c4f',
                        fontWeight: 700,
                    },
                    '&.RaMenuItemLink-active .RaMenuItemLink-icon': {
                        color: brand.accent,
                    },
                },
            },
        },
        RaDatagrid: {
            styleOverrides: {
                root: {
                    '& .RaDatagrid-table': {
                        borderCollapse: 'separate',
                        borderSpacing: 0,
                    },
                    '& .RaDatagrid-headerCell': {
                        verticalAlign: 'middle',
                    },
                    '& .RaDatagrid-rowCell': {
                        verticalAlign: 'middle',
                    },
                },
                header: {
                    backgroundColor: brand.surfaceSoft,
                },
                rowEven: {
                    backgroundColor: '#fcfdff',
                },
            },
        },
        RaSimpleForm: {
            styleOverrides: {
                toolbar: {
                    backgroundColor: 'transparent',
                    paddingInline: 0,
                },
                form: {
                    paddingTop: 8,
                },
            },
        },
    },
});

export default adminTheme;
