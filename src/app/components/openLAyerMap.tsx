"use client"
import { Map, View } from "ol"
import { useEffect, useRef, useState } from "react"

import TileLayer from "ol/layer/Tile"
import { OSM } from "ol/source"
import { Coordinate } from "ol/coordinate"
import { Box } from "@mui/material"

export default function OpenLAyerMap() {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)

  const [clickedCoord, setClickedCoord] = useState<Coordinate>()

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return

    const map = new Map({
      target: mapDivRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    })

    map.on("click", (e) => {
      setClickedCoord(e.coordinate)
    })

    mapRef.current = map

    return () => {
      map.setTarget(undefined)
      mapRef.current = null
    }
  }, [mapDivRef])

  useEffect(() => {
    console.log(clickedCoord)
  }, [clickedCoord])

  return (
    <Box ref={mapDivRef} sx={{width: "100%", height: "100%"}} />
  )
}
