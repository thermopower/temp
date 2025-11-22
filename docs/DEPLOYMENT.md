# 배포 가이드 (Deployment Guide)

## 📋 목차
- [환경 설정](#환경-설정)
- [Google Sheets API 설정](#google-sheets-api-설정)
- [SMS 서비스 설정](#sms-서비스-설정)
- [빌드 및 배포](#빌드-및-배포)
- [환경별 설정](#환경별-설정)

---

## 환경 설정

### 필수 환경 변수
`.env.local` 파일을 프로젝트 루트에 생성하고 다음 변수들을 설정하세요:

```bash
# Google Sheets API
GOOGLE_SHEETS_API_KEY=your_google_api_key_here
EMPLOYEE_SPREADSHEET_ID=your_employee_sheet_id
PARTNER_SPREADSHEET_ID=your_partner_sheet_id
VISITOR_SPREADSHEET_ID=your_visitor_sheet_id

# SMS 서비스 (CoolSMS 등)
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret
SMS_SENDER_PHONE=01012345678

# 기상 정보 API
WEATHER_API_KEY=your_openweather_api_key

# 관리자 인증
ADMIN_PASSWORD=your_secure_password

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Google Sheets API 설정

### 1. Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **API 및 서비스 > 라이브러리** 이동
4. "Google Sheets API" 검색 및 활성화

### 2. API 키 생성
1. **API 및 서비스 > 사용자 인증 정보** 이동
2. **사용자 인증 정보 만들기 > API 키** 선택
3. 생성된 API 키를 `.env.local`의 `GOOGLE_SHEETS_API_KEY`에 입력

### 3. Google Sheets 준비
각 시트는 다음 형식을 따라야 합니다:

#### 임직원 시트 (Employee Sheet)
| A열 (소속팀) | B열 (이름) | C열 (전화번호) | D열 (역할) | E열 (임무) |
|------------|----------|-------------|----------|----------|
| 안전팀 | 홍길동 | 010-1234-5678 | 현장지휘 | 초기 대응 총괄 |

#### 협력사 시트 (Partner Sheet)
| A열 (회사명) | B열 (소속팀) | C열 (빈칸) | D열 (이름) | E열 (전화번호) |
|------------|------------|-----------|----------|-------------|
| 오르비스 | 정비팀 | | 김철수 | 010-2345-6789 |

#### 방문자 시트 (Visitor Sheet)
| A열 (이름) | B열 (전화번호) | C열 (소속) |
|----------|-------------|----------|
| 이영희 | 010-3456-7890 | 한전KPS |

### 4. 시트 공유 설정
각 Google Sheets를 **"링크가 있는 모든 사용자"**로 공유 설정하거나, 서비스 계정을 사용하는 경우 해당 계정에 뷰어 권한을 부여하세요.

---

## SMS 서비스 설정

### CoolSMS 설정 예시
1. [CoolSMS](https://www.coolsms.co.kr/) 가입
2. API Key 및 API Secret 발급
3. 발신번호 등록 및 승인
4. `.env.local`에 인증 정보 입력

```bash
SMS_API_KEY=your_coolsms_api_key
SMS_API_SECRET=your_coolsms_api_secret
SMS_SENDER_PHONE=01012345678
```

---

## 빌드 및 배포

### 로컬 개발 서버 실행
```bash
npm install
npm run dev
```
- 개발 서버: http://localhost:3000

### 프로덕션 빌드
```bash
npm run build
npm start
```

### Vercel 배포
1. [Vercel](https://vercel.com/) 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - Vercel 대시보드 > Settings > Environment Variables
   - `.env.local`의 모든 변수를 입력
4. 자동 배포 완료

### Docker 배포 (선택)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t gs-emergency-system .
docker run -p 3000:3000 --env-file .env.local gs-emergency-system
```

---

## 환경별 설정

### 개발 환경 (Development)
- `.env.local` 사용
- Hot reload 활성화
- 상세 로그 출력

### 스테이징 환경 (Staging)
- `.env.staging` 사용
- 테스트용 SMS 발송 (제한된 수신자)
- 실제 데이터와 유사한 테스트 데이터 사용

### 프로덕션 환경 (Production)
- `.env.production` 사용
- 실제 SMS 발송
- 에러 로깅 및 모니터링 활성화
- HTTPS 필수

---

## 보안 체크리스트

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 관리자 비밀번호가 강력한지 확인
- [ ] Google Sheets API 키에 IP 제한 설정 (선택)
- [ ] SMS API 키가 안전하게 관리되는지 확인
- [ ] HTTPS 적용 (프로덕션)
- [ ] CORS 설정 확인

---

## 모니터링 및 유지보수

### 로그 확인
```bash
# 개발 환경
npm run dev

# 프로덕션 환경 (PM2 사용 시)
pm2 logs gs-emergency-system
```

### 정기 점검 항목
- [ ] Google Sheets 연동 상태 확인 (주 1회)
- [ ] SMS 발송 테스트 (월 1회)
- [ ] 연락처 데이터 최신화 확인 (주 1회)
- [ ] 시스템 응답 시간 모니터링
- [ ] 디스크 용량 확인

---

## 문제 해결 (Troubleshooting)

### Google Sheets API 오류
**증상**: "API key not valid" 오류
**해결**: 
1. API 키가 올바른지 확인
2. Google Sheets API가 활성화되어 있는지 확인
3. 시트 공유 설정 확인

### SMS 발송 실패
**증상**: SMS가 발송되지 않음
**해결**:
1. SMS API 인증 정보 확인
2. 발신번호 등록 상태 확인
3. API 잔액 확인

### 빌드 오류
**증상**: `npm run build` 실패
**해결**:
1. `node_modules` 삭제 후 `npm install` 재실행
2. Node.js 버전 확인 (18 이상 권장)
3. TypeScript 타입 오류 확인
