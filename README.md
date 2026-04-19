# 사전 상담 대화 프론트엔드

React + Vite + TypeScript + Tailwind 기반의 사전 상담 대화 UI입니다.

## Cloudflare Pages 배포

### 1) Cloudflare Pages 프로젝트 생성
- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `20` 이상 권장

### 2) 환경 변수 설정
Cloudflare Pages > Settings > Environment variables 에 아래 값 추가

- `VITE_API_URL`: 백엔드 API 기본 URL (예: `https://api.example.com`)

> 프론트에서 호출 경로는 `${VITE_API_URL}/api/chat` 입니다.

### 3) 로컬 확인
```bash
npm install
npm run build
npm run dev
```

## Wrangler로 배포할 때
아래처럼 정적 산출물(`dist`)을 Pages로 배포할 수 있습니다.

```bash
npm run build
npx wrangler pages deploy dist --project-name <your-project-name>
```
