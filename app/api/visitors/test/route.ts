import { type NextRequest, NextResponse } from "next/server"
import { testSheetConnection, extractSpreadsheetId } from "@/lib/google-sheets"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const spreadsheetInput = searchParams.get("spreadsheetId")

  if (!spreadsheetInput) {
    return NextResponse.json({
      success: false,
      message: "구글시트 ID가 필요합니다.",
    })
  }

  try {
    console.log("구글시트 연결 테스트:", spreadsheetInput)

    let spreadsheetId: string

    // 전체 URL인지 확인 (https://docs.google.com으로 시작하는 경우)
    if (spreadsheetInput.startsWith("https://docs.google.com")) {
      // URL에서 스프레드시트 ID 추출
      const extractedId = extractSpreadsheetId(spreadsheetInput)

      if (!extractedId) {
        return NextResponse.json({
          success: false,
          message: "올바른 구글시트 URL 형식이 아닙니다. 예: https://docs.google.com/spreadsheets/d/YOUR_ID/edit",
        })
      }

      spreadsheetId = extractedId
    } else {
      // 이미 ID만 전달된 경우, 기본적인 형식 검증
      if (!/^[a-zA-Z0-9-_]+$/.test(spreadsheetInput) || spreadsheetInput.length < 10) {
        return NextResponse.json({
          success: false,
          message: "올바른 구글시트 ID 형식이 아닙니다.",
        })
      }

      spreadsheetId = spreadsheetInput
    }

    console.log("추출된 스프레드시트 ID:", spreadsheetId)

    const result = await testSheetConnection(spreadsheetId)

    return NextResponse.json({
      success: result.success,
      message: result.message,
      rowCount: result.rowCount,
      columnCount: result.columnCount,
      headers: result.headers,
    })
  } catch (error) {
    console.error("구글시트 연결 테스트 실패:", error)
    return NextResponse.json({
      success: false,
      message: "구글시트에 연결할 수 없습니다. URL을 확인해주세요.",
    })
  }
}
