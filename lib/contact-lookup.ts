import { fetchEmployeeContactsFromSheet, fetchPartnerContactsFromSheet, fetchVisitorsFromSheet } from "./google-sheets"

export interface ContactLookupResult {
  found: boolean
  company: string
  department?: string
  role?: "employee" | "contractor" | "visitor"
}

// 전화번호에서 하이픈 제거 및 정규화
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[-\s]/g, "").replace(/^\+82/, "0")
}

// 연락처 데이터베이스에서 신고자 정보 조회
export async function lookupReporter(name: string, phone: string): Promise<ContactLookupResult> {
  const normalizedPhone = normalizePhoneNumber(phone)

  try {
    // 모든 연락처 데이터 가져오기
    const [employees, partners, visitors] = await Promise.all([
      fetchEmployeeContactsFromSheet(),
      fetchPartnerContactsFromSheet(),
      fetchVisitorsFromSheet(),
    ])

    // 이름과 전화번호로 매칭 시도
    const allContacts = [
      ...employees.map((c) => ({ ...c, role: "employee" as const })),
      ...partners.map((c) => ({ ...c, role: "contractor" as const })),
      ...visitors.map((c) => ({ ...c, role: "visitor" as const })),
    ]

    // 정확한 이름 매칭 우선
    let match = allContacts.find(
      (contact) => contact.name === name && normalizePhoneNumber(contact.phone) === normalizedPhone,
    )

    // 이름만 매칭 (전화번호가 다른 경우)
    if (!match) {
      match = allContacts.find((contact) => contact.name === name)
    }

    // 전화번호만 매칭 (이름이 다른 경우)
    if (!match) {
      match = allContacts.find((contact) => normalizePhoneNumber(contact.phone) === normalizedPhone)
    }

    if (match) {
      return {
        found: true,
        company: match.company || "기타",
        department: match.department,
        role: match.role,
      }
    }

    return {
      found: false,
      company: "기타",
    }
  } catch (error) {
    console.error("[v0] 연락처 조회 실패:", error)
    return {
      found: false,
      company: "기타",
    }
  }
}
