import { Coordinate } from "ol/coordinate"
import { toDegrees, toRadians } from "ol/math"

export function calculateAzimuth(start: Coordinate, end: Coordinate) {
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
  
export function calculateAngleBetweenSegments(segment1: Coordinate[], segment2: Coordinate[]): number {
    const [A, B] = segment1
    const [C, D] = segment2

    const AB = [B[0] - A[0], B[1] - A[1]]
    const CD = [D[0] - C[0], D[1] - C[1]]

    const dotProduct = AB[0] * CD[0] + AB[1] * CD[1]
    const magnitudeAB = Math.sqrt(AB[0] ** 2 + AB[1] ** 2)
    const magnitudeCD = Math.sqrt(CD[0] ** 2 + CD[1] ** 2)

    const angleRad = Math.acos(dotProduct / (magnitudeAB * magnitudeCD))
    return (angleRad * 180) / Math.PI // Convert radians to degrees
}
  
export function getIntersectionPoint(line1: Coordinate[], line2: Coordinate[]): Coordinate | null {
const [[x1, y1], [x2, y2]] = line1
const [[x3, y3], [x4, y4]] = line2

const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
if (denominator === 0) return null // Parallel lines

const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator
const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator

if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)]
}

return null
}
  
export function calculateIntersectionAngles(
coords1: Coordinate[],
coords2: Coordinate[]
): { point: Coordinate; angle: number }[] {
const intersections: { point: Coordinate; angle: number }[] = []

for (let i = 0; i < coords1.length - 1; i++) {
    const segment1 = [coords1[i], coords1[i + 1]]

    for (let j = 0; j < coords2.length - 1; j++) {
    const segment2 = [coords2[j], coords2[j + 1]]

    const intersection = getIntersectionPoint(segment1, segment2)
    if (intersection) {
        const angle = calculateAngleBetweenSegments(segment1, segment2)
        intersections.push({ point: intersection, angle })
    }
    }
}

return intersections
}