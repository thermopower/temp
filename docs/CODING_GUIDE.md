# 코딩 가이드 (Coding Guidelines)

## 📋 목차
- [코드 스타일](#코드-스타일)
- [함수형 프로그래밍 원칙](#함수형-프로그래밍-원칙)
- [아키텍처 패턴](#아키텍처-패턴)
- [타입 안정성](#타입-안정성)
- [에러 처리](#에러-처리)
- [테스트 작성](#테스트-작성)

---

## 코드 스타일

### 네이밍 컨벤션
```typescript
// ✅ Good
const incidentService = new IncidentService();
const MAX_RETRY_COUNT = 3;
type AlertLevel = "white" | "blue" | "yellow" | "red";

// ❌ Bad
const IncidentSvc = new IncidentService();
const maxRetryCount = 3; // 상수는 대문자
type alertLevel = "white" | "blue"; // 타입은 PascalCase
```

### 파일 구조
```typescript
// 1. Imports (외부 라이브러리 먼저, 내부 모듈 나중)
import { z } from "zod";
import { IncidentRepository } from "../repositories/incident.repository";

// 2. Types & Interfaces
interface MessageContext {
  weather?: WeatherData;
  evacuation?: EvacuationData;
}

// 3. Constants
const RETRY_DELAY_MS = 1000;

// 4. Helper Functions
const formatTimestamp = (date: Date): string => {
  // ...
};

// 5. Main Class/Component
export class NotificationService {
  // ...
}
```

---

## 함수형 프로그래밍 원칙

### 1. 불변성 (Immutability)
```typescript
// ✅ Good - 새 객체 생성
const updateIncident = (incident: Incident): Incident => {
  return {
    ...incident,
    status: "active",
    approvedAt: new Date()
  };
};

// ❌ Bad - 직접 수정
const updateIncident = (incident: Incident): Incident => {
  incident.status = "active"; // Mutation!
  incident.approvedAt = new Date();
  return incident;
};
```

### 2. 순수 함수 (Pure Functions)
```typescript
// ✅ Good - 순수 함수 (같은 입력 → 같은 출력, 부수 효과 없음)
const calculateScore = (criteria: AlarmCriteria): number => {
  const scores = [
    criteria.scope === "사업장 외부" ? 2 : 0,
    criteria.casualties === "있음" ? 2 : 0,
  ];
  return scores.reduce((sum, score) => sum + score, 0);
};

// ❌ Bad - 외부 상태에 의존
let globalScore = 0;
const calculateScore = (criteria: AlarmCriteria): number => {
  globalScore += criteria.scope === "사업장 외부" ? 2 : 0; // 부수 효과!
  return globalScore;
};
```

### 3. 고차 함수 활용
```typescript
// ✅ Good - map/filter/reduce 사용
const activeContacts = contacts.filter(c => c.isActive);
const phoneNumbers = activeContacts.map(c => c.phone);
const totalScore = scores.reduce((sum, s) => sum + s, 0);

// ❌ Bad - 전통적인 루프
const activeContacts = [];
for (let i = 0; i < contacts.length; i++) {
  if (contacts[i].isActive) {
    activeContacts.push(contacts[i]);
  }
}
```

### 4. 일급 함수 (First-class Functions)
```typescript
// ✅ Good - 함수를 값으로 전달
type MessagePartBuilder = (incident: Incident, context: MessageContext) => string | null;

const buildHeader: MessagePartBuilder = (incident, context) => {
  return `[비상상황] ${incident.alertLevel} 발령`;
};

const composeMessage = (builders: MessagePartBuilder[]): MessageBuilder => {
  return (incident, context) => {
    return builders
      .map(builder => builder(incident, context))
      .filter((part): part is string => part !== null)
      .join("\n\n");
  };
};
```

---

## 아키텍처 패턴

### Layered Architecture
```
┌─────────────────────────────────────┐
│         Presentation Layer          │  ← API Routes (app/api/)
│  (API Routes, React Components)     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Service Layer               │  ← Business Logic (core/services/)
│  (IncidentService, NotificationSvc) │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Repository Layer            │  ← Data Access (core/repositories/)
│  (IncidentRepository)               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Domain Layer                │  ← Entities & DTOs (core/domain/)
│  (Incident, Contact)                │
└─────────────────────────────────────┘
```

### 의존성 방향
- **상위 계층 → 하위 계층** 의존만 허용
- **하위 계층 → 상위 계층** 의존 금지
- 인터페이스를 통한 의존성 역전 (Dependency Inversion)

```typescript
// ✅ Good - Service가 Repository 인터페이스에 의존
export class IncidentService {
  constructor(
    private repo: IncidentRepository, // 인터페이스
    private notificationService: NotificationService
  ) {}
}

// ❌ Bad - Service가 구체 구현에 의존
export class IncidentService {
  constructor(
    private repo: MemoryIncidentRepository, // 구체 클래스
  ) {}
}
```

---

## 타입 안정성

### Zod를 활용한 런타임 검증
```typescript
// 1. Zod 스키마 정의
export const IncidentSchema = z.object({
  id: z.string(),
  location: z.string(),
  type: z.string(),
  alertLevel: z.enum(["white", "blue", "yellow", "red"]),
  reportedAt: z.coerce.date(),
});

// 2. 타입 추론
export type Incident = z.infer<typeof IncidentSchema>;

// 3. 런타임 검증
const validateIncident = (data: unknown): Incident => {
  return IncidentSchema.parse(data); // 실패 시 ZodError 발생
};
```

### 타입 가드 활용
```typescript
// ✅ Good - 타입 가드로 안전하게 처리
const processIncident = (data: unknown) => {
  const result = IncidentSchema.safeParse(data);
  if (!result.success) {
    console.error("검증 실패:", result.error);
    return;
  }
  const incident: Incident = result.data; // 타입 안전
  // ...
};
```

---

## 에러 처리

### 계층별 에러 처리 전략

#### 1. Domain Layer
```typescript
// 도메인 규칙 위반 시 명확한 에러 발생
class InvalidAlertLevelError extends Error {
  constructor(level: string) {
    super(`유효하지 않은 경보 단계: ${level}`);
    this.name = "InvalidAlertLevelError";
  }
}
```

#### 2. Service Layer
```typescript
// 비즈니스 로직 에러를 포착하고 적절히 처리
async approveIncident(id: string, approverName: string): Promise<Incident> {
  const incident = await this.repo.findById(id);
  if (!incident) {
    throw new Error("사고를 찾을 수 없습니다.");
  }
  
  try {
    // SMS 발송 등의 외부 서비스 호출
    await this.notificationService.sendAlert(incident);
  } catch (error) {
    console.error("[IncidentService] SMS 발송 실패:", error);
    // 에러를 로깅하되, 승인 자체는 계속 진행
  }
  
  return updatedIncident;
}
```

#### 3. API Layer
```typescript
// HTTP 상태 코드와 함께 클라이언트에 에러 반환
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const incident = await incidentService.reportIncident(body);
    return NextResponse.json({ success: true, incident });
  } catch (error) {
    console.error("[API] 사고 신고 실패:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "알 수 없는 오류" },
      { status: 500 }
    );
  }
}
```

---

## 테스트 작성

### 단위 테스트 (Unit Test)
```typescript
// core/services/__tests__/incident.service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { IncidentService } from '../incident.service';
import { MockIncidentRepository } from '../../repositories/__mocks__/incident.repository';

describe('IncidentService', () => {
  let service: IncidentService;
  let mockRepo: MockIncidentRepository;

  beforeEach(() => {
    mockRepo = new MockIncidentRepository();
    service = new IncidentService(mockRepo, mockNotificationService);
  });

  it('should determine alert level correctly', () => {
    const level = service['determineAlertLevel']('major', {
      scope: '사업장 외부',
      casualties: '있음',
      evacuation: '필요',
      selfResponse: '불가능'
    });
    
    expect(level).toBe('red');
  });
});
```

### 통합 테스트 (Integration Test)
```typescript
// app/api/incidents/__tests__/route.test.ts
import { describe, it, expect } from 'vitest';
import { POST } from '../route';

describe('POST /api/incidents', () => {
  it('should create a new incident', async () => {
    const request = new Request('http://localhost:3000/api/incidents', {
      method: 'POST',
      body: JSON.stringify({
        location: '테스트 위치',
        type: '테스트 사고',
        // ...
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.incident).toBeDefined();
  });
});
```

---

## 주석 작성 가이드

### JSDoc 활용
```typescript
/**
 * 사고 승인 및 SMS 발송
 * @param id - 사고 ID
 * @param approverName - 승인자 이름
 * @param updateData - 승인 시 수정할 사고 정보 (선택)
 * @returns 승인된 사고 객체
 * @throws {Error} 사고를 찾을 수 없는 경우
 */
async approveIncident(
  id: string,
  approverName: string,
  updateData?: Partial<Incident>
): Promise<Incident> {
  // ...
}
```

### 복잡한 로직에 설명 추가
```typescript
// 경보 단계 점수 계산
// - 사고 범위: 사업장 외부(2점), 내부(1점)
// - 인명 피해: 있음(2점)
// - 주민 대피: 필요(2점)
// - 자체조치: 불가능(2점), 가능(1점)
const totalScore = this.calculateScore(alarmCriteria, this.alertScoreRules);
```

---

## 커밋 메시지 컨벤션

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `test`: 테스트 추가/수정
- `chore`: 빌드 설정 등

### 예시
```
feat(incident): 경보 단계 자동 판정 기능 추가

사고 범위, 인명피해, 자체조치 가능 여부를 기반으로
백색/청색/황색/적색 경보를 자동으로 판정하는 로직 구현

Closes #123
```

---

## 코드 리뷰 체크리스트

- [ ] 불변성이 유지되는가? (`const` 사용, spread operator 활용)
- [ ] 순수 함수로 작성되었는가?
- [ ] 타입 안정성이 보장되는가? (Zod 검증, TypeScript strict mode)
- [ ] 에러 처리가 적절한가?
- [ ] 테스트가 작성되었는가?
- [ ] 주석이 필요한 복잡한 로직에 설명이 있는가?
- [ ] 레이어 간 의존성 방향이 올바른가?
- [ ] 한글 주석 및 에러 메시지 사용
