# 야만추 / Yamanchu

야만추는 야구 직관 경험을 기반으로 성향 카드, 실시간 응원 반응, 경기 후 매칭/코스 추천을 보여주는 발표용 MVP 데모 모음입니다.

Yamanchu is a presentation MVP collection for a baseball stadium social experience: fan personality cards, live cheering reactions, and post-game matching/course recommendations.

## 프로젝트 구성 / Project Structure

| Folder | Description |
| --- | --- |
| `1-yamanchu-mvp-3d` | 3D stadium MVP flow from onboarding to matching and mock payment |
| `2-yamanchu-live-demo` | Live cheering-seat demo with timeline, reactions, prediction, and report |
| `3-yamanchu-postgame-demo` | Post-game course recommendation, AI chat, meetup, and payment mock |
| `docs/ko` | Korean planning document and presentation files |
| `archive/yamanchu-mvp-3d-legacy` | Preserved earlier MVP variant |

## 실행 / Run

각 데모 폴더에서 의존성을 설치하고 Vite 개발 서버를 실행합니다.

Install dependencies and run the Vite dev server inside each demo folder.

```bash
cd 1-yamanchu-mvp-3d
npm install
npm run dev
```

```bash
cd 2-yamanchu-live-demo
npm install
npm run dev -- --port 5183
```

```bash
cd 3-yamanchu-postgame-demo
npm install
npm run dev
```

## 문서 / Documentation

- Korean: each demo folder has `README.md`.
- English: each demo folder has `README.en.md`.
- Planning/presentation files are stored under `docs/ko`.

## 구현 범위 / Scope

- Frontend-only presentation demos
- No production backend, database, real payment, or live multiplayer
- Mocked user flows and sample data for pitching and demo purposes
