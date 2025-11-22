import { NextResponse } from "next/server"
import { DONGHAE_COORDS } from "@/lib/grid-converter"

export const runtime = "edge"
export const dynamic = "force-dynamic"

interface ForecastItem {
  baseDate: string
  baseTime: string
  category: string
  fcstDate: string
  fcstTime: string
  fcstValue: string
  nx: number
  ny: number
}

interface UltraShortForecast {
  temperature: number | null // 기온 (T1H)
  humidity: number | null // 습도 (REH)
  precipitation: number // 1시간 강수량 (RN1)
  precipitationType: string // 강수형태 (PTY)
  windDirection: number | null // 풍향 (VEC)
  windSpeed: number | null // 풍속 (WSD)
  sky: string // 하늘상태 (SKY)
  forecastTime: string
}

function getPrecipitationType(pty: string): string {
  switch (pty) {
    case "0":
      return "없음"
    case "1":
      return "비"
    case "2":
      return "비/눈"
    case "3":
      return "눈"
    case "4":
      return "소나기"
    default:
      return "없음"
  }
}

function getSkyCondition(sky: string): string {
  switch (sky) {
    case "1":
      return "맑음"
    case "3":
      return "구름많음"
    case "4":
      return "흐림"
    default:
      return "맑음"
  }
}

export async function GET() {
  console.log("[v0] 초단기예보 API 호출 시작")

  try {
    const apiKey = process.env.KMA_API_KEY

    if (!apiKey) {
      console.error("[v0] KMA_API_KEY가 설정되지 않음")
      return NextResponse.json({ error: "API 키가 설정되지 않았습니다" }, { status: 500 })
    }

    // 현재 시간 기준으로 발표 시각 계산
    const now = new Date()
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000) // UTC+9

    // 초단기예보는 매시간 30분에 생성, 10분마다 갱신
    // 현재 시각 기준으로 가장 최근 발표 시각 계산
    let baseHour = koreaTime.getUTCHours()
    const baseMinute = koreaTime.getUTCMinutes()

    // 30분 이전이면 이전 시간 사용
    if (baseMinute < 30) {
      baseHour = baseHour - 1
      if (baseHour < 0) {
        baseHour = 23
        koreaTime.setUTCDate(koreaTime.getUTCDate() - 1)
      }
    }

    const baseDate = `${koreaTime.getUTCFullYear()}${String(koreaTime.getUTCMonth() + 1).padStart(2, "0")}${String(koreaTime.getUTCDate()).padStart(2, "0")}`
    const baseTime = `${String(baseHour).padStart(2, "0")}30`

    console.log(`[v0] 초단기예보 조회 - 발표시각: ${baseDate} ${baseTime}`)
    console.log(`[v0] 동해시 격자 좌표: nx=${DONGHAE_COORDS.x}, ny=${DONGHAE_COORDS.y}`)

    // 기상청 단기예보 API 호출
    const forecastBaseUrl = process.env.KMA_FORECAST_URL || "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst"
    const apiUrl = new URL(forecastBaseUrl)
    apiUrl.searchParams.append("serviceKey", apiKey)
    apiUrl.searchParams.append("pageNo", "1")
    apiUrl.searchParams.append("numOfRows", "60")
    apiUrl.searchParams.append("dataType", "JSON")
    apiUrl.searchParams.append("base_date", baseDate)
    apiUrl.searchParams.append("base_time", baseTime)
    apiUrl.searchParams.append("nx", DONGHAE_COORDS.x.toString())
    apiUrl.searchParams.append("ny", DONGHAE_COORDS.y.toString())

    console.log(`[v0] API 요청 URL: ${apiUrl.toString()}`)

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.error(`[v0] API 호출 실패: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error(`[v0] 에러 응답: ${errorText}`)
      return NextResponse.json({ error: "기상청 API 호출 실패" }, { status: response.status })
    }

    const data = await response.json()
    console.log(`[v0] API 응답 수신:`, JSON.stringify(data).substring(0, 500))

    if (!data.response || !data.response.body || !data.response.body.items || !data.response.body.items.item) {
      console.error("[v0] 잘못된 API 응답 형식")
      return NextResponse.json({ error: "잘못된 API 응답 형식" }, { status: 500 })
    }

    const items: ForecastItem[] = data.response.body.items.item

    // 가장 가까운 예보 시각의 데이터만 추출
    const latestForecast: Record<string, string> = {}
    let forecastTime = ""

    items.forEach((item) => {
      if (!forecastTime) {
        forecastTime = `${item.fcstDate} ${item.fcstTime}`
      }
      // 같은 예보 시각의 데이터만 수집
      if (`${item.fcstDate} ${item.fcstTime}` === forecastTime) {
        latestForecast[item.category] = item.fcstValue
      }
    })

    console.log(`[v0] 파싱된 예보 데이터:`, latestForecast)

    const forecast: UltraShortForecast = {
      temperature: latestForecast.T1H ? Number.parseFloat(latestForecast.T1H) : null,
      humidity: latestForecast.REH ? Number.parseFloat(latestForecast.REH) : null,
      precipitation: latestForecast.RN1 ? Number.parseFloat(latestForecast.RN1) : 0,
      precipitationType: getPrecipitationType(latestForecast.PTY || "0"),
      windDirection: latestForecast.VEC ? Number.parseFloat(latestForecast.VEC) : null,
      windSpeed: latestForecast.WSD ? Number.parseFloat(latestForecast.WSD) : null,
      sky: getSkyCondition(latestForecast.SKY || "1"),
      forecastTime,
    }

    console.log(`[v0] 초단기예보 반환:`, forecast)

    return NextResponse.json(forecast)
  } catch (error) {
    console.error("[v0] 초단기예보 조회 중 오류:", error)
    return NextResponse.json({ error: "초단기예보 조회 실패" }, { status: 500 })
  }
}
