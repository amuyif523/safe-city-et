import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0aa8ff",
    },
    secondary: {
      main: "#f97316",
    },
    background: {
      default: "#02070c",
      paper: "#050d16",
    },
  },
  typography: {
    fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif",
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default darkTheme;
