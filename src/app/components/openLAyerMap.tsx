"use client"
import { Map, View } from "ol"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"

import TileLayer from "ol/layer/Tile"
import { OSM } from "ol/source"
import { Coordinate } from "ol/coordinate"
import { Box } from "@mui/material"
import VectorSource from "ol/source/Vector"
import VectorLayer from "ol/layer/Vector"
import { Fill, Stroke, Style } from "ol/style"
import { Draw, Modify, Select } from "ol/interaction"
import { EInteractMode } from "../page"
import { getLength } from "ol/sphere"
import { toRadians, toDegrees } from "ol/math"
import { LineString } from "ol/geom"

interface OpenLayerMapProps {
  color: string
  interactMode: EInteractMode
  messages: string[]
  setMessages: Dispatch<SetStateAction<string[]>>
}

function calculateAzimuth(start: Coordinate, end: Coordinate) {
  // Convert each coordinate component from degrees to radians
  const startLon = toRadians(start[0])
  const startLat = toRadians(start[1])
  const endLon = toRadians(end[0])
  const endLat = toRadians(end[1])

  const deltaLon = endLon - startLon

  const x = Math.sin(deltaLon) * Math.cos(endLat)
  const y = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(deltaLon)

  const azimuth = Math.atan2(x, y)
  return (toDegrees(azimuth) + 360) % 360 // Normalize between 0 and 360 degrees
}

function calculateAngle(coords: Coordinate[]) {
  if (coords.length < 4) return 0

  const [A, B, C, D] = coords
  const AB = [B[0] - A[0], B[1] - A[1]]
  const BC = [C[0] - B[0], C[1] - B[1]]

  const dotProduct = AB[0] * BC[0] + AB[1] * BC[1]
  const magnitudeAB = Math.sqrt(AB[0] ** 2 + AB[1] ** 2)
  const magnitudeBC = Math.sqrt(BC[0] ** 2 + BC[1] ** 2)

  // Calculate angle in radians and convert to degrees
  const angle = Math.acos(dotProduct / (magnitudeAB * magnitudeBC)) * (180 / Math.PI)
  return angle
}

export default function OpenLAyerMap({
  color,
  interactMode,
  messages,
  setMessages
}: OpenLayerMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const vectorSource = new VectorSource()
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      stroke: new Stroke({ color: color, width: 2 }),
      fill: new Fill({ color: `${color}80` }),
    }),
  })

  const drawInteraction = new Draw({ source: vectorSource, type: "LineString" })
  const modifyInteraction = new Modify({ source: vectorSource })
  const selectInteraction = new Select()

  const measureLengthHandler = (e: any) => {
    const feature = e.selected[0]
    if (feature) {
      const geom = feature.getGeometry() as LineString
      const coords = geom.getCoordinates()
      const length = getLength(geom)
      const azimuth = calculateAzimuth(
        coords[0],
        coords[coords.length - 1]
      )
      setMessages((prev) => [
        ...prev,
        `Length: ${length.toFixed(2)} m, Azimuth: ${azimuth.toFixed(2)}°`,
      ])
    }
  }

  const measureAngleHandler = (e: any) => {
    const features = e.selected
    if (features.length >= 2) {
      const geom1 = features[0].getGeometry() as LineString
      const geom2 = features[1].getGeometry() as LineString
      const coords1 = geom1.getCoordinates()
      const coords2 = geom2.getCoordinates()
      // Here we use a simple placeholder that concatenates the coordinates
      const angle = calculateAngle([...coords1, ...coords2])
      setMessages((prev) => [...prev, `Angle: ${angle.toFixed(2)}°`])
    }
  }

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return

    const map = new Map({
      target: mapDivRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    })

    // Add a modify interaction
    map.addInteraction(modifyInteraction)

    mapRef.current = map

    return () => {
      map.setTarget(undefined)
      mapRef.current = null
    }
  }, [mapDivRef])

  useEffect(() => {
    if (!mapRef.current) return

    // Remove previous interactions (draw or select) if present
    mapRef.current.getInteractions().forEach((interaction) => {
      if (interaction instanceof Draw) {
        mapRef.current?.removeInteraction(interaction)
      }
      if (interaction instanceof Modify) {
        mapRef.current?.removeInteraction(interaction)
      }
    })

    // Set a new style for drawing features when drawing starts
    drawInteraction.on("drawstart", (e) => {
      const feature = e.feature
      feature.setStyle(
        new Style({
          stroke: new Stroke({
            color: color, // Set color dynamically based on the `color` prop
            width: 2,
          }),
          fill: new Fill({ color: `${color}80` }),
        })
      )
    })

    // Ensure that after drawing ends, the feature retains the correct color
    drawInteraction.on("drawend", (e) => {
      const feature = e.feature
      feature.setStyle(
        new Style({
          stroke: new Stroke({
            color: color, // Set color dynamically based on the `color` prop
            width: 2,
          }),
          fill: new Fill({ color: `${color}80` }),
        })
      )
    })

    switch (interactMode) {
      case EInteractMode.MeasureLength:
        break
      case EInteractMode.MeasureAngle:
        break
      default:
        mapRef.current.addInteraction(modifyInteraction)
        mapRef.current.addInteraction(drawInteraction)
        break
    }
  }, [color, interactMode])

  return (
    <Box ref={mapDivRef} sx={{width: "100%", height: "100%"}} />
  )
}
