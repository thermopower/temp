export interface LocationInfo {
  id: number
  name: string
  coordinates: { x: number; y: number } // 지도상 좌표 (백분율)
  description: string
}

export const LOCATION_MAP: LocationInfo[] = [
  {
    id: 1,
    name: "1호기 터빈건물",
    coordinates: { x: 35, y: 18 }, // 이미지의 ① 위치에 맞게 조정 - 터빈건물 좌측
    description: "1호기 터빈 발전기 설비",
  },
  {
    id: 2,
    name: "2호기 터빈건물",
    coordinates: { x: 65, y: 18 }, // 이미지의 ② 위치에 맞게 조정 - 터빈건물 우측
    description: "2호기 터빈 발전기 설비",
  },
  {
    id: 3,
    name: "1호기 보일러 건물",
    coordinates: { x: 35, y: 35 }, // 이미지의 ③ 위치에 맞게 조정 - 보일러건물 좌측
    description: "1호기 보일러 및 연소설비",
  },
  {
    id: 4,
    name: "2호기 보일러 건물",
    coordinates: { x: 65, y: 35 }, // 이미지의 ④ 위치에 맞게 조정 - 보일러건물 우측
    description: "2호기 보일러 및 연소설비",
  },
  {
    id: 5,
    name: "암모니아 저장 탱크",
    coordinates: { x: 78, y: 32 }, // 이미지의 ⑤ 위치에 맞게 조정 - 우측 저장탱크 구역
    description: "탈질설비용 암모니아 저장시설",
  },
  {
    id: 6,
    name: "복수탈염 약품저장 탱크",
    coordinates: { x: 75, y: 25 }, // 이미지의 ⑥ 위치에 맞게 조정 - 우측 상단 구역
    description: "복수탈염용 화학약품 저장시설",
  },
  {
    id: 7,
    name: "부생연료유 저장 탱크",
    coordinates: { x: 28, y: 12 }, // 이미지의 ⑦ 위치에 맞게 조정 - 좌측 상단 연료저장구역
    description: "보조연료용 부생연료유 저장시설",
  },
  {
    id: 8,
    name: "탈황폐수처리 건물",
    coordinates: { x: 25, y: 65 }, // 이미지의 ⑧ 위치에 맞게 조정 - 좌측 하단 처리시설
    description: "탈황설비 폐수처리시설",
  },
  {
    id: 9,
    name: "수처리 및 발전폐수처리 건물",
    coordinates: { x: 18, y: 40 },
    description: "발전소 폐수처리시설",
  },
]

export function getLocationById(id: number): LocationInfo | undefined {
  return LOCATION_MAP.find((location) => location.id === id)
}

export function getLocationByName(name: string): LocationInfo | undefined {
  return LOCATION_MAP.find((location) => location.name.includes(name) || name.includes(location.name))
}

export function formatLocationForSMS(locationId: number): string {
  const location = getLocationById(locationId)
  if (!location) return "기타 위치"

  const circledNumbers = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"]
  const circledNumber = circledNumbers[location.id - 1] || `(${location.id})`

  return `${circledNumber} ${location.name}`
}

export function getLocationPhotoPath(locationId: number): string {
  return `/images/locations/location-${locationId}.jpg`
}

/**
 * Google Drive 공유 링크를 직접 다운로드 가능한 이미지 URL로 변환
 * @param driveUrl - Google Drive 공유 링크
 * @returns 직접 이미지 URL
 */
export function convertDriveUrlToImageUrl(driveUrl: string): string {
  // Google Drive URL에서 파일 ID 추출
  const match = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const fileId = match[1];
    // 썸네일 방식 (브라우저에서 직접 표시 가능)
    // return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    // 또는 직접 다운로드 방식
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return driveUrl;
}

export function getLocationLayoutUrl(location: string): string | null {
  const normalizedLocation = location.replace(/\s+/g, "").toLowerCase()

  // Google Drive URL은 환경변수에서 JSON 형태로 로드
  // 환경변수 형식: LOCATION_LAYOUT_URLS='{"1호기보일러":"https://...","2호기보일러":"https://..."}'
  const defaultLocationUrls: Record<string, string> = {
    "1호기보일러": "",
    "2호기보일러": "",
    "1호기터빈": "",
    "2호기터빈": "",
    복수탈염약품저장탱크: "",
    탈황폐수처리건물: "",
    암모니아저장탱크: "",
    부생연료유저장탱크: "",
    수처리및폐수처리건물: "",
    수처리및발전폐수처리건물: "",
  }

  const envUrls = process.env.LOCATION_LAYOUT_URLS
  const locationUrlMap: Record<string, string> = envUrls
    ? { ...defaultLocationUrls, ...JSON.parse(envUrls) }
    : defaultLocationUrls

  for (const [key, url] of Object.entries(locationUrlMap)) {
    if (normalizedLocation.includes(key) || key.includes(normalizedLocation)) {
      return url
    }
  }

  return null
}

/**
 * 위치에 해당하는 배치도 이미지 URL 반환 (SMS MMS 첨부용)
 * @param location - 사고 위치
 * @returns 직접 다운로드 가능한 이미지 URL 또는 null
 */
export function getLocationLayoutImageUrl(location: string): string | null {
  const layoutUrl = getLocationLayoutUrl(location);
  if (!layoutUrl) return null;
  return convertDriveUrlToImageUrl(layoutUrl);
}
