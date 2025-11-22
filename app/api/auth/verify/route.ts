import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ success: false, error: "비밀번호를 입력해주세요." }, { status: 400 })
    }

    const adminPassword = process.env.ADMIN_PASSWORD

    if (password === adminPassword) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: "비밀번호가 올바르지 않습니다." }, { status: 401 })
    }
  } catch (error) {
    console.error("[v0] 인증 오류:", error)
    return NextResponse.json({ success: false, error: "인증 처리 중 오류가 발생했습니다." }, { status: 500 })
  }
}
