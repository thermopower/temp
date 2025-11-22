import { NextResponse } from "next/server"
import { fetchEmployeeContactsFromSheet } from "@/lib/google-sheets"

export async function GET() {
  try {
    console.log("[v0] ========== 승인 권한자 검증 시작 ==========")

    // Google Sheets에서 임직원 데이터 가져오기
    const employees = await fetchEmployeeContactsFromSheet()

    console.log(`[v0] 총 ${employees.length}명의 임직원 데이터 조회됨`)

    console.log("[v0] 전체 임직원 데이터:")
    employees.forEach((emp, index) => {
      console.log(
        `[v0] ${index + 1}. 직급: "${emp.department}", 이름: "${emp.name}", 전화: "${emp.phone}", 회사: "${emp.company}"`,
      )
    })

    // 승인 권한자 직급 목록
    const approverPositions = [
      "대표이사",
      "발전기술본부장",
      "발전처장",
      "발전팀장",
      "발전팀 1파트장",
      "발전팀 2파트장",
      "발전팀 3파트장",
      "발전팀 4파트장",
      "환경화학팀",
    ]

    console.log("[v0] 찾을 승인 권한자 직급:", approverPositions)

    // 승인 권한자 필터링
    const approvers = employees
      .filter((emp) => {
        // 직급이 승인 권한자 목록에 포함되는지 확인
        const isApprover = approverPositions.some((pos) => emp.department?.includes(pos))
        if (isApprover) {
          console.log(`[v0] ✓ 승인 권한자 발견: ${emp.department} - ${emp.name}`)
        }
        return isApprover
      })
      .map((emp) => ({
        name: emp.name,
        phone: emp.phone,
        company: emp.company,
        position: emp.department,
      }))

    console.log(`[v0] ========== 최종 결과: ${approvers.length}명의 승인 권한자 ==========`)
    approvers.forEach((approver, index) => {
      console.log(`[v0] ${index + 1}. ${approver.position}: ${approver.name} (${approver.phone})`)
    })

    return NextResponse.json({
      success: true,
      approvers,
      totalEmployees: employees.length,
      allEmployees: employees, // 전체 데이터도 반환
      message: `${approvers.length}명의 승인 권한자를 찾았습니다.`,
    })
  } catch (error) {
    console.error("[v0] 승인 권한자 검증 실패:", error)
    return NextResponse.json(
      {
        success: false,
        message: "승인 권한자 검증 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
