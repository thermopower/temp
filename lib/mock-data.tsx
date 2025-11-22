import type { Contact, HazardousMaterial } from "./types"

//  Added missing exports for hazardousMaterialsInfo, locationOptions, and incidentTypeOptions
export const hazardousMaterialsInfo: Record<HazardousMaterial, {
  name: string
  concentration: string
  toxicRange: string
  purpose: string
}> = {
  ammonia: {
    name: "암모니아 (NH₃)",
    concentration: "99.8%",
    toxicRange: "반경 500m",
    purpose: "탈질설비 환원제"
  },
  hydrochloric_acid: {
    name: "염산 (HCl)",
    concentration: "35%",
    toxicRange: "반경 300m",
    purpose: "수처리 pH 조절제"
  },
  byproduct_fuel_oil: {
    name: "부생연료유",
    concentration: "혼합물",
    toxicRange: "반경 200m",
    purpose: "보일러 연료"
  },
  hydrogen: {
    name: "수소 (H₂)",
    concentration: "99.9%",
    toxicRange: "반경 100m",
    purpose: "발전기 냉각가스"
  }
}

export const locationOptions = [
  "암모니아 저장탱크(M-TK-O1A)",
  "암모니아 저장탱크(M-TK-01B)", 
  "복수탈염 염산 저장탱크",
  "복수탈염 가성소다 저장탱크",
  "보조연료유 저장탱크",
  "1호기 탈질설비(SCR)",
  "2호기 탈질설비(SCR)",
  "1,2호기 수소룸",
  "주제어동",
  "종합사무동",
  "하이드라자이드 저장탱크",
  "탈황폐수 염산 저장탱크",
  "발전폐수 염산 저정탱크",
  "탈황폐수 가성소다(알루민산소다) 저장탱크",
  "발전폐수 가성소다(알루민산소다) 저장탱크",
  "탈황폐수 약품하역장",
  "발전폐수 약품하역장",
  "수폐수 약품 주입탱크",
  "암모니아 주입탱크",
  "기타(위치 설정)"
]

export const incidentTypeOptions = [
  "화재",
  "폭발",
  "누출",
  "정전",
  "자연재해",
  "기타 비상상황"
]

