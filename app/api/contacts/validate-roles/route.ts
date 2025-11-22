import { NextResponse } from "next/server"
import { fetchEmployeeContactsFromSheet } from "@/lib/google-sheets"

export async function GET() {
  try {
    console.log("[v0] 역할/임무 데이터 검증 시작")

    const employees = await fetchEmployeeContactsFromSheet()

    const withRoles = employees.filter(
      (emp) => emp.emergencyRoleDescription && emp.emergencyRoleDescription.trim() !== "",
    )
    const withDuties = employees.filter((emp) => emp.emergencyDuty && emp.emergencyDuty.trim() !== "")
    const withBoth = employees.filter(
      (emp) =>
        emp.emergencyRoleDescription &&
        emp.emergencyRoleDescription.trim() !== "" &&
        emp.emergencyDuty &&
        emp.emergencyDuty.trim() !== "",
    )
    const withNeither = employees.filter(
      (emp) =>
        (!emp.emergencyRoleDescription || emp.emergencyRoleDescription.trim() === "") &&
        (!emp.emergencyDuty || emp.emergencyDuty.trim() === ""),
    )

    console.log("[v0] 역할/임무 데이터 분석:", {
      total: employees.length,
      withRoles: withRoles.length,
      withDuties: withDuties.length,
      withBoth: withBoth.length,
      withNeither: withNeither.length,
    })

    const detailedReport = employees.map((emp) => ({
      name: emp.name,
      phone: emp.phone,
      department: emp.department,
      position: (emp as any).position,
      hasRole: !!(emp.emergencyRoleDescription && emp.emergencyRoleDescription.trim() !== ""),
      hasDuty: !!(emp.emergencyDuty && emp.emergencyDuty.trim() !== ""),
      role: emp.emergencyRoleDescription || "(없음)",
      duty: emp.emergencyDuty || "(없음)",
    }))

    return NextResponse.json({
      success: true,
      summary: {
        totalEmployees: employees.length,
        withRoles: withRoles.length,
        withDuties: withDuties.length,
        withBoth: withBoth.length,
        withNeither: withNeither.length,
        completionRate: `${((withBoth.length / employees.length) * 100).toFixed(1)}%`,
      },
      employeesWithoutRoleDuty: withNeither.map((emp) => ({
        name: emp.name,
        department: emp.department,
        // position omitted as not available

      })),
      detailedReport,
      message: `총 ${employees.length}명 중 ${withBoth.length}명이 역할과 임무 정보를 모두 가지고 있습니다.`,
    })
  } catch (error) {
    console.error("[v0] 역할/임무 검증 실패:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "역할/임무 데이터 검증 실패",
      },
      { status: 500 },
    )
  }
}
