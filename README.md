# GS 동해전력 비상대응 시스템

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

화학사고 및 비상상황 발생 시 신속한 대응과 전파를 위한 **엔터프라이즈급 비상대응 시스템**입니다.

## ✨ 주요 기능

- 🚨 **실시간 사고 신고 및 접수**: 모바일/데스크톱 웹 인터페이스를 통한 즉각적인 사고 보고
- 📊 **자동 경보 단계 판정**: 사고 범위, 인명피해, 자체조치 가능 여부 등을 기반으로 백색/청색/황색/적색 경보 자동 판정
- 📱 **대량 SMS 자동 발송**: 승인 즉시 전 직원 및 협력사에 상황 전파 (기상 정보 및 대피소 포함)
- 👥 **Google Sheets 연동 명단 관리**: 임직원, 협력사, 방문자 명단을 Google Sheets로 실시간 관리
- 🌤️ **스마트 대피소 추천**: 기상 정보(풍향, 풍속)를 분석하여 최적의 대피 장소 제안
- 📋 **실시간 상황판**: 사고 현황, 대응 상태, 조치 결과를 한눈에 확인

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn
- Google Sheets API 키
- SMS 발송 서비스 계정 (CoolSMS 등)

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd <project-directory>

# 의존성 설치
npm install --legacy-peer-deps

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 필수 환경 변수를 입력하세요

# 개발 서버 실행
npm run dev
```

개발 서버가 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 📚 문서

- **[개발 문서](./docs/DEVELOPMENT.md)**: 아키텍처, 기술 스택, 유즈케이스
- **[API 레퍼런스](./docs/API_REFERENCE.md)**: REST API 엔드포인트 및 데이터 모델
- **[배포 가이드](./docs/DEPLOYMENT.md)**: 환경 설정, 빌드, 배포 방법

## 🏗️ 프로젝트 구조

```
.
├── app/                      # Next.js App Router 페이지
│   ├── api/                  # API Routes
│   │   ├── incidents/        # 사고 관리 API
│   │   ├── contacts/         # 연락처 조회 API
│   │   └── auth/             # 인증 API
│   ├── status/               # 사고 현황 관리 페이지
│   └── contacts/             # 명단 관리 페이지
├── core/                     # 핵심 비즈니스 로직 (Layered Architecture)
│   ├── domain/               # 도메인 엔티티 및 Zod 스키마
│   ├── repositories/         # 데이터 접근 계층
│   └── services/             # 비즈니스 로직 계층
├── components/               # React 컴포넌트
├── lib/                      # 유틸리티 및 헬퍼 함수
├── hooks/                    # Custom React Hooks
└── docs/                     # 프로젝트 문서
```

## 🛠️ 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **React 19**
- **TypeScript** (Strict Mode)
- **Tailwind CSS v4**
- **Radix UI** (Accessible Components)

### Backend
- **Next.js API Routes**
- **Zod** (Runtime Validation)
- **Layered Architecture** (Domain, Repository, Service)

### External Services
- **Google Sheets API** (연락처 데이터베이스)
- **SMS API** (대량 문자 발송)
- **OpenWeatherMap API** (기상 정보)

## 🎯 주요 유즈케이스

### 1. 화학물질 누출 신고
```
현장 발견자 → 모바일 웹 접속 → 위치/상황 입력 → 신고
→ 시스템: 사고 접수 → 파트장에게 승인 요청 알림
```

### 2. 사고 승인 및 비상 발령
```
안전 파트장 → 신고 내역 확인 → 심각도 판단 → 승인
→ 시스템: 경보 발령 → 전 직원 SMS 발송 (기상 정보 + 대피소)
```

### 3. 조치 완료 및 상황 종료
```
담당자 → 조치 내용 입력 → 완료 처리
→ 시스템: 상황판 업데이트 → 종료 알림 발송
```

## 🔐 보안

- 관리자 페이지는 비밀번호 인증 필요
- 환경 변수를 통한 민감 정보 관리
- Google Sheets API 키 IP 제한 권장
- HTTPS 적용 (프로덕션)

## 📝 라이선스

이 프로젝트는 GS 동해전력의 내부 시스템으로, 외부 배포 및 사용이 제한됩니다.

## 🤝 기여

내부 개발팀만 접근 가능합니다.

## 📞 문의

- **개발팀**: [연락처 정보]
- **시스템 관리자**: [연락처 정보]

---

**© 2025 GS 동해전력. All rights reserved.**
