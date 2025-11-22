export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: string
  windDegree: number
  precipitation: number
  visibility: number
  condition: string
}

export interface ForecastData {
  temperature: number | null
  humidity: number | null
  precipitation: number
  precipitationType: string
  windDirection: number | null
  windSpeed: number | null
  sky: string
  forecastTime: string
}

export interface SmartEvacuationRecommendation {
  primarySite: string
  alternativeSites: string[]
  route: string
  estimatedTime: number
  weatherConsiderations: string
  specialInstructions: string
}

// 기상 조건을 고려한 스마트 대피장소 추천
export function getSmartEvacuationRecommendation(
  alertLevel: "yellow" | "red",
  incidentType: "leak" | "fire_explosion",
  location: string,
  weather: WeatherData,
): SmartEvacuationRecommendation {
  // 사고 위치별 좌표 (간단한 방위 기준)
  const locationCoords: Record<string, { x: number; y: number }> = {
    "암모니아 저장탱크 (M-TK-01A)": { x: 0, y: 0 },
    "복수탈염 염산저장탱크 (M-TK-11A)": { x: 100, y: 50 },
    "부생연료유 탱크": { x: -50, y: 100 },
    "수소 저장고": { x: 50, y: -50 },
  }

  // 대피장소별 좌표
  const evacuationCoords: Record<string, { x: number; y: number }> = {
    구사옥: { x: -200, y: -100 },
    종합사무동: { x: 200, y: 100 },
    "동해시청 별관": { x: -500, y: 200 },
    동해웰빙타운: { x: 300, y: -300 },
    삼일고등학교: { x: -400, y: -200 },
    "정라동 주민센터": { x: 600, y: 100 },
    삼화초등학교: { x: -300, y: 300 },
    미로초등학교: { x: 400, y: 200 },
  }

  const incidentCoord = locationCoords[location] || { x: 0, y: 0 }

  // 바람 방향을 고려한 위험 지역 계산 (바람이 불어가는 방향이 위험)
  const windRadians = (weather.windDegree * Math.PI) / 180
  const dangerZoneX = Math.cos(windRadians) * weather.windSpeed * 50
  const dangerZoneY = Math.sin(windRadians) * weather.windSpeed * 50

  // 각 대피장소의 안전도 계산
  const safetyScores: Array<{ site: string; score: number; reason: string }> = []

  Object.entries(evacuationCoords).forEach(([site, coord]) => {
    let score = 100
    const reasons: string[] = []

    // 바람 방향 고려 (유해물질 누출 시)
    if (incidentType === "leak") {
      const siteX = coord.x - incidentCoord.x
      const siteY = coord.y - incidentCoord.y
      const dotProduct = siteX * dangerZoneX + siteY * dangerZoneY

      if (dotProduct > 0) {
        score -= 40 // 바람이 불어가는 방향은 위험
        reasons.push("바람 방향 위험")
      } else {
        score += 20 // 바람 반대 방향은 안전
        reasons.push("바람 반대 방향 안전")
      }
    }

    // 거리 고려
    const distance = Math.sqrt(Math.pow(coord.x - incidentCoord.x, 2) + Math.pow(coord.y - incidentCoord.y, 2))
    score += Math.min(distance / 10, 30) // 거리가 멀수록 안전

    // 기상 조건 고려
    if (weather.precipitation > 5) {
      if (site.includes("실내") || site.includes("건물") || site.includes("센터")) {
        score += 15
        reasons.push("실내 시설로 강우 시 유리")
      }
    }

    safetyScores.push({
      site,
      score,
      reason: reasons.join(", ") || "기본 안전도",
    })
  })

  // 경보 단계별 필터링
  let availableSites = safetyScores
  if (alertLevel === "yellow") {
    if (incidentType === "leak") {
      availableSites = safetyScores.filter((s) => s.site === "구사옥")
    } else {
      availableSites = safetyScores.filter((s) => s.site === "종합사무동")
    }
  }

  // 안전도 순으로 정렬
  availableSites.sort((a, b) => b.score - a.score)

  const primarySite = availableSites[0]?.site || "구사옥"
  const alternativeSites = availableSites.slice(1, 4).map((s) => s.site)

  // 기상 조건별 특별 지시사항
  let specialInstructions = ""
  const weatherWarnings: string[] = []

  if (weather.windSpeed > 10) {
    weatherWarnings.push(`강풍(${weather.windSpeed}m/s) 주의`)
  }
  if (weather.precipitation > 0) {
    weatherWarnings.push(`강수량 ${weather.precipitation}mm - 미끄럼 주의`)
  }
  if (weather.visibility < 5) {
    weatherWarnings.push(`가시거리 ${weather.visibility}km - 시야 불량`)
  }

  specialInstructions =
    weatherWarnings.length > 0 ? weatherWarnings.join(", ") + ". 안전한 대피 경로 이용" : "현재 기상 조건 양호"

  return {
    primarySite,
    alternativeSites,
    route: `${weather.windDirection}풍 ${weather.windSpeed}m/s 고려하여 ${primarySite}로 대피`,
    estimatedTime: alertLevel === "red" ? 15 : 10,
    weatherConsiderations: `바람: ${weather.windDirection}풍 ${weather.windSpeed}m/s, 기온: ${weather.temperature}°C, 습도: ${weather.humidity}%`,
    specialInstructions,
  }
}

