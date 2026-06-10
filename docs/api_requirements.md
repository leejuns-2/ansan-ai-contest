# API 수집 필요 목록

## 1순위: 반드시 받아와야 하는 API / 데이터

아래 6개가 현재 서비스의 핵심 데이터셋이다. 조위·기상·특보·공간위험·공식 통제구역·사고이력이 결합되어야 “안산 연안 고위험상황 선제예방” 구조가 방어된다.

| 우선순위 | 목적 | 받아올 데이터 | 추천 API / 데이터 | 왜 필요한가 | 인증/확보 방식 | 산출 파일 |
|---:|---|---|---|---|---|---|
| P0-1 | 물때·고립 위험 예측 | 조위, 고조·저조 시각, 예측 조위 | 국립해양조사원 조석예보 시계열, 조석예보 고·저조, 조위관측소 실측·예측 조위 조회 | 갯벌 고립 위험의 핵심. 몇 시부터 위험해지는지 계산하는 근거 | 공공데이터포털/KHOA 인증키 | `data/raw/khoa_tide_forecast_ansan.json`, `data/raw/khoa_tide_high_low_ansan.json`, `data/raw/khoa_tide_observed_predicted_ansan.json` |
| P0-2 | 날씨 위험 판단 | 강수, 풍속, 기온, 하늘상태, 초단기예보 | 기상청 단기예보 조회서비스 | 비, 강풍, 시야 악화, 체감 위험 반영 | 공공데이터포털 인증키 | `data/raw/kma_forecast_ansan.json` |
| P0-3 | 공식 위험기상 반영 | 풍랑, 강풍, 호우, 태풍, 폭풍해일 등 특보 | 기상청 기상특보 조회서비스 / 특보 조회서비스 | 위험점수에 공식 특보를 즉시 반영 | 공공데이터포털 인증키 | `data/raw/kma_weather_warning_ansan.json` |
| P0-4 | 위험 장소 기반화 | 연안위험구역 polygon/SHP | 해양경찰청 연안위험구역현황 | 어디가 위험한가를 지도에 올리는 핵심 공간 데이터 | 로컬 파일 반영 완료 | `data/raw/kcg_coastal_risk_zones/`, `data/processed/kcg_coastal_risk_zones.geojson` |
| P0-5 | 공식 통제구역 구분 | 연안 출입통제구역 SHP | 해양경찰청 연안 출입통제구역 현황 | 우리가 임의 통제하는 것이 아니라 공식 출입통제구역 여부를 표시 | 로컬 파일 반영 완료 | `data/raw/kcg_control_zones/`, `data/processed/kcg_control_zones.geojson` |
| P0-6 | 사고 패턴 학습 | 발생일자, 요일, 사고유형, 장소유형, 원인, 위험구역 지정 여부 | 해양경찰청 연안사고 이력 | AI 모델 학습과 룰 기반 위험가중치 산정의 근거 | 로컬 CSV 반영 완료 | `data/raw/kcg_accident_history/`, `models/local_accident_history_model.json` |

확인된 공공데이터포털 URL:

| 데이터 | URL |
|---|---|
| 국립해양조사원 조석예보 시계열 | https://www.data.go.kr/data/15156022/openapi.do |
| 국립해양조사원 조석예보 고·저조 | https://www.data.go.kr/data/15156018/openapi.do |
| 국립해양조사원 조위관측소 실측·예측 조위 조회 | https://www.data.go.kr/data/15142507/openapi.do |
| 기상청 단기예보 조회서비스 | https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15084084 |
| 기상청 기상특보 조회서비스 | https://www.data.go.kr/data/15000415/openapi.do |
| 기상청 특보 조회서비스 | https://www.data.go.kr/data/15139476/openapi.do |
| 기상청 특보구역정보 조회서비스 | https://www.data.go.kr/data/15126651/openapi.do |
| 해양경찰청 연안위험구역현황 | https://www.data.go.kr/data/15110661/fileData.do |
| 해양경찰청 연안 출입통제구역 현황 | https://data.go.kr/data/15110667/fileData.do |
| 해양경찰청 연안사고 이력 | https://www.data.go.kr/data/15088402/fileData.do |

## 환경변수

`.env.example` 기준:

```text
DATA_GO_KR_SERVICE_KEY=

KMA_SERVICE_KEY=${DATA_GO_KR_SERVICE_KEY}
KMA_WARNING_SERVICE_KEY=${DATA_GO_KR_SERVICE_KEY}

KHOA_SERVICE_KEY=${DATA_GO_KR_SERVICE_KEY}
KHOA_TIDE_FORECAST_SERVICE_KEY=${DATA_GO_KR_SERVICE_KEY}

KCG_ACCIDENT_HISTORY_SERVICE_KEY=${DATA_GO_KR_SERVICE_KEY}
KCG_ACCIDENT_HISTORY_DOWNLOAD_URL=

KCG_RISK_ZONE_SHP_DOWNLOAD_URL=
KCG_CONTROL_ZONE_SHP_DOWNLOAD_URL=

GG_DATA_KEY=
```

