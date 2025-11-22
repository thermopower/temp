export interface AuthorizedApprover {
  name: string
  phone: string
  company: string
  position: string
}

export const AUTHORIZED_APPROVERS: AuthorizedApprover[] = [
  { name: "황병소", phone: "010-0000-0001", company: "GS동해전력", position: "대표이사" },
  { name: "권혁만", phone: "010-0000-0002", company: "GS동해전력", position: "발전기술본부장" },
  { name: "심재춘", phone: "010-0000-0003", company: "GS동해전력", position: "발전처장" },
  { name: "이승열", phone: "010-0000-0004", company: "GS동해전력", position: "발전팀장" },
  { name: "윤지수", phone: "010-0000-0005", company: "GS동해전력", position: "발전팀 1파트장" },
  { name: "곽종만", phone: "010-0000-0006", company: "GS동해전력", position: "발전팀 2파트장" },
  { name: "임태헌", phone: "010-0000-0007", company: "GS동해전력", position: "발전팀 3파트장" },
  { name: "이민우", phone: "010-0000-0008", company: "GS동해전력", position: "발전팀 4파트장" },
  { name: "이명주", phone: "010-9185-3758", company: "GS동해전력", position: "환경화학팀(이명주-테스트)" },
]

export function verifyApprover(name: string, phone: string): AuthorizedApprover | null {
  // Normalize phone number (remove spaces, dashes)
  const normalizedPhone = phone.replace(/[\s-]/g, "")

  const approver = AUTHORIZED_APPROVERS.find(
    (a) => a.name === name && a.phone.replace(/[\s-]/g, "") === normalizedPhone,
  )

  return approver || null
}