function getWindDirectionKorean(degree: number): string {
  const directions = [
    { min: 0, max: 22.5, name: "북" },
    { min: 22.5, max: 67.5, name: "북동" },
    { min: 67.5, max: 112.5, name: "동" },
    { min: 112.5, max: 157.5, name: "남동" },
    { min: 157.5, max: 202.5, name: "남" },
    { min: 202.5, max: 247.5, name: "남서" },
    { min: 247.5, max: 292.5, name: "서" },
    { min: 292.5, max: 337.5, name: "북서" },
    { min: 337.5, max: 360, name: "북" },
  ]

  const direction = directions.find((d) => degree >= d.min && degree < d.max)
  return direction?.name || "북"
}

function getWeatherCondition(temperature: number, humidity: number, precipitation: number): string {
  if (precipitation > 0) return "비"
  if (humidity > 80) return "흐림"
  if (humidity > 60) return "구름많음"
  return "맑음"
}

function getFallbackWeatherData(): WeatherData {
  const windDirections = ["북", "북동", "동", "남동", "남", "남서", "서", "북서"]
  const windDegrees = [0, 45, 90, 135, 180, 225, 270, 315]
  const randomIndex = Math.floor(Math.random() * windDirections.length)

  return {
    temperature: Math.floor(Math.random() * 20) + 10,
    humidity: Math.floor(Math.random() * 40) + 40,
    windSpeed: Math.floor(Math.random() * 15) + 2,
    windDirection: windDirections[randomIndex],
    windDegree: windDegrees[randomIndex],
    precipitation: Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : 0,
    visibility: Math.floor(Math.random() * 5) + 5,
    condition: Math.random() > 0.8 ? "흐림" : Math.random() > 0.6 ? "구름많음" : "맑음",
  }
}

export async function getDongHaeWeather(): Promise<WeatherData> {
  try {
    // 서버 사이드에서 /api/weather 엔드포인트 호출
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/weather`

    console.log("[v0] 기상 API 호출:", apiUrl)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`Weather API 호출 실패: ${response.status} ${response.statusText}`)
      console.log("[v0] API 실패, 시뮬레이션 데이터 사용")
      return getFallbackWeatherData()
    }

    const weatherData = await response.json()

    if (!weatherData || typeof weatherData.temperature === "undefined") {
      console.error("잘못된 기상 데이터 형식")
      console.log("[v0] 데이터 형식 오류, 시뮬레이션 데이터 사용")
      return getFallbackWeatherData()
    }

    console.log("[v0] 기상 데이터 조회 성공:", weatherData)
    return weatherData
  } catch (error) {
    console.error("[v0] 기상정보 로드 실패:", error)
    console.log("[v0] 시뮬레이션 데이터 사용")
    return getFallbackWeatherData()
  }
}

export async function getDongHaeForecast(): Promise<ForecastData | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const response = await fetch("/api/forecast", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`초단기예보 API 호출 실패: ${response.status} ${response.statusText}`)
      return null
    }

    const forecastData = await response.json()
    console.log("[v0] 초단기예보 데이터:", forecastData)

    return forecastData
  } catch (error) {
    console.error("초단기예보 로드 실패:", error)
    return null
  }
}
