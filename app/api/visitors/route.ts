import { NextResponse } from "next/server"
import { fetchVisitorsFromSheet, extractSpreadsheetId } from "@/lib/google-sheets"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const spreadsheetInput = searchParams.get("spreadsheetId")
    const range = searchParams.get("range") || "Sheet1!A:E"

    if (!spreadsheetInput) {
      return NextResponse.json(
        {
          success: false,
          error: "스프레드시트 ID가 필요합니다.",
        },
        { status: 400 },
      )
    }

    console.log("임시출입자 데이터 요청:", { spreadsheetInput, range })

    let spreadsheetId: string

    // 전체 URL인지 확인 (https://docs.google.com으로 시작하는 경우)
    if (spreadsheetInput.startsWith("https://docs.google.com")) {
      // URL에서 스프레드시트 ID 추출
      const extractedId = extractSpreadsheetId(spreadsheetInput)

      if (!extractedId) {
        return NextResponse.json(
          {
            success: false,
            error: "올바른 구글시트 URL 형식이 아닙니다. 예: https://docs.google.com/spreadsheets/d/YOUR_ID/edit",
          },
          { status: 400 },
        )
      }

      spreadsheetId = extractedId
    } else {
      // 이미 ID만 전달된 경우, 기본적인 형식 검증
      if (!/^[a-zA-Z0-9-_]+$/.test(spreadsheetInput) || spreadsheetInput.length < 10) {
        return NextResponse.json(
          {
            success: false,
            error: "올바른 구글시트 ID 형식이 아닙니다.",
          },
          { status: 400 },
        )
      }

      spreadsheetId = spreadsheetInput
    }

    console.log("추출된 스프레드시트 ID:", spreadsheetId)

    const visitors = await fetchVisitorsFromSheet();

    return NextResponse.json({
      success: true,
      data: visitors,
      count: visitors.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("임시출입자 API 오류:", error)

    if (error instanceof Error && error.message === "API_NOT_ENABLED") {
      return NextResponse.json(
        {
          success: false,
          error: "Google Sheets API가 활성화되지 않았습니다.",
          details: "SERVICE_DISABLED",
        },
        { status: 403 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "임시출입자 데이터를 가져오는데 실패했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 },
    )
  }
}
