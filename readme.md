# 🍔 키오스크 시스템

React + TypeScript + styled-components로 구현된 완전한 키오스크 시스템입니다. 사장님이 직접 메뉴를 관리하고, 고객이 음성으로도 주문할 수 있는 혁신적인 시스템입니다.

## ✨ 주요 기능

### 🔧 사장님 기능 (관리자 모드)

- **메뉴 관리**: 메뉴 추가, 수정, 삭제
- **카테고리 관리**: 카테고리 생성, 순서 조정
- **실시간 재고 관리**: 품절 처리
- **💾 데이터 영속성**: 브라우저 localStorage로 자동 저장
- **📝 실시간 피드백**: 성공/실패 메시지 표시
- **직관적인 관리 인터페이스**

### 👥 고객 기능

- **카테고리별 메뉴 탐색**: 깔끔한 UI로 메뉴 확인
- **장바구니 관리**: 수량 조절, 항목 삭제
- **🎤 음성 주문**: 말만으로 메뉴 선택 가능
- **💳 다양한 결제 방법**: 카드, 현금, 간편결제

### 🤖 음성 챗봇

- **한국어 음성 인식**: Web Speech API 활용
- **자연어 처리**: "치킨버거 2개 주문"과 같은 자연스러운 명령
- **음성 응답**: TTS로 친근한 응답
- **스마트 메뉴 추천**

## 🚀 시작하기

### 필요 조건

- Node.js 14 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 프로젝트 디렉토리로 이동
cd kiosk-system

# 패키지 설치
npm install

# 환경변수 설정 (선택사항)
# .env 파일을 생성하고 OpenAI API 키 설정
echo "REACT_APP_OPENAI_API_KEY=your_api_key_here" > .env

# 개발 서버 실행
npm start
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

### 🔧 OpenAI GPT API 설정 (고급 음성 분석)

키오스크는 기본 키워드 매칭과 OpenAI GPT를 이용한 고급 음성 분석 두 가지 모드를 지원합니다.

#### 기본 모드 (API 키 없이)

- 간단한 키워드 매칭으로 동작
- "치킨버거 주문", "콜라 추가" 등의 기본 명령 지원

#### 고급 모드 (OpenAI GPT API)

1. [OpenAI](https://platform.openai.com/)에서 API 키 발급
2. 프로젝트 루트에 `.env` 파일 생성:

```env
REACT_APP_OPENAI_API_KEY=your_actual_api_key_here
```

3. 앱 재시작
4. 복잡한 자연어 명령 지원:
   - "비프버거 두 개랑 콜라 한 잔, 그리고 감자튀김도 주문해줘"
   - "아까 주문한 치킨버거 빼고 비프버거로 바꿔줘"

**주의사항:**

- API 키는 절대 공개 저장소에 커밋하지 마세요
- .env 파일을 .gitignore에 추가하세요
- API 사용량에 따라 요금이 부과될 수 있습니다

## 🎯 사용법

### 고객 모드 (기본 화면)

1. **메뉴 탐색**

   - 카테고리 탭을 클릭해서 원하는 메뉴 카테고리 선택
   - 메뉴 카드를 클릭하거나 "담기" 버튼으로 장바구니에 추가

2. **음성 주문 사용하기**

   - 상단의 "🎤 음성 주문" 버튼 클릭
   - 마이크 권한 허용
   - 다음과 같은 명령어 사용:
     - "치킨버거 추가" 또는 "치킨버거 주문"
     - "콜라 2개 넣어줘"
     - "감자튀김 빼줘"
     - "메뉴 보여줘"
     - "결제" 또는 "주문 완료"

3. **주문 및 결제**
   - 장바구니에서 수량 조절 가능
   - "주문하기" 버튼 클릭
   - 결제 방법 선택 (카드/현금/간편결제)
   - 결제 완료

### 관리자 모드

1. **모드 전환**

   - 좌측 하단의 "관리자" 버튼 클릭

2. **카테고리 관리**

   - "카테고리 추가" 버튼으로 새 카테고리 생성
   - 카테고리 순서 지정
   - 기존 카테고리 삭제

3. **메뉴 관리**
   - "메뉴 추가" 버튼으로 새 메뉴 등록
   - 메뉴명, 설명, 가격, 카테고리 설정
   - 판매 가능/품절 상태 관리
   - 기존 메뉴 수정/삭제

## 🛠 기술 스택

- **Frontend**: React 18 + TypeScript
- **Styling**: styled-components
- **상태 관리**: React Context API + useReducer
- **음성 기능**: Web Speech API (음성 인식 + TTS)
- **빌드 도구**: Create React App

## 📱 음성 명령어 가이드

### 💬 기본 명령어

#### 메뉴 추가

- "치킨버거 추가"
- "비프버거 주문"
- "콜라 2개 넣어줘"
- "감자튀김 3개 주문"

#### 메뉴 제거

- "치킨버거 빼줘"
- "콜라 제거"
- "감자튀김 삭제"

#### 정보 확인

- "메뉴 보여줘"
- "메뉴 뭐 있어?"
- "총 얼마야?"

#### 주문 완료

- "결제"
- "주문 완료"
- "계산해줘"

## 🌟 주요 특징

### 🎨 사용자 친화적 디자인

- 직관적인 UI/UX
- 반응형 디자인
- 부드러운 애니메이션 효과
- 접근성 고려

### 🔊 혁신적인 음성 인터페이스

- 실시간 음성 인식
- 자연어 명령 처리
- 음성 피드백
- 오류 처리 및 도움말

### 💼 완전한 관리 시스템

- 실시간 메뉴 관리
- 주문 내역 추적
- 매출 계산
- 사용자 모드 전환

### 🛡 안정성

- TypeScript로 타입 안정성 보장
- 에러 처리 및 예외 상황 대응
- 브라우저 호환성 확인

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 새로운 기능 브랜치를 만드세요 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋하세요 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시하세요 (`git push origin feature/새기능`)
5. Pull Request를 생성하세요

## 📞 지원

문제가 발생하거나 개선 제안이 있으시면 이슈를 생성해주세요.

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다.

---

**만든 이**: AI Assistant
**버전**: 1.0.0
**마지막 업데이트**: 2025년 7월
