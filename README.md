# 안산 세이프코스트 AI

안산시 공공데이터·AI 활용 아이디어 공모전용 MVP와 제출 문서 패키지입니다.

목표는 시민용 앱이 아니라, 안산시 담당자가 연안 고위험상황을 사전에 확인하고 예방 행정 조치를 선택하는 운영 대시보드입니다.

## 핵심 개념

```text
공공데이터 수집
→ 장소-시간 단위 표준화
→ 위험 피처 생성
→ 설명 가능한 위험도 산출
→ 예방 개입 추천
→ 관계기관 공유
→ 개입 효과 피드백
```

현재 MVP는 해양경찰청 연안사고 이력 CSV, 연안위험구역 SHP, 연안 출입통제구역 SHP를 로컬 원천 데이터로 반영했습니다. 조위, 기상청 단기예보/특보, 유동인구, 안산시 내부 안내시설 데이터는 API 키 또는 내부 자료 확보 후 교체해야 합니다.

## 프로젝트 구조

```text
.
├─ index.html
├─ assets/
│  ├─ css/styles.css
│  └─ js/app.js
├─ data/
│  ├─ README.md
│  ├─ master/
│  │  └─ ansan_coastal_locations.json
│  ├─ raw/
│  │  ├─ source_registry.json
│  │  ├─ demo_observations.json
│  │  └─ legacy_sample_risk_data.json
│  └─ processed/
│     ├─ risk_timeseries.json
│     ├─ kcg_accident_history_local.json
│     ├─ kcg_spatial_exposure_ansan.json
│     ├─ kcg_coastal_risk_zones.geojson
│     └─ kcg_control_zones.geojson
├─ docs/
│  ├─ submission_draft_v1.md
│  ├─ data_inventory.md
│  ├─ pipeline_design.md
│  ├─ api_requirements.md
│  ├─ mvp_wireframes.md
│  ├─ presentation_outline.md
│  ├─ judge_qna.md
│  └─ final_review.md
├─ scripts/
│  ├─ ingest_kcg_local_data.js
│  └─ preprocess_demo_data.js
└─ package.json
```

## MVP 기능

- 장소·시간별 위험도 표시
- 데이터 레이어별 위험도 재계산
- 위험 원인 Top 항목 표시
- 원시 신호와 요인별 기여도 표시
- 예방 개입 권고 카드
- 실행 예정 등록 및 감사 로그
- 관계기관 공유 리포트 생성·복사
- 데이터 계보와 전처리 산식 표시
- 개인정보 보호와 해경/안산시 권한 경계 표시

## 데이터 출처

주요 데이터 후보는 `data/raw/source_registry.json`과 `docs/data_inventory.md`에 정리했습니다.

확인한 공개 후보:

- 해양경찰청 연안사고 이력
- 해양경찰청 연안안전 예측분석모델
- 국립해양조사원 조위관측소 실측·예측 조위
- 기상청 단기예보 조회서비스
- 경기데이터드림 유동인구 시군구 단위 집계
- 안산시·안산도시공사 공간시설·주차장·시설 데이터 후보

주의: `data/raw/demo_observations.json` 값은 실제 관측값이 아니라 MVP 재현을 위한 샘플입니다.

## 전처리 실행

Node.js가 설치된 환경:

```powershell
npm run preprocess
```

해양경찰청 로컬 원천 데이터 재처리:

```powershell
npm run ingest:kcg-local
```

실제 데이터 수집 착수 파이프라인:

```powershell
npm run pipeline:real-start
```

이 명령은 해양경찰청 공식 연안사고통계 페이지에서 최근 5년 사고유형별 발생·사망 통계를 수집하고, 사고유형별 사고이력 prior 모델을 학습한 뒤, 로컬 해경 CSV/SHP를 처리하고, 대시보드용 위험도 데이터를 다시 생성합니다.

API 키 준비 상태 확인:

```powershell
npm run collect:apis
```

직접 실행:

```powershell
node scripts/preprocess_demo_data.js
```

전처리 결과는 `data/processed/risk_timeseries.json`에 생성됩니다.

## 검증

```powershell
npm run check
```

검증 내용:

