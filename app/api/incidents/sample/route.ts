import { NextResponse } from "next/server"

export async function POST() {
  try {
    const sampleIncident = {
      reporterName: "김다혜",
      reporterPhone: "010-1234-5678",
      reporterCompany: "임시출입자",
      location: "암모니아 저장 탱크",
      type: "화학물질 누출",
      description: "암모니아 저장탱크 배관 연결부에서 소량의 누출이 발견되었습니다. 현재 밸브를 잠그고 환기 중입니다.",
      severity: "major",
      timestamp: new Date().toISOString(),
      status: "active",
      alertLevel: "황색경보",
      isTraining: true, // 훈련 상황으로 설정
      alarmCriteria: {
        scope: "사업장 외부",
        selfResponse: "불가능",
        casualties: "없음",
        evacuation: "불필요",
      },
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/incidents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sampleIncident),
    })

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: "샘플 사고가 생성되었습니다",
      incident: result.incident,
    })
  } catch (error) {
    console.error("샘플 사고 생성 실패:", error)
    return NextResponse.json(
      {
        success: false,
        error: "샘플 사고를 생성할 수 없습니다",
      },
      { status: 500 },
    )
  }
}
