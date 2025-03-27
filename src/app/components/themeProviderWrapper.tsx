"use client"
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material"

export default function ThemeProviderWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <ThemeProvider theme={createTheme({palette: {mode: "dark"}})}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
