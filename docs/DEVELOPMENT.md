# GS 동해전력 비상대응 시스템 개발 문서

## 1. 프로젝트 개요
본 프로젝트는 GS 동해전력의 화학사고 및 비상상황 발생 시 신속한 대응과 전파를 위한 **비상대응 시스템(Emergency Response System)**입니다. 사고 신고, 경보 단계 자동 판정, SMS 자동 발송, 실시간 현황 공유 기능을 제공합니다.

## 2. 기술 스택 (Tech Stack)

### Core Framework
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 (CSS Variables, Oklch colors)
- **State Management**: React Hooks (Client), In-Memory Repository (Server)

### Backend & Services
- **Architecture**: Layered Architecture (Domain, Repository, Service)
- **Validation**: Zod (Runtime Type Checking)
- **External APIs**:
  - **Google Sheets API**: 임직원/협력사 연락처 데이터베이스 역할
  - **CoolSMS (추정)**: SMS/LMS 발송
  - **OpenWeatherMap (추정)**: 기상 정보 연동

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier

## 3. 아키텍처 및 디자인 패턴

본 프로젝트는 **엔터프라이즈급 레이어드 아키텍처(Layered Architecture)**를 따르며, **함수형 프로그래밍(Functional Programming)** 원칙을 지향합니다.

### 3.1 디렉토리 구조 (`core/`)
```
core/
├── domain/           # 도메인 엔티티, DTO, Zod 스키마 (순수 데이터 구조)
│   └── incident.ts
├── repositories/     # 데이터 접근 계층 (Interface & Implementation)
│   ├── incident.repository.ts
│   └── memory-incident.repo.ts
└── services/         # 비즈니스 로직 계층
    ├── incident.service.ts       # 사고 관리 로직 (신고, 승인, 종료)
    └── notification.service.ts   # 알림 로직 (SMS 구성 및 발송)
```

### 3.2 주요 디자인 원칙
1.  **불변성 (Immutability)**:
    - 모든 데이터 변경은 기존 객체를 수정(Mutation)하지 않고, 새로운 객체를 생성(Copy)하여 반환합니다.
    - `let` 대신 `const`를 사용하며, `map`, `filter`, `reduce` 등의 고차 함수를 활용합니다.
2.  **의존성 주입 (Dependency Injection)**:
    - `lib/container.ts`를 통해 서비스와 리포지토리의 인스턴스를 관리하고 주입합니다.
    - 이를 통해 테스트 용이성과 결합도 감소를 달성합니다.
3.  **일급 함수 (First-class Functions)**:
    - 비즈니스 로직(예: 경보 단계 계산, 메시지 구성)을 독립적인 순수 함수로 분리하여 관리합니다.

## 4. 주요 기능 및 동작 방식 (Operational Mechanism)

### 4.1 사고 신고 및 접수 (Incident Reporting)
1.  사용자가 웹 폼을 통해 사고 정보를 입력합니다.
2.  `IncidentService.reportIncident`가 호출됩니다.
3.  **경보 단계 자동 판정**: `determineAlertLevel` 함수가 입력된 심각도와 알람 기준(범위, 인명피해 등)을 점수화하여 백색/청색/황색/적색 경보를 판정합니다.
4.  사고 정보가 `MemoryIncidentRepository`에 저장됩니다 (초기 상태: `pending_approval`).

### 4.2 사고 승인 및 전파 (Approval & Notification)
1.  관리자(파트장 등)가 사고를 승인합니다.
2.  `IncidentService.approveIncident`가 호출됩니다.
3.  **SMS 발송**:
    - `NotificationService`가 Google Sheets에서 최신 연락처를 가져옵니다.
    - 기상 정보(풍향, 풍속)를 조회하여 스마트 대피 장소를 추천합니다.
    - `MessageBuilder` 파이프라인을 통해 상황에 맞는 메시지를 생성합니다.
    - 황색/적색 경보 시 전 직원 및 협력사에 문자를 발송합니다.

### 4.3 연락처 관리 (Contact Management)
- **Google Sheets 연동**: 임직원, 협력사, 방문자 명단을 Google Sheets에서 관리하며, 시스템은 이를 실시간으로 읽어옵니다 (`lib/google-sheets.ts`).
- **캐싱 및 갱신**: 성능을 위해 일정 주기(예: 10분)로 데이터를 갱신하거나 캐싱 전략을 사용합니다.

## 5. 유즈케이스 (Use Cases)

### UC-01: 화학물질 누출 신고
- **Actor**: 최초 발견자
- **Scenario**: 현장에서 암모니아 누출 발견 -> 모바일 웹 접속 -> 위치 및 상황 입력 -> 신고 버튼 클릭
- **System**: 사고 접수 -> 파트장에게 승인 요청 알림

### UC-02: 사고 승인 및 비상 발령
- **Actor**: 안전 파트장 (관리자)
- **Scenario**: 신고 내역 확인 -> 심각도 판단(시스템 제안 확인) -> 승인 버튼 클릭
- **System**: 경보 발령 -> 전 직원 SMS 발송 (기상 정보 및 대피소 포함) -> 상황판 업데이트

### UC-03: 훈련 상황 종료
- **Actor**: 훈련 담당자
- **Scenario**: 비상 대응 훈련 종료 시 '훈련 종료' 처리
- **System**: 훈련 종료 알림 SMS 발송 -> 상황판 '조치 완료' 상태로 변경

## 6. 개발 가이드 (For Coding Agents)

- **상태 변경**: 모든 상태 변경 로직은 `IncidentService` 내의 `updateIncident` 헬퍼를 통해 이루어져야 합니다.
- **SMS 메시지 수정**: `core/services/notification.service.ts` 내의 `alertMessageBuilder` 파이프라인에 새로운 빌더를 추가하거나 수정하십시오.
- **데이터 스키마 변경**: `core/domain/incident.ts`의 Zod 스키마를 먼저 수정한 후, 타입 추론을 통해 컴파일 에러를 잡으십시오.
- **환경 변수**: `.env.local` 파일에 Google Sheets API 키와 Spreadsheet ID가 올바르게 설정되어 있어야 합니다.
