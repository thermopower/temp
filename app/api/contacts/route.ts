import { NextResponse } from "next/server"
import {
  fetchEmployeeContactsFromSheet,
  fetchPartnerContactsFromSheet,
  fetchVisitorsFromSheet,
} from "@/lib/google-sheets"

export async function GET(request: Request) {
  try {
    console.log("[v0] 연락처 데이터 조회 시작")

    const [employeeContacts, partnerContacts, visitorContacts] = await Promise.all([
      fetchEmployeeContactsFromSheet(),
      fetchPartnerContactsFromSheet(),
      fetchVisitorsFromSheet(),
    ])

    const allContacts = [...employeeContacts, ...partnerContacts, ...visitorContacts]

    console.log("[v0] 가져온 연락처 수:", {
      employees: employeeContacts.length,
      partners: partnerContacts.length,
      visitors: visitorContacts.length,
      total: allContacts.length,
    })

    return NextResponse.json({
      success: true,
      contacts: allContacts,
      breakdown: {
        employees: employeeContacts,
        partners: partnerContacts,
        visitors: visitorContacts,
      },
      message: `총 ${allContacts.length}명의 연락처를 가져왔습니다. (임직원 ${employeeContacts.length}명, 협력업체 ${partnerContacts.length}명, 방문자 ${visitorContacts.length}명)`,
    })
  } catch (error) {
    console.error("[v0] 연락처 데이터 조회 실패:", error)

    let errorMessage = "연락처 데이터를 불러올 수 없습니다"

    if (error instanceof Error) {
      if (error.message.includes("HTTP error")) {
        errorMessage = "Google Sheets 접근 권한이 없습니다. 목업 데이터를 사용합니다."
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        contacts: [],
      },
      { status: 500 },
    )
  }
}
