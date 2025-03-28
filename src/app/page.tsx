"use client"
import { Box, Button, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import OpenLAyerMap from "./components/openLAyerMap";
import { useEffect, useState } from "react";
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import EditIcon from '@mui/icons-material/Edit';
import StraightenIcon from '@mui/icons-material/Straighten';
import SquareFootIcon from '@mui/icons-material/SquareFoot';

export enum EInteractMode {
  Draw,
  MeasureLength,
  MeasureAngle
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [color, setColor] = useState("#ff0000")
  const [messages, setMessages] = useState<string[]>([])
  const [interactMode, setInteractMode] = useState(EInteractMode.Draw)

  const getPaperProps = () => {
    if (fullScreen) {
      return {borderRadius: 0}
    }
    return {maxWidth: 1200, maxHeight: 800}
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Box sx={{width: "100%", height: "100%", alignContent: "center", justifyItems: "center"}}>
      <Paper elevation={1} sx={{...getPaperProps(), width: "100%", height: "100%", overflow: "hidden"}}>
        <Stack sx={{width: "100%", height: "100%"}} direction="row" spacing={2}>
          <Box flex={1} sx={{width: "100%", height: "100%"}}>
            <OpenLAyerMap color={color} interactMode={interactMode} messages={messages} setMessages={setMessages} />
          </Box>
          <Stack direction="column" sx={{maxWidth: 600}} flex={1} spacing={1} >
            <Stack direction="row-reverse">
              {
                fullScreen
                ? <ZoomOutMapIcon onClick={() => setFullScreen(!fullScreen)} />
                : <ZoomInMapIcon onClick={() => setFullScreen(!fullScreen)} />
              }
            </Stack>
            <Stack direction="row" spacing={1} paddingRight={1}>
              <TextField
                label="Drawing Color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                sx={{ width: 150  }}
              />
              <Box flex={1} />
              <Button variant={interactMode === EInteractMode.Draw ? "contained" : "outlined"}
                onClick={() => {setInteractMode(EInteractMode.Draw)}}
              >
                <EditIcon />
              </Button>
              <Button variant={interactMode === EInteractMode.MeasureLength ? "contained" : "outlined"}
                onClick={() => {setInteractMode(EInteractMode.MeasureLength)}}
              >
                <StraightenIcon />
              </Button>
              <Button variant={interactMode === EInteractMode.MeasureAngle ? "contained" : "outlined"}
                onClick={() => {setInteractMode(EInteractMode.MeasureAngle)}}
              >
                <SquareFootIcon />
              </Button>
            </Stack>
            <Stack direction="column" sx={{overflowY: "scroll"}}>
             {
              messages.map((message, index) => {
                return (
                  <Typography key={index} variant="body1">
                    {message}
                  </Typography>
                )
              })
             }
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}