- `assets/js/app.js` 문법 검사
- 실제 수집기, 로컬 해경 데이터 ingest, 모델 학습기 문법 검사
- 원시 샘플 데이터 전처리 가능 여부 확인

## 실제 데이터/모델 산출물

| 파일 | 설명 |
|---|---|
| `data/master/ansan_coastal_locations.json` | API 수집 기준이 되는 안산 연안 후보지 마스터 |
| `data/raw/kcg_coastal_accident_stats_2020_2024.json` | 해양경찰청 공식 페이지에서 수집한 최근 5년 연안사고 유형별 통계 |
| `data/raw/ansan_candidate_locations.json` | 안산 연안 후보지 좌표 수집 결과 |
| `data/raw/ansan_open_meteo_weather_latest.json` | 안산 후보지별 최신 기상 예보 수집 결과 |
| `models/history_prior_model.json` | 사고유형별 사고이력 prior 모델 |
| `models/history_prior_report.md` | 모델 학습 리포트 |
| `data/raw/kcg_accident_history/해양경찰청_연안사고 이력_20231231.csv` | CP949 인코딩의 해경 연안사고 이력 원본 |
| `data/raw/kcg_coastal_risk_zones/` | 연안위험구역 SHP 원본 ZIP 및 추출 파일 |
| `data/raw/kcg_control_zones/` | 연안 출입통제구역 SHP 원본 ZIP 및 추출 파일 |
| `data/processed/kcg_accident_history_local.json` | 안산 직접/경기 연안/평택 관할 proxy 사고이력 요약 |
| `data/processed/kcg_spatial_exposure_ansan.json` | 후보지별 위험구역·출입통제구역 포함 여부와 거리 |
| `data/processed/kcg_coastal_risk_zones.geojson` | 연안위험구역 지도 레이어 |
| `data/processed/kcg_control_zones.geojson` | 공식 출입통제구역 지도 레이어 |
| `models/local_accident_history_model.json` | 로컬/관할 사고이력 prior 모델 |
| `docs/api_requirements.md` | API 키 발급·수집 필요 목록 |
| `docs/real_data_pipeline.md` | 실제 데이터 수집·모델 학습 진행 상태와 다음 수집 대상 |

현재 로컬 사고이력은 안산 직접 표기 1건, 경기 연안 117건, 평택해경 관할 proxy 198건을 사용합니다. 후보지별 정밀 사고 모델이 아니라 지역·관할 기반 prior이며, 실제 운영 전에는 상세 사고 좌표 또는 내부 사고위치 데이터가 필요합니다.

## 로컬 실행

정적 파일이므로 GitHub Pages에서 바로 동작합니다.

가장 쉬운 방법:

```powershell
Start-Process .\index.html
```

`data/processed/risk_timeseries.js`가 포함되어 있어 더블클릭 또는 `file://` 방식으로도 동작합니다.

로컬 서버 예시:

```powershell
npx serve .
```

또는:

```powershell
python -m http.server 8000
```

브라우저에서 `http://localhost:8000` 접속.

## GitHub Pages 배포

1. 저장소 루트에 이 프로젝트를 푸시
2. GitHub 저장소 `Settings > Pages`
3. `Deploy from a branch`
4. `main` 브랜치와 `/root` 선택
5. 배포 URL에서 `index.html` 확인

## 권한·개인정보 원칙

- 얼굴인식 미사용
- 차량번호 인식 미사용
- 개인별 이동경로 저장 금지
- 개인별 위험점수 금지
- 출입통제 자동화 금지
- 구조 지휘 기능 제외
- 관계기관 법정 권한 대체 금지

안산시의 역할은 위험 예측, 시민 안내, 시설 개선, 현장 안내 강화, 관계기관 공유 등 예방 행정 지원으로 제한합니다.

## 다음 보강 과제

1. 실제 안산 연안 사고·위험 사례 공식 근거 확보
2. 조위관측소와 안산 연안 후보 구역의 대표성 검증
3. 기상청 격자 좌표와 후보 구역 매핑
4. 경기데이터드림 유동인구 해상도 확인
5. 안산시 전광판·안내시설·관광안내 채널 연계 가능성 확인
6. 발표용 화면 캡처와 PPT 제작
