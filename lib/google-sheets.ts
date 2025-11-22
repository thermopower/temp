const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY || ""

// 스프레드시트 ID 설정
const EMPLOYEE_SPREADSHEET_ID = process.env.EMPLOYEE_SPREADSHEET_ID || ""
const PARTNER_SPREADSHEET_ID = process.env.PARTNER_SPREADSHEET_ID || ""
const VISITOR_SPREADSHEET_ID = process.env.VISITOR_SPREADSHEET_ID || ""

export interface Employee {
  id: string
  name: string
  phone: string
  company: string
  department: string
  position?: string
  role: "employee"
  isActive: boolean
  emergencyRole?: string
  emergencyRoleDescription?: string
  emergencyDuty?: string
}



export interface Partner {
  id: string
  name: string
  phone: string
  company: string
  department: string
  role: "partner"
  isActive: boolean
}

export interface Visitor {
  id: string
  name: string
  phone: string
  company: string
  department: string
  role: "visitor"
  isActive: boolean
  status: string
}

// Mock data fallbacks
const mockVisitorContacts = [
  {
    id: "visitor-1",
    name: "홍길동",
    phone: "01012345678",
    company: "ABC회사",
    department: "회의참석",
    role: "visitor" as const,
    isActive: true,
    status: "입장",
  },
  {
    id: "visitor-2",
    name: "김철수",
    phone: "01098765432",
    company: "XYZ회사",
    department: "시설점검",
    role: "visitor" as const,
    isActive: true,
    status: "입장",
  },
  {
    id: "visitor-3",
    name: "이영희",
    phone: "01055551234",
    company: "DEF회사",
    department: "업무협의",
    role: "visitor" as const,
    isActive: false,
    status: "퇴장",
  },
]

const mockEmployeeContacts: Employee[] = [
  {
    id: "emp-001",
    name: "김동해",
    phone: "01012345678",
    company: "GS동해전력",
    department: "대표이사",
    role: "employee" as const,
    isActive: true,
    emergencyRole: "commander",
    emergencyRoleDescription: "",
    emergencyDuty: "",
  },
  {
    id: "emp-002",
    name: "박발전",
    phone: "01023456789",
    company: "GS동해전력",
    department: "발전파트장",
    role: "employee" as const,
    isActive: true,
    emergencyRole: "field_response_leader",
    emergencyRoleDescription: "",
    emergencyDuty: "",
  },
  {
    id: "emp-003",
    name: "이비상",
    phone: "01034567890",
    company: "GS동해전력",
    department: "비상대응팀장",
    role: "employee" as const,
    isActive: true,
    emergencyRole: "emergency_contact_leader",
    emergencyRoleDescription: "",
    emergencyDuty: "",
  },
  {
    id: "emp-004",
    name: "최안전",
    phone: "01045678901",
    company: "GS동해전력",
    department: "안전관리팀",
    role: "employee" as const,
    isActive: true,
    emergencyRole: "safety_coordinator",
    emergencyRoleDescription: "",
    emergencyDuty: "",
  },
  {
    id: "emp-005",
    name: "정운영",
    phone: "01056789012",
    company: "GS동해전력",
    department: "운영팀",
    role: "employee" as const,
    isActive: true,
    emergencyRoleDescription: "",
    emergencyDuty: "",
  },
  {
    id: "emp-006",
    name: "한정비",
    phone: "01067890123",
    company: "GS동해전력",
    department: "정비팀",
    role: "employee" as const,
    isActive: true,
    emergencyRoleDescription: "",
    emergencyDuty: "",
  },
]

const mockPartnerContacts = [
  {
    id: "partner-001",
    name: "김협력",
    phone: "01011112222",
    company: "한국전력기술",
    department: "발전설비팀",
    role: "partner" as const,
    isActive: true,
  },
  {
    id: "partner-002",
    name: "이정비",
    phone: "01033334444",
    company: "두산에너빌리티",
    department: "정비팀",
    role: "partner" as const,
    isActive: true,
  },
  {
    id: "partner-003",
    name: "박시공",
    phone: "01055556666",
    company: "현대건설",
    department: "시공팀",
    role: "partner" as const,
    isActive: true,
  },
]

