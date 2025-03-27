"use client"
import { Box, Paper, Stack } from "@mui/material";
import OpenLAyerMap from "./components/openLAyerMap";
import { useEffect, useState } from "react";


export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Box sx={{width: "100%", height: "100%", alignContent: "center", justifyItems: "center"}}>
      <Paper elevation={1} sx={{width: "100%", height: "100%", maxWidth: 1200, maxHeight: 800, overflow: "hidden"}}>
        <Stack sx={{width: "100%", height: "100%"}} direction="row" spacing={2}>
          <Box flex={1} sx={{width: "100%", height: "100%"}}>
            <OpenLAyerMap />
          </Box>
          <Stack direction="column" flex={1}>

          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}
