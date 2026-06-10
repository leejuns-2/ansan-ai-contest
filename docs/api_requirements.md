# API 수집 필요 목록

## 목적

안산 세이프코스트 AI를 실제 데이터 기반으로 전환하기 위해 필요한 API와 인증키, 산출 파일, 구현 우선순위를 정리한다.

## 우선순위 요약

| 우선순위 | API/데이터 | 필요성 | 인증키 | 상태 |
|---:|---|---|---|---|
| P0 | 기상청 단기예보/초단기실황 | 후보지별 풍속·강수·기상 위험 | 필요 | 수집기 템플릿 필요 |
| P0 | 국립해양조사원 조위 실측·예측 | 만조·간조, 조위 상승 속도 | 필요 | 수집기 템플릿 필요 |
| P0 | 해양경찰청 연안사고 이력 | 안산/관할 해역 사고이력 피처 | 필요 또는 파일 다운로드 | 수집기 템플릿 필요 |
| P1 | 경기데이터드림 유동인구 | 방문객 집중·혼잡도 | 필요 가능 | 접근 방식 확인 필요 |
| P1 | 안산시 주차장·시설·전광판 | 실행 가능한 개입 추천 | 일부 공개/내부 | 목록화 필요 |
| P2 | 현장 CCTV/IoT 비식별 집계 | 체류·복귀 지연 상황인식 | 내부 연계 | 시범구간 이후 |

## 환경변수

`.env.example` 기준:

```text
DATA_GO_KR_SERVICE_KEY=
KMA_SERVICE_KEY=${DATA_GO_KR_SERVICE_KEY}
KHOA_SERVICE_KEY=${DATA_GO_KR_SERVICE_KEY}
GG_DATA_KEY=
KCG_ACCIDENT_HISTORY_SERVICE_KEY=${DATA_GO_KR_SERVICE_KEY}
KCG_ACCIDENT_HISTORY_DOWNLOAD_URL=
```

## P0. 기상청 단기예보/초단기실황

활용:

- 풍속
- 강수량
- 기온
- 하늘상태
- 후보지별 시간대 기상 위험

필요 처리:

1. 후보지 위경도를 기상청 격자 X/Y로 변환
2. 기준시각과 예보시각 정규화
3. 장소-시간 단위로 join
4. Open-Meteo PoC 기상값을 공식 기상청 값으로 교체

산출 파일:

```text
data/raw/kma_forecast_ansan.json
```

## P0. 국립해양조사원 조위 실측·예측

활용:

- 만조까지 남은 시간
- 조위 상승/하강 속도
- 고조위 위험

필요 처리:

1. 안산 후보지와 가장 가까운 조위관측소 매핑
2. 실측·예측 조위 시간대 정규화
3. 후보지별 대표 조위 피처 산출

산출 파일:

```text
data/raw/khoa_tide_ansan.json
```

## P0. 해양경찰청 연안사고 이력

활용:

- 안산 또는 관할 해역 사고 필터
- 사고유형, 장소유형, 발생일자, 요일, 원인 분석
- 현재 전국 통계 prior를 지역 기반 사고이력 피처로 교체

필요 처리:

1. CSV/API 필드 확인
2. 안산, 대부도, 탄도항 등 지역명 필터
3. 사고유형과 후보지 장소유형 매핑
4. 연도·월·요일·시간대별 사고이력 점수 생성

산출 파일:

```text
data/raw/kcg_accident_history_ansan.json
models/history_local_model.json
```

## P1. 경기데이터드림 유동인구

활용:

- 시간대별 방문객 집중
- 평소 대비 혼잡도
- 관광객 유입 보조지표

한계:

- 시군구 단위면 후보지별 위험도에는 해상도가 낮다.
- 격자/행정동/관광지 단위 데이터 확보 여부를 확인해야 한다.

산출 파일:

```text
data/raw/gg_population_ansan.json
```

## 수집기 구조

키가 들어오면 다음 흐름으로 실행한다.

```text
data/master/ansan_coastal_locations.json
→ collect:apis
→ data/raw/{source}_ansan.json
→ preprocess
→ data/processed/risk_timeseries.json
→ index.html
```

## 현재 대체 데이터

| 피처 | 현재 사용 중 | 교체 대상 |
|---|---|---|
| 위치 | OSM + 후보지 마스터 | 안산시/국토공간 공식 좌표 |
| 기상 | Open-Meteo | 기상청 단기예보 |
| 조위 | 샘플 구조 | 국립해양조사원 조위 API |
| 사고이력 | 해경 전국 통계 prior | 해경 연안사고 이력 안산 필터 |
| 유동인구 | 샘플 구조 | 경기데이터드림/안산시 유동인구 |

