import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: { main: "#1565c0" }, // bleu pro
        secondary: { main: "#ff9800" },
        background: { default: "#f4f6f8" },
    },
    typography: {
        fontFamily: "Inter, Roboto, Arial, sans-serif",
        button: { textTransform: "none", fontWeight: 600 },
    },
    shape: { borderRadius: 10 },
});

export default theme;
