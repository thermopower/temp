import { Buffer } from "buffer"

export interface SolapiStorageUploadResponse {
  success: boolean
  fileId?: string
  error?: string
  details?: any
}

export interface ImageUploadInput {
  data: File | Buffer
  name: string
  type: string
}

export async function uploadImageToSolapiStorage(input: File | ImageUploadInput): Promise<SolapiStorageUploadResponse> {
  try {
    const apiKey = process.env.SOLAPI_API_KEY || "NCS7OH87AP211RVP"
    const apiSecret = process.env.SOLAPI_API_SECRET || "HFNV5AIYV0RKIV4C8OYLLFFO4JD0YJH3"

    console.log("[v0] SOLAPI 스토리지 설정:", {
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      usingEnvVar: !!process.env.SOLAPI_API_KEY,
    })

    if (!apiKey || !apiSecret) {
      console.error("[v0] SOLAPI 환경 변수가 설정되지 않았습니다.")
      return {
        success: false,
        error: "SOLAPI_API_KEY와 SOLAPI_API_SECRET를 Vercel 환경 변수에 설정해주세요.",
      }
    }

    let fileName: string
    let fileSize: number
    let fileType: string
    let arrayBuffer: ArrayBuffer

    if (input instanceof File) {
      fileName = input.name
      fileSize = input.size
      fileType = input.type
      arrayBuffer = await input.arrayBuffer()
    } else {
      fileName = input.name
      fileType = input.type
      if (input.data instanceof Buffer) {
        fileSize = input.data.length
        arrayBuffer = input.data.buffer.slice(input.data.byteOffset, input.data.byteOffset + input.data.byteLength)
      } else {
        // It's a File
        fileSize = input.data.size
        arrayBuffer = await input.data.arrayBuffer()
      }
    }

    console.log("[v0] 솔라피 스토리지 업로드 시작:", {
      fileName,
      fileSize: `${(fileSize / 1024).toFixed(1)}KB`,
      fileType,
    })

    const base64File = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    // HMAC-SHA256 인증을 위한 타임스탬프와 솔트
    const dateTime = new Date().toISOString()
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    // Web Crypto API를 사용한 HMAC-SHA256 생성
    const encoder = new TextEncoder()
    const keyData = encoder.encode(apiSecret)
    const messageData = encoder.encode(dateTime + salt)

    const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData)
    const hmacSignature = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    const requestBody = {
      file: base64File,
      name: fileName,
      type: fileType,
    }

    console.log("[v0] 솔라피 스토리지 API 호출")

    // 솔라피 스토리지 API 호출
    const response = await fetch("https://api.solapi.com/storage/v1/files", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${dateTime}, salt=${salt}, signature=${hmacSignature}`,
      },
      body: JSON.stringify(requestBody),
    })

    const responseData = await response.json()

    console.log("[v0] 솔라피 스토리지 응답:", {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    })

    if (response.ok && responseData.fileId) {
      console.log("[v0] 이미지 업로드 성공:", {
        fileId: responseData.fileId,
        fileName: fileName,
      })

      return {
        success: true,
        fileId: responseData.fileId,
      }
    } else {
      console.log("[v0] 이미지 업로드 실패:", responseData)

      return {
        success: false,
        error: `이미지 업로드 실패: ${responseData.errorMessage || "알 수 없는 오류"}`,
        details: responseData,
      }
    }
  } catch (error) {
    console.error("[v0] 솔라피 스토리지 API 오류:", error)

    return {
      success: false,
      error: "이미지 업로드 중 오류가 발생했습니다.",
      details: error instanceof Error ? error.message : "알 수 없는 오류",
    }
  }
}
