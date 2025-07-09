import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4fd1c5',
      light: '#84ffff',
      dark: '#00a095',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#805ad5',
      light: '#b388ff',
      dark: '#4527a0',
      contrastText: '#ffffff',
    },
    error: {
      main: '#e53e3e',
    },
    success: {
      main: '#38a169',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#222e3c',
      secondary: '#4a5568',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: '0.75rem',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '6px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '4px 16px',
          height: 'auto',
          fontSize: '0.875rem',
        },
        head: {
          backgroundColor: '#f9fafb',
          fontWeight: 600,
          padding: '8px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          height: 'auto',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        sizeSmall: {
          height: '22px',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        sizeSmall: {
          padding: '4px',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
      },
    },
  },
});

export default theme; 