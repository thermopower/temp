# SMS 테스트 가이드

## 📋 목차
- [테스트 API 사용법](#테스트-api-사용법)
- [테스트 시나리오](#테스트-시나리오)
- [안전 수칙](#안전-수칙)

---

## 테스트 API 사용법

### 엔드포인트
```
POST http://localhost:3000/api/test/sms?mode={mode}
```

### 모드 종류

#### 1. **Preview 모드** (메시지 미리보기)
실제 SMS를 발송하지 않고 메시지만 생성합니다.

**요청 예시:**
```bash
curl -X POST "http://localhost:3000/api/test/sms?mode=preview" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "암모니아 저장탱크 #2",
    "type": "화학물질 누출",
    "description": "탱크 하단부 누출 확인",
    "alertLevel": "yellow",
    "reportedBy": "홍길동"
  }'
```

**응답 예시:**
```json
{
  "success": true,
  "mode": "preview",
  "message": "메시지 미리보기 생성 완료",
  "data": {
    "incident": { /* 사고 정보 */ },
    "recipientCount": 45,
    "sampleRecipients": [
      { "name": "김철수", "phone": "010-1234-5678", "role": "employee" }
    ],
    "messagePreview": "[훈련 상황] [GS동해전력 비상상황]\n🚨 황색경보 발령\n...",
    "weather": { /* 기상 정보 */ },
    "evacuation": { /* 대피소 정보 */ }
  }
}
```

#### 2. **Test 모드** (제한 발송)
지정된 테스트 전화번호로만 실제 SMS를 발송합니다.

**요청 예시:**
```bash
curl -X POST "http://localhost:3000/api/test/sms?mode=test" \
  -H "Content-Type: application/json" \
  -d '{
    "testPhones": ["010-1234-5678", "010-9999-8888"]
  }'
```

**응답 예시:**
```json
{
  "success": true,
  "mode": "test",
  "message": "2명에게 테스트 SMS 발송 완료",
  "results": [
    { "phone": "010-1234-5678", "success": true },
    { "phone": "010-9999-8888", "success": true }
  ]
}
```

#### 3. **Validate 모드** (시스템 검증)
연락처 조회, 기상 정보 API 등 모든 외부 서비스 연동 상태를 확인합니다.

**요청 예시:**
```bash
curl -X POST "http://localhost:3000/api/test/sms?mode=validate" \
  -H "Content-Type: application/json"
```

**응답 예시:**
```json
{
  "success": true,
  "mode": "validate",
  "message": "시스템 검증 완료",
  "validation": {
    "contacts": {
      "valid": true,
      "count": 45,
      "error": null
    },
    "weather": {
      "valid": true,
      "data": { /* 기상 정보 */ },
      "error": null
    },
    "incident": {
      "valid": true,
      "alertLevel": "yellow",
      "isTraining": true
    }
  }
}
```

---

## 테스트 시나리오

### 시나리오 1: 메시지 내용 확인
```bash
# 1. Preview 모드로 메시지 확인
curl -X POST "http://localhost:3000/api/test/sms?mode=preview" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "암모니아 저장탱크",
    "type": "화학물질 누출",
    "alertLevel": "yellow"
  }'

# 2. 응답에서 messagePreview 필드 확인
# 3. 메시지 내용이 적절한지 검토
```

### 시나리오 2: 소수 인원 테스트 발송
```bash
# 1. 본인 또는 테스트 담당자 번호로만 발송
curl -X POST "http://localhost:3000/api/test/sms?mode=test" \
  -H "Content-Type: application/json" \
  -d '{
    "testPhones": ["010-YOUR-NUMBER"]
  }'

# 2. 실제 SMS 수신 확인
# 3. 메시지 형식, 내용, 링크 작동 여부 확인
```

### 시나리오 3: 전체 시스템 검증
```bash
# 1. Validate 모드로 모든 외부 서비스 확인
curl -X POST "http://localhost:3000/api/test/sms?mode=validate"

# 2. 각 서비스의 valid 상태 확인
# - contacts.valid: Google Sheets 연동 상태
# - weather.valid: 기상 정보 API 상태
# - incident.valid: 사고 생성 로직 상태
```

### 시나리오 4: 다양한 경보 단계 테스트
```bash
# 백색 경보
curl -X POST "http://localhost:3000/api/test/sms?mode=preview" \
  -H "Content-Type: application/json" \
  -d '{"alertLevel": "white"}'

# 청색 경보
curl -X POST "http://localhost:3000/api/test/sms?mode=preview" \
  -H "Content-Type: application/json" \
  -d '{"alertLevel": "blue"}'

# 황색 경보
curl -X POST "http://localhost:3000/api/test/sms?mode=preview" \
  -H "Content-Type: application/json" \
  -d '{"alertLevel": "yellow"}'

# 적색 경보
curl -X POST "http://localhost:3000/api/test/sms?mode=preview" \
  -H "Content-Type: application/json" \
  -d '{"alertLevel": "red"}'
```

---

## 안전 수칙

### ⚠️ 주의사항

1. **Test 모드 사용 시**
   - 반드시 본인 또는 테스트 담당자의 번호만 사용하세요
   - 실제 직원 번호로 테스트하지 마세요
   - 테스트 메시지에는 `[테스트]` 표시가 포함됩니다

2. **Preview 모드 권장**
   - 처음에는 항상 Preview 모드로 메시지 내용을 확인하세요
   - 메시지 형식, 링크, 정보가 올바른지 검토하세요

3. **Validate 모드 활용**
   - 정기적으로 외부 서비스 연동 상태를 확인하세요
   - 배포 전 반드시 검증을 수행하세요

4. **실제 발송 전 체크리스트**
   - [ ] Preview 모드로 메시지 내용 확인
   - [ ] Test 모드로 본인에게 발송 테스트
   - [ ] Validate 모드로 시스템 상태 확인
   - [ ] Google Sheets 연락처 데이터 최신화 확인
   - [ ] SMS API 잔액 확인

---

## Postman 사용 예시

### Collection 설정
```json
{
  "info": {
    "name": "GS 동해전력 SMS 테스트",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Preview - 메시지 미리보기",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"location\": \"암모니아 저장탱크\",\n  \"type\": \"화학물질 누출\",\n  \"alertLevel\": \"yellow\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/test/sms?mode=preview",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "test", "sms"],
          "query": [
            {
              "key": "mode",
              "value": "preview"
            }
          ]
        }
      }
    }
  ]
}
```

---

## 브라우저 콘솔에서 테스트

```javascript
// Preview 모드
fetch('http://localhost:3000/api/test/sms?mode=preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: '암모니아 저장탱크',
    type: '화학물질 누출',
    alertLevel: 'yellow'
  })
})
.then(res => res.json())
.then(data => console.log('메시지 미리보기:', data.data.messagePreview));

// Validate 모드
fetch('http://localhost:3000/api/test/sms?mode=validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => console.log('시스템 검증:', data.validation));
```

---

## 문제 해결

### 연락처 조회 실패
```json
{
  "contacts": {
    "valid": false,
    "error": "API key not valid"
  }
}
```
**해결**: `.env.local`의 `GOOGLE_SHEETS_API_KEY` 확인

### 기상 정보 조회 실패
```json
{
  "weather": {
    "valid": false,
    "error": "API request failed"
  }
}
```
**해결**: 기상청 API 키 또는 네트워크 상태 확인

### SMS 발송 실패
```json
{
  "results": [
    { "phone": "010-1234-5678", "success": false, "error": "Invalid API key" }
  ]
}
```
**해결**: SMS API 인증 정보 확인