## 데이터별 구현 메모

### P0-1. 국립해양조사원 조위·조석예보

필요 데이터:

- 조석예보 시계열
- 조석예보 고·저조
- 조위관측소 실측·예측 조위

후보지별 처리:

1. `data/master/ansan_coastal_locations.json`의 후보지 좌표를 읽는다.
2. 후보지별 가장 가까운 조위관측소를 매핑한다.
3. 시계열 조위에서 `tideCm`, `tideDeltaCmPerHour`를 만든다.
4. 고·저조 데이터에서 `minutesToHighTide`, `minutesToLowTide`를 만든다.
5. 갯벌·해안 접근부 후보지는 조위 가중치를 높게 준다.

최종 피처:

```text
tideCm
tideDeltaCmPerHour
minutesToHighTide
minutesToLowTide
tideRisk
nearestTideStation
```

### P0-2. 기상청 단기예보

필요 데이터:

- 초단기실황
- 초단기예보
- 단기예보

후보지별 처리:

1. 위경도를 기상청 `nx`, `ny` 격자로 변환한다.
2. 예보시각을 장소-시간 단위로 정규화한다.
3. 풍속, 강수, 기온, 하늘상태를 위험 피처로 변환한다.

최종 피처:

```text
windMps
rainMm
temperatureC
skyStatus
precipitationType
weatherRisk
```

### P0-3. 기상청 기상특보

필요 데이터:

- 강풍
- 풍랑
- 호우
- 태풍
- 폭풍해일
- 기타 위험기상 특보

처리:

1. 안산시 육상 특보구역과 인근 해역 특보구역을 매핑한다.
2. 주의보/경보를 등급화한다.
3. 특보가 발효 중이면 위험점수에 직접 가산한다.

최종 피처:

```text
warningType
warningLevel
warningAreaCode
warningActive
warningRiskBoost
```

### P0-4. 해양경찰청 연안위험구역현황 SHP

필요 데이터:

- SHP
- DBF
- SHX
- PRJ/PRG/CPG 등 부속 파일

처리:

1. SHP를 GeoJSON으로 변환한다.
2. 후보지 좌표가 위험구역 polygon 안에 들어가는지 계산한다.
3. 후보지와 가장 가까운 위험구역까지 거리를 계산한다.
4. 지도 레이어로 표시한다.

최종 피처:

```text
insideCoastalRiskZone
nearestCoastalRiskZoneDistanceM
coastalRiskZoneName
spatialRiskBoost
```

### P0-5. 해양경찰청 연안 출입통제구역 현황 SHP

필요 데이터:

- SHP
- DBF
- SHX
- PRJ/PRG/CPG 등 부속 파일

처리:

1. SHP를 GeoJSON으로 변환한다.
2. 후보지가 공식 출입통제구역 안 또는 인근인지 판정한다.
3. 대시보드에는 “안산시 통제”가 아니라 “공식 통제구역 여부”로 표시한다.

최종 피처:

```text
insideOfficialControlZone
nearestControlZoneDistanceM
controlZoneName
authorityOwner
```

### P0-6. 해양경찰청 연안사고 이력

필요 데이터:

- 발생일자
- 발생요일
- 사고유형
- 장소유형
- 발생지역
- 사고원인
- 위험구역 지정 여부

처리:

1. 안산, 대부도, 탄도항, 방아머리 등 키워드로 필터한다.
2. 장소유형과 후보지 category를 매핑한다.
3. 요일·계절·시간대별 사고이력 가중치를 만든다.
4. 현재 전국 통계 기반 prior를 지역 사고이력 모델로 교체한다.

최종 피처:

```text
localAccidentHistoryScore
dominantAccidentType
placeTypeRisk
dayOfWeekRisk
seasonalRisk
accidentCauseRisk
```

## 2순위: 운영 설득력 보강 데이터

| 목적 | 데이터 | 활용 |
|---|---|---|
| 방문객 집중 | 경기데이터드림 유동인구 | `visitorIndex`, `visitorChangePct` |
| 주차 혼잡 | 안산시/안산도시공사 공영주차장 | 주차장 인근 방문 집중 보조 |
| 개입 채널 | 안산시 전광판·안내시설·관광안내 채널 | 추천 조치 실행 가능성 판단 |
| 현장 상황 | CCTV/IoT 비식별 집계 | 체류시간, 방향, 복귀 지연 군집 |

## 현재 대체 데이터

| 피처 | 현재 사용 중 | 교체 대상 |
|---|---|---|
| 위치 | OSM + 후보지 마스터 | 안산시/국토공간 공식 좌표 |
| 기상 | Open-Meteo | 기상청 단기예보 |
| 조위 | 샘플 구조 | 국립해양조사원 조위·조석예보 |
| 사고이력 | 해경 전국 통계 prior | 해경 연안사고 이력 안산 필터 |
| 공간위험 | 후보지 category | 해경 연안위험구역 SHP |
| 공식 통제구역 | 없음 | 해경 출입통제구역 SHP |
| 유동인구 | 샘플 구조 | 경기데이터드림/안산시 유동인구 |