async function fetchFromGoogleSheetsAPI(spreadsheetId: string, range = "A:Z", maxRetries = 2): Promise<string[][]> {
  if (!GOOGLE_SHEETS_API_KEY) {
    console.error("[v0] Google Sheets API key not configured")
    throw new Error("Google Sheets API key가 설정되지 않았습니다.")
  }

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`

      console.log(`[v0] Google Sheets API 호출 (시도 ${attempt}/${maxRetries}): ${spreadsheetId}`)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.log(`[v0] Google Sheets API 오류 ${response.status}: ${response.statusText}`)
        console.log(`[v0] 오류 상세: ${errorText}`)
        throw new Error(`Google Sheets API error: ${response.status} - ${errorText}`)
      }

      const data = (await response.json()) as { values?: string[][] }
      console.log(`[v0] API 응답 성공 (시도 ${attempt}): ${data.values?.length || 0}행`)

      return data.values || []
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`[v0] API 호출 실패 (시도 ${attempt}/${maxRetries}):`, lastError.message)

      if (attempt < maxRetries) {
        const delay = 1000 * attempt
        console.log(`[v0] ${delay}ms 후 재시도...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  console.error(`[v0] Google Sheets API 호출 ${maxRetries}번 모두 실패`)
  throw lastError || new Error("Google Sheets API 호출 실패")
}

function cleanPhoneNumber(phone: string): string {
  return phone.replace(/-/g, "")
}

export async function fetchEmployeeContactsFromSheet() {
  try {
    console.log("[v0] Google Sheets API로 임직원 데이터 가져오기")

    const rows = await fetchFromGoogleSheetsAPI(EMPLOYEE_SPREADSHEET_ID)

    if (rows.length <= 1) {
      console.log("[v0] 임직원 데이터가 없어 목업 데이터 사용")
      return mockEmployeeContacts
    }

    console.log("[v0] ===== Google Sheets 원본 데이터 상세 분석 =====")
    console.log("[v0] 헤더 행:", rows[0])
    console.log("[v0] 총 데이터 행 수:", rows.length - 1)

    console.log("[v0] ===== 83-88행 데이터 상세 확인 =====")
    for (let i = 82; i <= 87; i++) {
      if (rows[i]) {
        console.log(`[v0] 행 ${i + 1}:`, {
          "A열(직책)": rows[i][0],
          "B열(이름)": rows[i][1],
          "C열(전화번호)": rows[i][2],
          "D열(역할)": rows[i][3],
          "E열(임무)": rows[i][4],
        })
      } else {
        console.log(`[v0] 행 ${i + 1}: 데이터 없음`)
      }
    }
    console.log("[v0] ==========================================")

    console.log("[v0] 첫 5개 데이터 행 (A~E열):")
    rows.slice(1, 6).forEach((row: string[], index: number) => {
      console.log(`[v0] 행 ${index + 2}:`, {
        "A열(직책)": row[0],
        "B열(이름)": row[1],
        "C열(전화번호)": row[2],
        "D열(역할)": row[3],
        "E열(임무)": row[4],
      })
    })

    const employees = rows
      .slice(1) // 헤더 제외
      .map((row: string[], index: number) => {
        const employee = {
          id: `emp-${String(index + 1).padStart(3, "0")}`,
          name: row[1] || "", // B열: 이름
          phone: cleanPhoneNumber(row[2] || ""), // C열: 전화번호
          company: "GS동해전력",
          department: row[0] || "", // A열: 직책/소속
          role: "employee" as const,
          isActive: true,
          emergencyRoleDescription: row[3] || "", // D열: 역할
          emergencyDuty: row[4] || "", // E열: 임무
          emergencyRole: row[0]?.includes("비상대응팀장")
            ? "emergency_contact_leader"
            : row[0]?.includes("발전파트장")
              ? "field_response_leader"
              : row[0]?.includes("대표이사")
                ? "commander"
                : row[0]?.includes("안전관리")
                  ? "safety_coordinator"
                  : undefined,
        }

        if (employee.name === "이명주" || employee.name === "황병소" || employee.name === "권혁만") {
          console.log(`[v0] ★★★ ${employee.name} 데이터 상세:`)
          console.log(`[v0]   - 직책(A열): ${row[0]}`)
          console.log(`[v0]   - 이름(B열): ${row[1]}`)
          console.log(`[v0]   - 전화번호(C열): ${row[2]}`)
          console.log(`[v0]   - 역할(D열): "${row[3] || "(비어있음)"}"`)
          console.log(`[v0]   - 임무(E열): "${row[4] || "(비어있음)"}"`)
          console.log(`[v0]   - emergencyRoleDescription: "${employee.emergencyRoleDescription}"`)
          console.log(`[v0]   - emergencyDuty: "${employee.emergencyDuty}"`)
        }

        return employee
      })
      .filter((emp: Employee) => emp.name && emp.phone)

    console.log(`[v0] ${employees.length}명의 임직원 데이터를 가져왔습니다`)

    const withRoleDuty = employees.filter((e: Employee) => e.emergencyRoleDescription || e.emergencyDuty)
    console.log(`[v0] 역할/임무 정보가 있는 임직원: ${withRoleDuty.length}명`)

    console.log("[v0] 역할/임무가 있는 임직원 목록:")
    withRoleDuty.slice(0, 10).forEach((emp: Employee) => {
      console.log(`[v0]   - ${emp.name}: 역할="${emp.emergencyRoleDescription}", 임무="${emp.emergencyDuty}"`)
    })

    return employees.length > 0 ? employees : mockEmployeeContacts
  } catch (error) {
    console.error("[v0] 임직원 데이터 가져오기 실패:", error)
    return mockEmployeeContacts
  }
}

