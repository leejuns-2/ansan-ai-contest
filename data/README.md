# 데이터 구성 및 전처리 설명

## 현재 데이터 상태

현재 MVP는 일부 실제 공개 원천 데이터를 반영한다. 해양경찰청 연안사고 이력 CSV와 연안위험구역/출입통제구역 SHP는 로컬 원천 파일을 전처리해 사용한다.

조위, 기상청 단기예보/특보, 유동인구, 비식별 현장 신호는 아직 운영 API를 직접 호출하지 않으며 공개 데이터 구조를 반영한 샘플 또는 대체 데이터를 사용한다.

실제 운영 전환 시에는 아래 흐름으로 대체한다.

```text
공공데이터 API/파일 다운로드
→ 장소-시간 단위 표준화
→ 위험 피처 생성
→ 위험도 산식 적용
→ 추천 조치 매칭
→ 대시보드 표시
```

## 폴더 구조

| 경로 | 설명 |
|---|---|
| `master/ansan_coastal_locations.json` | 모든 API 수집기가 순회할 안산 연안 후보지 마스터 |
| `raw/source_registry.json` | 데이터 출처, 제공기관, 확인 상태, 활용 필드 |
| `raw/demo_observations.json` | 공개 데이터 구조를 모사한 원시 관측 샘플 |
| `raw/ansan_candidate_locations.json` | 안산 연안 후보지 좌표 수집 결과 |
| `raw/ansan_open_meteo_weather_latest.json` | 안산 후보지별 최신 기상 예보 수집 결과 |
| `raw/kcg_coastal_accident_stats_2020_2024.json` | 해양경찰청 공식 페이지에서 수집한 최근 5년 연안사고 유형별 통계 |
| `raw/kcg_accident_history/` | 해양경찰청 연안사고 이력 CSV 원본. CP949 인코딩 |
| `raw/kcg_coastal_risk_zones/` | 해양경찰청 연안위험구역현황 SHP 원본 ZIP 및 추출 파일 |
| `raw/kcg_control_zones/` | 해양경찰청 연안 출입통제구역 현황 SHP 원본 ZIP 및 추출 파일 |
| `processed/kcg_accident_history_local.json` | 안산 직접/경기 연안/평택 관할 proxy 사고이력 요약 |
| `processed/kcg_spatial_layers_inventory.json` | SHP/DBF 필드, 좌표계, 안산 매칭 기록 검토 결과 |
| `processed/kcg_spatial_exposure_ansan.json` | 후보지별 공식 위험구역·출입통제구역 포함 여부와 거리 |
| `processed/kcg_coastal_risk_zones.geojson` | WGS84 연안위험구역 지도 레이어 |
| `processed/kcg_control_zones.geojson` | WGS84 공식 출입통제구역 지도 레이어 |
| `processed/risk_timeseries.json` | 전처리 후 대시보드가 읽는 위험도 시계열 |
| `processed/risk_timeseries.js` | `file://` 실행을 위한 브라우저 데이터 번들 |
| `../scripts/ingest_kcg_local_data.js` | 해경 CSV/SHP를 JSON, GeoJSON, 로컬 prior 모델로 변환하는 스크립트 |
| `../scripts/preprocess_demo_data.js` | 원시 샘플을 위험도 시계열로 변환하는 전처리 스크립트 |

## 전처리 산식 요약

위험도는 0~100점으로 산출한다.

```text
risk_score =
  조위위험 * 0.25
+ 기상위험 * 0.18
+ 방문혼잡 * 0.18
+ 사고이력 * 0.14
+ 공간노출 * 0.12
+ 익명현장신호 * 0.13
```

`사고이력` 피처는 `models/local_accident_history_model.json`이 존재하면 해양경찰청 연안사고 이력 기반 로컬/관할 prior를 우선 사용한다. 이 모델은 안산 직접 표기 1건, 경기 연안 117건, 평택해경 관할 proxy 198건을 사용한다.

로컬 모델이 없으면 `models/history_prior_model.json`의 해양경찰청 전국 연안사고통계 기반 prior로 대체한다. 기본 사고유형 매핑은 다음과 같다.

| 장소 유형 | 사고유형 prior |
|---|---|
| 갯벌·해안 접근부 | 고립, 익수 |
| 항구·방파제 | 추락, 익수 |
| 시화호·방조제 인근 | 추락, 고립 |

`기상` 피처는 `raw/ansan_open_meteo_weather_latest.json`이 존재하면 안산 후보지별 최신 예보의 풍속·강수량으로 대체한다. 단, 공모전 최종본에서는 기상청 공공데이터 API로 교체하는 것이 더 적합하다.

`공간노출` 피처는 `processed/kcg_spatial_exposure_ansan.json`이 존재하면 해양경찰청 연안위험구역/출입통제구역 SHP에서 계산한 공식 위험구역 포함 여부와 최단거리 점수로 대체한다.

위험등급:

| 점수 | 등급 |
|---:|---|
| 85 이상 | 긴급 |
| 70 이상 | 높음 |
| 50 이상 | 주의 |
| 50 미만 | 낮음 |

## 실제 데이터 전환 시 필요한 작업

1. 국립해양조사원 조위 API에서 인근 관측소 코드 확정
2. 기상청 격자 좌표를 대부도·안산 연안 후보 구역에 매핑
3. 해양경찰청 연안사고 이력에서 안산 또는 관할 해역 필터 검증
4. 경기데이터드림 유동인구의 공간·시간 해상도 확인
5. 안산시 내부 전광판, 안내시설, 관광안내 채널, 현장 관리 데이터 확인
6. CCTV/IoT 사용 시 원본 영상이 아닌 비식별 집계 신호만 저장하도록 설계

## 주의

`demo_observations.json`의 조위, 유동인구, 익명 현장 신호 값은 제출서 설명과 화면 시연을 위한 샘플이다. 해경 사고이력과 공간 레이어는 실제 공개 원천을 반영했지만, 후보지별 정밀 사고 모델은 아니므로 상세 사고 좌표 또는 내부 사고위치 데이터 확보 전까지 지역·관할 기반 prior로만 설명해야 한다.
