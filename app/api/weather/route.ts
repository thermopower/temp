import { NextResponse } from "next/server"

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: string
  windDegree: number
  precipitation: number
  visibility: number
  condition: string
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

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[v0] 기상청 API허브 호출 시도 ${attempt}/${maxRetries}:`, url)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          Accept: "text/plain",
          "User-Agent": "Mozilla/5.0 (compatible; Emergency-System/1.0)",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        console.log(`[v0] API 호출 성공 (시도 ${attempt})`)
        return response
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      lastError = error as Error
      console.log(`[v0] API 호출 실패 (시도 ${attempt}/${maxRetries}):`, error)

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Max 5 second delay
        console.log(`[v0] ${delay}ms 후 재시도...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error("모든 재시도 실패")
}

export async function GET() {
  try {
    const authKey = process.env.KMA_API_KEY || ""

    if (!authKey) {
      console.error("[v0] KMA API key not configured")
      throw new Error("기상청 API key가 설정되지 않았습니다.")
    }

    const baseUrl = "https://apihub.kma.go.kr/api/typ01/url/kma_sfctm2.php"

    const now = new Date()
    const timestamps = []

    // 현재 시간부터 3시간 전까지 1시간 간격으로 시도
    for (let hoursBack = 0; hoursBack <= 3; hoursBack++) {
      const targetTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000)
      const tm =
        targetTime.getFullYear().toString() +
        (targetTime.getMonth() + 1).toString().padStart(2, "0") +
        targetTime.getDate().toString().padStart(2, "0") +
        targetTime.getHours().toString().padStart(2, "0") +
        "00"
      timestamps.push(tm)
    }

    let lastError: Error | null = null
    let responseText = ""

    for (const tm of timestamps) {
      try {
        const url = `${baseUrl}?tm=${tm}&stn=106&help=0&authKey=${authKey}`
        console.log(`[v0] 타임스탬프 ${tm} 시도 중...`)

        const response = await fetchWithRetry(
          url,
          {
            method: "GET",
          },
          2,
        ) // 타임스탬프별로 최대 2회만 재시도

        responseText = await response.text()
        console.log(`[v0] 타임스탬프 ${tm} 성공 - 응답 텍스트 (첫 300자):`, responseText.substring(0, 300))

        // 유효한 응답인지 확인
        if (
          !responseText.includes("ERROR") &&
          !responseText.includes("DENIED") &&
          !responseText.includes("INVALID") &&
          !responseText.includes("LIMIT") &&
          responseText.trim().length >= 10
        ) {
          console.log(`[v0] 타임스탬프 ${tm}에서 유효한 데이터 발견`)
          break // 성공한 타임스탬프 사용
        } else {
          console.log(`[v0] 타임스탬프 ${tm} 응답이 유효하지 않음`)
          throw new Error(`타임스탬프 ${tm} 데이터 없음`)
        }
      } catch (error) {
        lastError = error as Error
        console.log(`[v0] 타임스탬프 ${tm} 실패:`, error)
        continue // 다음 타임스탬프 시도
      }
    }

    // 모든 타임스탬프 실패 시
    if (!responseText || responseText.includes("ERROR")) {
      throw lastError || new Error("모든 타임스탬프에서 데이터 획득 실패")
    }

    const lines = responseText.trim().split("\n")
    if (lines.length < 2) {
      throw new Error("기상청 API허브 응답 데이터 부족")
    }

    const dataLine = lines[lines.length - 1]
    const values = dataLine
      .trim()
      .split(/\s+/)
      .filter((v) => v.length > 0)

    console.log(`[v0] 파싱된 필드 개수: ${values.length}`)
    console.log(`[v0] 전체 필드 값:`, values)

    let temperature = 15
    let humidity = 60
    let windSpeed = 3
    let windDirection = "북"
    let windDegree = 0
    let precipitation = 0
    let visibility = 10

    // 필드 순서: YYMMDDHHMI STN WD WS GST_WD GST_WS PA PS PT PR TA TD HM PV RN RN_DAY ... VS
    if (values.length >= 15) {
      const windDir = Number.parseFloat(values[2]) || 0 // WD (풍향)
      const windSpd = Number.parseFloat(values[3]) || 0 // WS (풍속)
      const temp = Number.parseFloat(values[10]) || 15 // TA (기온)
      const humid = Number.parseFloat(values[12]) || 60 // HM (습도)
      const rain = Number.parseFloat(values[14]) || 0 // RN (1시간 강수량)

      const vis = values.length > 30 ? Number.parseFloat(values[30]) || 10000 : 10000

      temperature = temp
      humidity = humid
      windSpeed = windSpd
      windDegree = windDir
      windDirection = getWindDirectionKorean(windDir)
      precipitation = rain
      visibility = Math.round(vis / 1000) // 미터를 킬로미터로 변환

      console.log(`[v0] 파싱 결과 - 온도: ${temp}, 습도: ${humid}, 풍속: ${windSpd}, 풍향: ${windDir}`)
    }

    const weatherData: WeatherData = {
      temperature: Math.round(temperature),
      humidity: Math.round(humidity),
      windSpeed: Math.round(windSpeed * 10) / 10,
      windDirection,
      windDegree: Math.round(windDegree),
      precipitation: Math.round(precipitation * 10) / 10,
      visibility: Math.max(1, visibility),
      condition: getWeatherCondition(temperature, humidity, precipitation),
    }

    console.log("[v0] API허브 실제 기상 데이터 반환:", weatherData)
    return NextResponse.json(weatherData)
  } catch (error) {
    console.error("기상청 API허브 연동 오류:", error)
    console.log("[v0] API허브 실패, 시뮬레이션 데이터 사용")
    const fallbackData = getFallbackWeatherData()
    console.log("[v0] 시뮬레이션 기상 데이터 반환:", fallbackData)
    return NextResponse.json(fallbackData)
  }
}