export async function fetchPartnerContactsFromSheet() {
  try {
    console.log("[v0] Google Sheets API로 협력업체 데이터 가져오기")

    const rows = await fetchFromGoogleSheetsAPI(PARTNER_SPREADSHEET_ID)

    if (rows.length <= 1) {
      console.log("[v0] 협력업체 데이터가 없어 목업 데이터 사용")
      return mockPartnerContacts
    }

    const partners = rows
      .slice(1) // 헤더 제외
      .map((row: string[], index: number) => ({
        id: `partner-${String(index + 1).padStart(3, "0")}`,
        name: row[3] || "", // 이름을 D열(row[3])에서 가져오도록 변경
        phone: cleanPhoneNumber(row[4] || ""), // 전화번호에서 하이픈 제거
        company: row[0] || "", // 회사명을 A열(row[0])에서 가져오도록 변경
        department: row[1] || "", // 소속팀을 B열(row[1])에서 가져오도록 변경
        role: "partner" as const,
        isActive: row[5] !== "비활성" && row[5] !== "inactive",
      }))
      .filter((partner: Partner) => partner.name && partner.phone)

    console.log(`[v0] ${partners.length}명의 협력업체 담당자 데이터를 가져왔습니다`)
    return partners.length > 0 ? partners : mockPartnerContacts
  } catch (error) {
    console.error("[v0] 협력업체 데이터 가져오기 실패:", error)
    return mockPartnerContacts
  }
}

export async function fetchVisitorsFromSheet() {
  try {
    console.log("[v0] Google Sheets API로 방문자 데이터 가져오기")

    const rows = await fetchFromGoogleSheetsAPI(VISITOR_SPREADSHEET_ID)

    if (rows.length <= 1) {
      console.log("[v0] 방문자 데이터가 없어 목업 데이터 사용")
      return mockVisitorContacts.filter((v) => v.isActive)
    }

    const visitors = rows
      .slice(1) // 헤더 제외
      .map((row: string[], index: number) => ({
        id: `visitor-${String(index + 1).padStart(3, "0")}`,
        name: row[0] || "",
        phone: cleanPhoneNumber(row[1] || ""), // 전화번호에서 하이픈 제거
        company: row[2] || "",
        department: row[3] || "",
        role: "visitor" as const,
        isActive: row[4] === "입장",
        status: row[4] || "", // 상태 정보 추가
      }))
      .filter((visitor: Visitor) => visitor.name && visitor.phone && visitor.status === "입장")

    console.log(`[v0] ${visitors.length}명의 입장 상태 방문자 데이터를 가져왔습니다`)
    return visitors.length > 0 ? visitors : mockVisitorContacts.filter((v) => v.isActive)
  } catch (error) {
    console.error("[v0] 방문자 데이터 가져오기 실패:", error)
    return mockVisitorContacts.filter((v) => v.isActive)
  }
}

export function getProjectId(): string {
  return "gs-donghae-power-alert"
}

export function extractSpreadsheetId(url: string): string | null {
  const patterns = [/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/, /^([a-zA-Z0-9-_]+)$/]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

export async function testSheetConnection(spreadsheetId: string) {
  try {
    console.log("[v0] Google Sheets API 연결 테스트:", spreadsheetId)

    const rows = await fetchFromGoogleSheetsAPI(spreadsheetId, "A1:Z1")

    return {
      success: true,
      rowCount: rows.length,
      columnCount: rows[0]?.length || 0,
      headers: rows[0] || [],
    }
  } catch (error) {
    console.error("[v0] Google Sheets API 연결 테스트 실패:", error)
    return {
      success: false,
      message: "연결 테스트 실패",
    }
  }
}

export async function getEmployeeContacts() {
  try {
    const employees = await fetchEmployeeContactsFromSheet()
    const partners = await fetchPartnerContactsFromSheet()
    const visitors = await fetchVisitorsFromSheet()

    return [...employees, ...partners, ...visitors].map((contact) => ({
      name: contact.name,
      phone: contact.phone,
      company: contact.company,
      team: contact.department,
      position: contact.department,
      emergencyRole: (contact as Employee).emergencyRoleDescription || "",
      emergencyDuty: (contact as Employee).emergencyDuty || "",
      isActive: contact.isActive,
    }))
  } catch (error) {
    console.error("[v0] getEmployeeContacts 실패:", error)
    return []
  }
}
