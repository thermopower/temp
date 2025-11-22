"use client"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download } from "lucide-react"

const facilities = [
  "1호기 터빈건물",
  "2호기 터빈건물",
  "1호기 보일러 건물",
  "2호기 보일러 건물",
  "암모니아 저장 탱크",
  "복수탈염 약품저장 탱크",
  "부생연료유 저장 탱크",
  "탈황폐수처리 건물",
  "수처리 및 발전폐수처리 건물",
  "기타 위치",
]

export default function QRCodesPage() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

  const downloadQRCode = (facilityName: string) => {
    const svg = document.getElementById(`qr-${facilityName}`)
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    canvas.width = 512
    canvas.height = 512

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512)
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `QR_${facilityName}.png`
          link.click()
          URL.revokeObjectURL(url)
        }
      })
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">설비별 QR 코드</h1>
          <p className="text-slate-600">각 설비의 QR 코드를 스캔하면 해당 설비의 신고 페이지로 이동합니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => {
            const url = `${baseUrl}/report?facility=${encodeURIComponent(facility)}`
            return (
              <Card key={facility} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center gap-4">
                  <h3 className="text-lg font-semibold text-slate-900 text-center">{facility}</h3>
                  <div className="bg-white p-4 rounded-lg border-2 border-slate-200">
                    <QRCodeSVG id={`qr-${facility}`} value={url} size={200} level="H" includeMargin={true} />
                  </div>
                  <Button onClick={() => downloadQRCode(facility)} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    다운로드
                  </Button>
                  <p className="text-xs text-slate-500 text-center break-all">{url}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
