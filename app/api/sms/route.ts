import { type NextRequest, NextResponse } from "next/server"

// SOLAPI SMS 발송 API
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] SMS API 호출 시작")

    const body = await request.json()
    const { to, message, imageUrl } = body

    console.log("[v0] SMS API 파라미터:", {
      to,
      messageLength: message?.length,
      hasImage: !!imageUrl,
      imageUrl: imageUrl || 'N/A'
    })

    if (!to || !message) {
      console.log("[v0] 필수 파라미터 누락:", { to: !!to, message: !!message })
      return NextResponse.json({ success: false, error: "전화번호와 메시지는 필수입니다." }, { status: 400 })
    }

    const apiKey = process.env.SOLAPI_API_KEY || ""
    const apiSecret = process.env.SOLAPI_API_SECRET || ""
    const fromNumber = process.env.SOLAPI_SENDER_NUMBER || ""

    console.log("[v0] SOLAPI 설정:", {
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      fromNumber: fromNumber?.substring(0, 4) + "****",
      usingEnvVar: !!process.env.SOLAPI_API_KEY,
    })

    if (!apiKey || !apiSecret || !fromNumber) {
      console.error("[v0] SOLAPI 환경 변수가 설정되지 않았습니다.")
      return NextResponse.json(
        {
          success: false,
          error: "SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER_NUMBER를 Vercel 환경 변수에 설정해주세요.",
        },
        { status: 500 },
      )
    }

    console.log("[v0] SOLAPI 설정 확인 완료")

    const messageBytes = new TextEncoder().encode(message).length
    const messageType = messageBytes <= 90 ? "SMS" : "LMS"

    console.log("[v0] 메시지 타입:", messageType, "바이트:", messageBytes)

    const dateTime = new Date().toISOString()
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    const encoder = new TextEncoder()
    const keyData = encoder.encode(apiSecret)
    const messageData = encoder.encode(dateTime + salt)

    const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData)
    const hmacSignature = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    console.log("[v0] HMAC 서명 생성 완료")

    // 이미지가 있으면 MMS로 전송
    const requestData: any = {
      message: {
        to,
        from: fromNumber,
        text: message,
        type: imageUrl ? "MMS" : messageType,
      },
    }

    // 이미지 URL이 있으면 추가
    if (imageUrl) {
      requestData.message.imageUrl = imageUrl;
      console.log("[v0] MMS 이미지 첨부:", imageUrl);
    }

    console.log("[v0] SOLAPI API 호출 시작")
    console.log("[v0] 인증 정보:", { apiKey, dateTime, saltLength: salt.length })

    const response = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${dateTime}, salt=${salt}, signature=${hmacSignature}`,
      },
      body: JSON.stringify(requestData),
    })

    console.log("[v0] SOLAPI API 응답 상태:", response.status)

    const responseData = await response.json()

    console.log("[v0] SOLAPI 응답 데이터:", responseData)

    if (response.ok) {
      console.log("[v0] SMS 발송 성공")

      return NextResponse.json({
        success: true,
        message: `${messageType} 발송이 완료되었습니다.`,
        data: {
          messageId: responseData.messageId,
          to,
          type: messageType,
        },
      })
    } else {
      console.log("[v0] SMS 발송 실패:", responseData)

      return NextResponse.json(
        {
          success: false,
          error: `SMS 발송 실패: ${responseData.errorMessage || "알 수 없는 오류"}`,
          details: responseData,
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("[v0] SMS API 오류:", error)

    return NextResponse.json(
      {
        success: false,
        error: "SMS 발송 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
