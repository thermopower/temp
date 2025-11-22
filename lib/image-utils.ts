export function getAccidentImagePath(location: string, accidentType: string): string {
  if (location.includes("1호기 보일러")) {
    return "/images/locations/location-3-boiler.jpg"
  }

  if (location.includes("1호기 터빈")) {
    return "/images/locations/location-1-turbine.jpg"
  }

  if (location.includes("2호기 보일러")) {
    return "/images/locations/location-4-boiler.jpg"
  }

  if (location.includes("2호기 터빈")) {
    return "/images/locations/location-2-turbine.jpg"
  }

  if (location.includes("복수탈염")) {
    return "/images/locations/location-6-chemical-tank.jpg"
  }

  if (location.includes("부생연료유")) {
    return "/images/locations/location-7-fuel-tank.jpg"
  }

  if (location.includes("발전폐수")) {
    return "/images/locations/location-9-wastewater.jpg"
  }

  if (location.includes("탈황폐수")) {
    return "/images/locations/location-8-fgd-wastewater.jpg"
  }

  if (location.includes("암모니아")) {
    return "/images/locations/location-5-ammonia-tank.jpg"
  }

  return "/images/plant-layout-numbered.png"
}
