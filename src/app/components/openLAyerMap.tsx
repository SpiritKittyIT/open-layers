"use client"
import { Feature, Map, View } from "ol"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"

import TileLayer from "ol/layer/Tile"
import { OSM } from "ol/source"
import { Box } from "@mui/material"
import VectorSource from "ol/source/Vector"
import VectorLayer from "ol/layer/Vector"
import { Fill, Stroke, Style } from "ol/style"
import { Draw, Modify, Select } from "ol/interaction"
import { getLength } from "ol/sphere"
import { LineString } from "ol/geom"
import { SelectEvent } from "ol/interaction/Select"
import { calculateAzimuth, calculateIntersectionAngles } from "@/help/functions"
import { EInteractMode } from "@/help/enums"

interface OpenLayerMapProps {
  color: string
  interactMode: EInteractMode
  setMessages: Dispatch<SetStateAction<string[]>>
}

export default function OpenLAyerMap({
  color,
  interactMode,
  setMessages
}: OpenLayerMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  
  const [modifyInteraction, setModifyInteraction] = useState<Modify>()
  const [drawInteraction, setDrawInteraction] = useState<Draw>()
  const [selectLengthInteraction, setSelectLengthInteraction] = useState<Select>()
  const [selectAngleInteraction, setSelectAngleInteraction] = useState<Select>()

  const measureLengthHandler = (e: SelectEvent) => {
    for (const feature of e.selected) {
      const geom = feature.getGeometry() as LineString
      const coordinates = geom.getCoordinates()
      let featureInfo = `Poly Length: ${getLength(geom)}m\n`
      if (coordinates.length < 2) {
        featureInfo += `    No segments`
        setMessages((prev) => [...prev, featureInfo])
        continue;
      }

      for (let i = 1; i < coordinates.length; ++i) {
        const start = coordinates[i - 1]
        const end = coordinates[i]
        const segment = new LineString([start, end])
        const segLength = getLength(segment)
        const segAzimuth = calculateAzimuth(start, end)
        featureInfo += `    Segment ${i}: Length: ${segLength.toFixed(2)}m, Azimuth: ${segAzimuth.toFixed(2)}°${i < coordinates.length - 1 ? "\n" : ""}`
      }

      setMessages((prev) => [...prev, featureInfo])
    }
  }

  const measureAngleHandler = (e: SelectEvent) => {
    const features = e.selected
    console.log(features)

    if (features.length < 2) { return }

    if (features.length > 2) {
      setMessages((prev) => [...prev, "Please select exactly 2 PolyLines"])
      console.log("haaa")
    }

    const geom1 = features[0].getGeometry() as LineString
    const geom2 = features[1].getGeometry() as LineString
    const intersections = calculateIntersectionAngles(geom1.getCoordinates(), geom2.getCoordinates())
  
    if (intersections.length === 0) {
      setMessages((prev) => [...prev, "The selected polylines do not intersect"])
      return
    }
  
    intersections.forEach(({ point, angle }, index) => {
      setMessages((prev) => [
        ...prev,
        `Intersection ${index + 1}: Point (${point[0].toFixed(2)}, ${point[1].toFixed(2)}), Angle: ${angle.toFixed(2)}°`
      ])
    })
  }

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return
    
    const vectorSource = new VectorSource()
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({ color: color, width: 2 }),
        fill: new Fill({ color: `${color}80` }),
      }),
    })

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

    mapRef.current = map

    // add Modify interaction
    mapRef.current.addInteraction(new Modify({ source: vectorSource }))
    const modIter = mapRef.current.getInteractions().item(mapRef.current.getInteractions().getLength() - 1) as Modify
    setModifyInteraction(modIter)

    //add Draw interaction
    mapRef.current.addInteraction(new Draw({ source: vectorSource, type: "LineString" }))
    const draIter = mapRef.current.getInteractions().item(mapRef.current.getInteractions().getLength() - 1) as Draw
    setDrawInteraction(draIter)

    // add Select interaction for MeasureLength
    mapRef.current.addInteraction(new Select())
    const selLenIter = mapRef.current.getInteractions().item(mapRef.current.getInteractions().getLength() - 1) as Select
    setSelectLengthInteraction(selLenIter)
    selLenIter.on("select", measureLengthHandler)

    // add Select interaction for MeasureAngle
    mapRef.current.addInteraction(new Select({
      multi: true, // Allow selecting multiple features
    }))
    const selAngIter = mapRef.current.getInteractions().item(mapRef.current.getInteractions().getLength() - 1) as Select
    setSelectAngleInteraction(selAngIter)
    selAngIter.on("select", measureAngleHandler)

    modIter.setActive(true)
    draIter.setActive(true)
    selLenIter.setActive(false)
    selAngIter.setActive(false)

    return () => {
      map.setTarget(undefined)
      mapRef.current = null
    }
  }, [mapDivRef])

  useEffect(() => {
    if (!mapRef.current) return

    switch (interactMode) {
      case EInteractMode.MeasureLength:
        drawInteraction?.setActive(false)
        modifyInteraction?.setActive(false)
        selectLengthInteraction?.setActive(true)
        selectAngleInteraction?.setActive(false)
        break
      case EInteractMode.MeasureAngle:
        drawInteraction?.setActive(false)
        modifyInteraction?.setActive(false)
        selectLengthInteraction?.setActive(false)
        selectAngleInteraction?.setActive(true)
        break
      default:
        drawInteraction?.setActive(true)
        modifyInteraction?.setActive(true)
        selectLengthInteraction?.setActive(false)
        selectAngleInteraction?.setActive(false)
    }
  }, [color, interactMode])

  return (
    <Box ref={mapDivRef} sx={{width: "100%", height: "100%"}} />
  )
}
