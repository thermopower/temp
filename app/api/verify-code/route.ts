import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, code } = body

    console.log("[v0] Verification attempt:", {
      phoneNumber,
      code,
      timestamp: new Date().toISOString(),
    })

    // In a real implementation, verify against stored code in database/cache
    // Example:
    // const storedCode = await redis.get(`verification:${phoneNumber}`)
    // if (storedCode !== code) {
    //   return NextResponse.json({ success: false, error: "Invalid code" }, { status: 400 })
    // }
    // await redis.del(`verification:${phoneNumber}`)

    // For demo purposes, accept any 6-digit code
    if (code.length === 6) {
      console.log("[v0] Verification successful for:", phoneNumber)

      return NextResponse.json({
        success: true,
        message: "Verification successful",
        phoneNumber,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid verification code",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("[v0] Verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Verification failed",
      },
      { status: 500 },
    )
  }
}
