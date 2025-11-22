# API Reference

## 📋 목차
- [사고 관리 API](#사고-관리-api)
- [연락처 관리 API](#연락처-관리-api)
- [인증 API](#인증-api)

---

## 사고 관리 API

### `GET /api/incidents`
모든 사고 목록을 조회합니다.

**Response**
```json
{
  "success": true,
  "incidents": [
    {
      "id": "INC-1234567890",
      "location": "암모니아 저장탱크",
      "type": "화학물질 누출",
      "alertLevel": "yellow",
      "status": "active",
      "reportedAt": "2025-11-22T08:30:00.000Z",
      "reportedBy": "홍길동",
      "notificationsSent": 45,
      "contactsNotified": ["김철수", "이영희", ...]
    }
  ]
}
```

### `POST /api/incidents`
새로운 사고를 신고합니다.

**Request Body**
```json
{
  "location": "암모니아 저장탱크",
  "type": "화학물질 누출",
  "description": "탱크 하단부에서 암모니아 누출 확인",
  "reportedBy": "홍길동",
  "evacuationRequired": true,
  "alarmCriteria": {
    "scope": "사업장 외부",
    "selfResponse": "불가능",
    "casualties": "없음",
    "evacuation": "필요"
  },
  "reportDetails": {
    "reporterName": "홍길동",
    "reporterPhone": "010-1234-5678",
    "reporterCompany": "GS동해전력",
    "severity": "major",
    "timestamp": "2025-11-22T08:30:00.000Z"
  }
}
```

**Response**
```json
{
  "success": true,
  "incident": { /* 생성된 사고 객체 */ }
}
```

### `GET /api/incidents/[id]`
특정 사고의 상세 정보를 조회합니다.

**Response**
```json
{
  "success": true,
  "incident": { /* 사고 객체 */ }
}
```

### `POST /api/incidents/[id]/approve`
사고를 승인하고 SMS를 발송합니다.

**Request Body**
```json
{
  "approverName": "김파트장",
  "approverPhone": "010-9999-8888",
  "approverPosition": "안전파트장",
  "modifiedIncident": {
    "description": "수정된 사고 설명 (선택)"
  }
}
```

**Response**
```json
{
  "success": true,
  "incident": { /* 승인된 사고 객체 */ },
  "smsSent": true,
  "smsResult": {
    "sentCount": 45,
    "recipients": ["김철수", "이영희", ...]
  }
}
```

### `POST /api/incidents/[id]/complete-action`
사고 조치를 완료 처리합니다.

**Request Body**
```json
{
  "actionDetails": "누출 부위 차단 완료, 환기 실시",
  "completedBy": "안전파트장"
}
```

### `POST /api/incidents/[id]/end-training`
훈련 상황을 종료합니다.

**Request Body**
```json
{
  "endedBy": "훈련담당자"
}
```

### `DELETE /api/incidents/[id]`
사고 기록을 삭제합니다.

**Request Body**
```json
{
  "approverName": "김파트장",
  "approverPosition": "안전파트장"
}
```

---

## 연락처 관리 API

### `GET /api/contacts`
Google Sheets에서 모든 연락처를 조회합니다.

**Response**
```json
{
  "success": true,
  "contacts": [ /* 전체 연락처 배열 */ ],
  "breakdown": {
    "employees": [ /* GS동해전력 임직원 */ ],
    "partners": [ /* 협력업체 */ ],
    "visitors": [ /* 방문자 */ ]
  },
  "message": "총 150명 (임직원: 80명, 협력사: 60명, 방문자: 10명)"
}
```

---

## 인증 API

### `POST /api/auth/verify`
관리자 비밀번호를 확인합니다.

**Request Body**
```json
{
  "password": "admin_password"
}
```

**Response**
```json
{
  "success": true
}
```

---

## 데이터 모델

### Incident (사고)
```typescript
interface Incident {
  id: string;                    // 사고 ID (예: INC-1234567890)
  location: string;              // 사고 위치
  type: string;                  // 사고 유형
  hazardousMaterial?: string;    // 유해물질 (ammonia, hydrochloric_acid 등)
  description: string;           // 상황 설명
  reportedAt: Date;              // 신고 시각
  reportedBy: string;            // 신고자
  status: "pending_approval" | "active" | "resolved";
  alertLevel: "white" | "blue" | "yellow" | "red";
  notificationsSent: number;     // 발송된 SMS 수
  contactsNotified: string[];    // 알림 받은 인원 목록
  evacuationRequired: boolean;   // 대피 필요 여부
  
  // 승인 정보
  approvedBy?: string;
  approvedAt?: Date;
  
  // 조치 정보
  actionCompleted?: boolean;
  actionDetails?: string;
  actionCompletedBy?: string;
  actionCompletedAt?: Date;
  
  // 훈련 정보
  isTraining?: boolean;
  trainingEndedBy?: string;
  trainingEndedAt?: Date;
}
```

### Contact (연락처)
```typescript
interface Contact {
  id: string;
  name: string;
  phone: string;
  role: "employee" | "partner" | "visitor";
  company?: string;              // 회사명 (협력사, 방문자)
  department?: string;           // 부서/팀
  isActive: boolean;             // 활성 상태
  
  // 임직원 전용
  emergencyRoleDescription?: string;  // 비상 역할
  emergencyDuty?: string;             // 비상 임무
}
```
