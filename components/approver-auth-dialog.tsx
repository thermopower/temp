"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, AlertCircle } from "lucide-react"
import { verifyApprover, type AuthorizedApprover, AUTHORIZED_APPROVERS } from "@/lib/authorized-approvers"

interface ApproverAuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthenticated: (approver: AuthorizedApprover) => void
}

export function ApproverAuthDialog({ open, onOpenChange, onAuthenticated }: ApproverAuthDialogProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, "")
    // Auto-format with hyphens for display
    let formatted = digitsOnly
    if (digitsOnly.length > 3 && digitsOnly.length <= 7) {
      formatted = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`
    } else if (digitsOnly.length > 7) {
      formatted = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7, 11)}`
    }
    setPhone(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsVerifying(true)

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const approver = verifyApprover(name, phone)

    if (approver) {
      onAuthenticated(approver)
      onOpenChange(false)
      // Reset form
      setName("")
      setPhone("")
    } else {
      setError("인증 실패: 이름 또는 전화번호가 일치하지 않습니다.")
    }

    setIsVerifying(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            승인 권한 인증
          </DialogTitle>
          <DialogDescription>사고 승인 및 문자 발송을 위해 본인 인증이 필요합니다.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="01012345678"
              value={phone}
              onChange={handlePhoneChange}
              required
              autoComplete="off"
              maxLength={13}
            />
            <p className="text-xs text-gray-500">숫자만 입력하세요 (하이픈 자동 입력)</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>승인 권한자:</strong>{" "}
              {AUTHORIZED_APPROVERS.map((approver, index) => (
                <span key={approver.name}>
                  {approver.name}({approver.position}){index < AUTHORIZED_APPROVERS.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isVerifying}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isVerifying}>
              {isVerifying ? "인증 중..." : "인증하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
