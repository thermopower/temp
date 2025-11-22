import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber } = body

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    console.log("[v0] Verification code request:", {
      phoneNumber,
      code, // In production, don't log the actual code
      timestamp: new Date().toISOString(),
    })

    // In a real implementation, integrate with SMS service provider
    // Example:
    // const smsService = new SMSProvider({
    //   apiKey: process.env.SMS_API_KEY,
    //   apiSecret: process.env.SMS_API_SECRET,
    // })
    //
    // await smsService.send({
    //   to: phoneNumber,
    //   from: process.env.COMPANY_PHONE_NUMBER,
    //   message: `[GS동해전력] 인증번호: ${code}\n본인 확인을 위한 인증번호입니다.`,
    // })

    // Store the code in a database or cache (Redis) with expiration
    // For demo purposes, we return it (NEVER do this in production)
    await new Promise((resolve) => setTimeout(resolve, 500))

    console.log("[v0] Verification code sent to:", phoneNumber)

    return NextResponse.json({
      success: true,
      message: "Verification code sent",
      code: code, // Remove this in production
      expiresIn: 180, // 3 minutes
    })
  } catch (error) {
    console.error("[v0] Verification code sending error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send verification code",
      },
      { status: 500 },
    )
  }
}
