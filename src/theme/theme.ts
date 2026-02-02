"use client";

import { createTheme } from "@mui/material/styles";

// Summer Camp Planner theme based on product spec
const theme = createTheme({
  palette: {
    primary: {
      main: "#5BA9A4", // Teal
      light: "#7DBDB9",
      dark: "#478985",
    },
    secondary: {
      main: "#ffc107", // Amber
      light: "#ffca28",
      dark: "#ffa000",
    },
    error: {
      main: "#d32f2f",
    },
    success: {
      main: "#2e7d32",
    },
    warning: {
      main: "#ed6c02",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: "2rem",
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: "1.5rem",
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: "1.25rem",
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
    },
    h6: {
      fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
