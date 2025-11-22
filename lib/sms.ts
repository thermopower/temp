export interface SMSRequest {
  to: string
  message: string
  imageUrl?: string
}

export interface SMSResponse {
  success: boolean
  message?: string
  error?: string
  data?: {
    messageId: string
    to: string
    type: "SMS" | "LMS"
    messageLength: number
  }
  details?: any
}

export async function sendSMS(request: SMSRequest): Promise<SMSResponse> {
  try {
    console.log("[v0] ===== sendSMS 함수 시작 =====")
    console.log("[v0] SMS 발송 요청:", request)
    console.log("[v0] 요청 대상:", request.to)
    console.log("[v0] 메시지 길이:", request.message?.length)

    // 배포 환경을 위한 절대 URL 사용
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
    const apiUrl = `${baseUrl}/api/sms`

    console.log("[v0] Base URL:", baseUrl)
    console.log("[v0] API URL:", apiUrl)
    console.log("[v0] Environment:", process.env.NEXT_PUBLIC_BASE_URL ? "production" : "local")
    console.log("[v0] fetch 호출 시작...")

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    console.log("[v0] fetch 응답 수신, 상태 코드:", response.status)
    console.log("[v0] fetch 응답 상태:", response.ok ? "성공" : "실패")

    const result = await response.json()

    console.log("[v0] SMS API 응답 데이터:", result)
    console.log("[v0] ===== sendSMS 함수 완료 =====")

    return result
  } catch (error) {
    console.error("[v0] ===== sendSMS 함수 오류 발생 =====")
    console.error("[v0] 오류 타입:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[v0] 오류 메시지:", error instanceof Error ? error.message : String(error))
    console.error("[v0] SMS 발송 오류:", error)

    return {
      success: false,
      error: "SMS 발송 요청 중 오류가 발생했습니다.",
      details: error instanceof Error ? error.message : "알 수 없는 오류",
    }
  }
}

// 여러 번호로 SMS 발송
export async function sendBulkSMS(
  recipients: string[],
  message: string,
  imageUrl?: string,
): Promise<{ success: number; failed: number; results: SMSResponse[] }> {
  console.log("[v0] 대량 SMS 발송 시작:", {
    recipientCount: recipients.length,
    messagePreview: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
    hasImage: !!imageUrl,
  })

  const results: SMSResponse[] = []
  let success = 0
  let failed = 0

  for (const recipient of recipients) {
    try {
      const result = await sendSMS({
        to: recipient,
        message,
        imageUrl,
      })
      results.push(result)

      if (result.success) {
        success++
        console.log("[v0] SMS 발송 성공:", recipient)
      } else {
        failed++
        console.log("[v0] SMS 발송 실패:", recipient, result.error)
      }

      // API 호출 간격 조절 (1초 대기)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      failed++
      const errorResult: SMSResponse = {
        success: false,
        error: "발송 중 오류 발생",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      }
      results.push(errorResult)
      console.error("[v0] SMS 발송 오류:", recipient, error)
    }
  }

  console.log("[v0] 대량 SMS 발송 완료:", { success, failed, total: recipients.length })

  return { success, failed, results }
}
