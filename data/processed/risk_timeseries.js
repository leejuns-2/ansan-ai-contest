window.__RISK_DATA__ = {
  "generatedAt": "2026-06-10T13:18:42.985Z",
  "scenarioDate": "2026-06-10",
  "notice": "공개 데이터 구조를 모사한 MVP 샘플이다. 실제 관측·사고 통계로 단정하지 않는다.",
  "regionalCollection": {
    "ansanLocationsCollectedAt": "2026-06-10T13:17:51.944Z",
    "ansanWeatherCollectedAt": "2026-06-10T13:17:51.944Z",
    "weatherSource": {
      "name": "Open-Meteo Forecast API",
      "url": "https://open-meteo.com/",
      "note": "인증키 없이 사용할 수 있는 기상 예보 API. 공공데이터포털 기상청 API 연동 전 PoC 보조 데이터로 사용한다."
    },
    "locationSource": {
      "name": "OpenStreetMap Nominatim",
      "url": "https://nominatim.openstreetmap.org/",
      "note": "안산 연안 후보지명 좌표 확인용. 실패 시 수동 후보 좌표를 사용한다."
    }
  },
  "preprocessing": {
    "timeUnit": "1 hour",
    "spatialUnit": "candidate POI",
    "modelType": "explainable weighted risk score for MVP",
    "weights": {
      "tide": 0.25,
      "weather": 0.18,
      "visitor": 0.18,
      "history": 0.14,
      "spatial": 0.12,
      "field": 0.13
    },
    "riskLevels": [
      {
        "min": 85,
        "label": "긴급"
      },
      {
        "min": 70,
        "label": "높음"
      },
      {
        "min": 50,
        "label": "주의"
      },
      {
        "min": 0,
        "label": "낮음"
      }
    ]
  },
  "sourceLineage": [
    {
      "id": "ansan_candidate_locations_osm",
      "name": "안산 연안 후보지 좌표",
      "agency": "OpenStreetMap Nominatim",
      "url": "https://nominatim.openstreetmap.org/",
      "status": "live_collected",
      "expectedFields": [
        "장소명",
        "위도",
        "경도",
        "OSM ID",
        "지오코딩 상태"
      ],
      "use": "방아머리·탄도항·시화방조제 후보 구역의 위치 메타데이터 보강",
      "risk": "OSM 매칭 실패 시 수동 후보 좌표를 사용하므로 최종 제출 전 공식 좌표 검증 필요"
    },
    {
      "id": "ansan_open_meteo_weather",
      "name": "안산 연안 후보지 기상 예보",
      "agency": "Open-Meteo",
      "url": "https://open-meteo.com/",
      "status": "live_collected",
      "expectedFields": [
        "시간",
        "기온",
        "강수량",
        "풍속",
        "돌풍",
        "시정"
      ],
      "use": "기상청 API 인증키 연동 전 안산 후보지별 최신 기상 피처 보강",
      "risk": "공모전 제출용 공식 기상 데이터는 기상청 공공데이터 API로 교체 권장"
    },
    {
      "id": "kcg_public_accident_stats",
      "name": "해양경찰청 연안사고통계",
      "agency": "해양경찰청",
      "url": "https://imsm.kcg.go.kr/CSMS/main/csiAcdnt/CsiAcdntSttusRB.do",
      "status": "live_collected",
      "expectedFields": [
        "사고유형",
        "연도",
        "발생건수",
        "사망자수"
      ],
      "use": "사고유형별 발생·사망 통계 기반 사고이력 prior 모델 학습",
      "risk": "전국 집계 통계라 안산 특정 장소 모델로 직접 해석하면 안 됨"
    },
    {
      "id": "coast_accident_history",
      "name": "해양경찰청 연안사고 이력",
      "agency": "해양경찰청",
      "url": "https://www.data.go.kr/data/15088402/fileData.do",
      "status": "public_verified",
      "expectedFields": [
        "지방청",
        "해경서",
        "발생일자",
        "발생요일",
        "사고유형_세분류",
        "장소유형",
        "발생지역",
        "사고원인1차",
        "위험구역지정"
      ],
      "use": "사고 유형, 장소 유형, 시간대, 원인 패턴을 사고이력 점수로 변환",
      "risk": "안산·대부도 단위 필터 가능 여부는 추가 검증 필요"
    },
    {
      "id": "coast_risk_grid",
      "name": "해양경찰청 연안안전 예측분석모델",
      "agency": "해양경찰청",
      "url": "https://www.data.go.kr/data/15118590/fileData.do",
      "status": "public_verified",
      "expectedFields": [
        "격자좌표",
        "위험지수",
        "위험등급",
        "좌표계"
      ],
      "use": "공간위험 초기값과 후보 위험구간 비교",
      "risk": "EPSG:5179 좌표 처리와 안산 연안 격자 추출 필요"
    },
    {
      "id": "tide_prediction",
      "name": "조위관측소 실측·예측 조위 조회",
      "agency": "해양수산부 국립해양조사원",
      "url": "https://www.data.go.kr/data/15142507/openapi.do",
      "status": "public_api_verified",
      "expectedFields": [
        "관측소 코드",
        "관측소명",
        "관측일시",
        "위도",
        "경도",
        "실측 조위",
        "예측 조위"
      ],
      "use": "만조까지 남은 시간, 조위 상승 속도, 조위 위험 점수 산출",
      "risk": "안산 연안 대표 관측소 선정 필요"
    },
    {
      "id": "weather_forecast",
      "name": "기상청 단기예보 조회서비스",
      "agency": "기상청",
      "url": "https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15084084",
      "status": "public_api_verified",
      "expectedFields": [
        "격자X",
        "격자Y",
        "발표시각",
        "예보시각",
        "풍속",
        "강수",
        "기온",
        "하늘상태"
      ],
      "use": "풍속, 강수, 기상악화 위험 산출",
      "risk": "대부도·안산 연안 격자 좌표 변환 필요"
    },
    {
      "id": "floating_population",
      "name": "유동인구 시군구 단위 집계",
      "agency": "경기데이터드림",
      "url": "https://data.gg.go.kr/portal/data/service/selectServicePage.do?infId=6SQDOFXWTXA9V98HRO8E34907014&infSeq=1",
      "status": "public_verified",
      "expectedFields": [
        "시군구",
        "시간대",
        "성별",
        "연령대",
        "생활인구"
      ],
      "use": "방문객 집중 시간대와 평소 대비 혼잡도 산출",
      "risk": "시군구 단위는 세부 연안 지점 분석에 해상도 한계"
    },
    {
      "id": "ansan_facility",
      "name": "안산시 공간시설·주차장·안전시설 데이터",
      "agency": "안산시·안산도시공사",
      "url": "https://www.ansan.go.kr/www/common/cntnts/selectContents.do?cntnts_id=C0001221",
      "status": "partially_public_needs_inventory",
      "expectedFields": [
        "시설명",
        "위치",
        "시설유형",
        "운영부서",
        "관리주체"
      ],
      "use": "안내시설·전광판·주차장·관광거점 기반 예방 조치 추천",
      "risk": "전광판과 안전시설은 내부 데이터 확인 필요"
    },
    {
      "id": "anonymous_field_signal",
      "name": "시범구간 비식별 현장 신호",
      "agency": "안산시 또는 관계기관 내부 인프라 후보",
      "url": null,
      "status": "future_pilot_required",
      "expectedFields": [
        "구역ID",
        "집계시각",
        "추정인원",
        "이동방향",
        "평균체류시간",
        "복귀지연군집수"
      ],
      "use": "익명 상황인식과 개입 효과 검증",
      "risk": "개인정보 영향 검토, 원본 영상 미저장 설계 필요"
    }
  ],
  "models": {
    "historyPrior": {
      "modelName": "history_prior_model_v0",
      "trainedAt": "2026-06-10T12:48:57.185Z",
      "modelType": "interpretable statistical prior",
      "source": {
        "name": "해양경찰청 연안사고통계",
        "agency": "해양경찰청",
        "url": "https://imsm.kcg.go.kr/CSMS/main/csiAcdnt/CsiAcdntSttusRB.do",
        "table": "최근 5년('20 ~ '24년) 연안사고 유형별 현황"
      },
      "formula": "prior_score = clamp(50 + incident_mean_z*18 + fatality_rate_z*16 + trend_slope_z*8, 0, 100)",
      "limitation": "전국 집계 통계 기반이므로 안산 특정 장소 위험도 모델이 아니다. 안산·대부도 필터 데이터 확보 전까지 사고유형 prior로만 사용한다.",
      "priors": [
        {
          "accidentType": "추락",
          "incidentMean": 214.8,
          "deathMean": 39.2,
          "fatalityRate": 0.1824953445065177,
          "trendSlope": -2.7,
          "trendMae": 7.640000000000003,
          "latestIncidentCount": 212,
          "latestDeathCount": 45,
          "years": [
            2020,
            2021,
            2022,
            2023,
            2024
          ],
          "priorScore": 73,
          "riskBand": "주의"
        },
        {
          "accidentType": "익수",
          "incidentMean": 150,
          "deathMean": 61.4,
          "fatalityRate": 0.4093333333333333,
          "trendSlope": -8.1,
          "trendMae": 12.4,
          "latestIncidentCount": 128,
          "latestDeathCount": 67,
          "years": [
            2020,
            2021,
            2022,
            2023,
            2024
          ],
          "priorScore": 72,
          "riskBand": "주의"
        },
        {
          "accidentType": "고립",
          "incidentMean": 200.8,
          "deathMean": 7.4,
          "fatalityRate": 0.036852589641434265,
          "trendSlope": -1.7,
          "trendMae": 7.759999999999996,
          "latestIncidentCount": 195,
          "latestDeathCount": 5,
          "years": [
            2020,
            2021,
            2022,
            2023,
            2024
          ],
          "priorScore": 57,
          "riskBand": "주의"
        },
        {
          "accidentType": "표류",
          "incidentMean": 34,
          "deathMean": 0,
          "fatalityRate": 0,
          "trendSlope": 4.6,
          "trendMae": 6.000000000000001,
          "latestIncidentCount": 37,
          "latestDeathCount": 0,
          "years": [
            2020,
            2021,
            2022,
            2023,
            2024
          ],
          "priorScore": 28,
          "riskBand": "보통"
        },
        {
          "accidentType": "기타",
          "incidentMean": 28,
          "deathMean": 0.8,
          "fatalityRate": 0.02857142857142857,
          "trendSlope": -0.5,
          "trendMae": 14,
          "latestIncidentCount": 21,
          "latestDeathCount": 1,
          "years": [
            2020,
            2021,
            2022,
            2023,
            2024
          ],
          "priorScore": 20,
          "riskBand": "보통"
        }
      ]
    }
  },
  "recommendationCatalog": [
    {
      "id": "return-guidance",
      "title": "조위 상승 복귀 안내",
      "owner": "안산시 현장 관리 부서",
      "channel": "전광판·안내방송·관광안내 채널",
      "authorityRisk": "낮음",
      "effort": "낮음",
      "effect": "갯벌·해안 접근부 체류자의 안전지대 이동 유도"
    },
    {
      "id": "wind-warning",
      "title": "강풍·방파제 접근 주의 안내",
      "owner": "안산시 + 관계기관",
      "channel": "현장 안내방송·관계기관 공유",
      "authorityRisk": "낮음",
      "effort": "중간",
      "effect": "방파제·해안가 체류 위험 노출 감소"
    },
    {
      "id": "visitor-prealert",
      "title": "관광객 사전 알림",
      "owner": "안산시 관광·홍보 채널",
      "channel": "관광안내 페이지·SNS·주차장 안내",
      "authorityRisk": "낮음",
      "effort": "중간",
      "effect": "방문 전 위험시간 인지 강화"
    },
    {
      "id": "agency-share",
      "title": "관계기관 공유 리포트",
      "owner": "안산시 → 해경·소방 등 관계기관",
      "channel": "PDF·메일·내부 공유",
      "authorityRisk": "권한 대체 아님",
      "effort": "낮음",
      "effect": "고위험 시간대 사전 상황 공유"
    },
    {
      "id": "facility-review",
      "title": "시설 개선 후보 등록",
      "owner": "안산시 시설 담당 부서",
      "channel": "정책 리포트·예산 검토",
      "authorityRisk": "낮음",
      "effort": "높음",
      "effect": "반복 위험구간의 구조적 위험 완화"
    },
    {
      "id": "field-broadcast",
      "title": "현장 안내 강화",
      "owner": "안산시 현장 관리 부서",
      "channel": "안내방송·현장 안내요원",
      "authorityRisk": "낮음",
      "effort": "중간",
      "effect": "체류·복귀 지연 신호에 대한 즉시 안내"
    }
  ],
  "locations": [
    {
      "id": "A01",
      "name": "방아머리 후보 구역",
      "officialName": "방아머리해변",
      "type": "갯벌·해안 접근부",
      "district": "단원구 대부동",
      "lat": 37.2875281,
      "lng": 126.574133,
      "manager": "안산시 시범 운영 후보",
      "authority": "안산시 안내 + 관계기관 공유",
      "channels": [
        "관광안내 채널",
        "관계기관 공유"
      ],
      "riskContext": [
        "갯벌체험",
        "관광객 집중",
        "조위 영향",
        "주차장·해안 접근"
      ],
      "dominantAccidentTypes": [
        "고립",
        "익수"
      ],
      "pilotPriority": "P0",
      "dataStatus": {
        "coordinate": "verified_osm",
        "tide": "pending_api",
        "weather": "ready_open_meteo_pending_kma",
        "population": "pending_api",
        "accidentHistory": "national_prior_ready_local_pending"
      },
      "geocode": {
        "source": "openstreetmap_nominatim",
        "status": "matched",
        "matchedQuery": "방아머리해변 안산",
        "displayName": "방아머리해변, 대부동, 단원구, 안산시, 경기도, 대한민국",
        "osmType": "way",
        "osmId": 196292129
      },
      "historyPrior": {
        "sourceModel": "history_prior_model_v0",
        "accidentTypes": [
          "고립",
          "익수"
        ],
        "priorScore": 65,
        "components": [
          {
            "accidentType": "고립",
            "priorScore": 57,
            "incidentMean": 200.8,
            "fatalityRatePct": 3.7,
            "riskBand": "주의"
          },
          {
            "accidentType": "익수",
            "priorScore": 72,
            "incidentMean": 150,
            "fatalityRatePct": 40.9,
            "riskBand": "주의"
          }
        ]
      },
      "series": [
        {
          "datetime": "2026-06-10T19:00:00+09:00",
          "time": "19:00",
          "rawSignals": {
            "tideCm": 642,
            "minutesToHighTide": 167,
            "tideDeltaCmPerHour": 38,
            "windMps": 5.86,
            "windGustMps": 9.61,
            "rainMm": 0,
            "temperature2m": 18.7,
            "visibilityM": 1320,
            "visitorIndex": 132,
            "visitorChangePct": 28,
            "anonymousCrowdCount": 31,
            "avgStayMinutes": 24,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 37,
            "weather": 32,
            "visitor": 57,
            "history": 65,
            "spatial": 78,
            "field": 35
          },
          "riskScore": 48,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 57
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 37
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "visitor-prealert",
            "return-guidance"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T20:00:00+09:00",
          "time": "20:00",
          "rawSignals": {
            "tideCm": 681,
            "minutesToHighTide": 107,
            "tideDeltaCmPerHour": 42,
            "windMps": 5.14,
            "windGustMps": 8.19,
            "rainMm": 0,
            "temperature2m": 16.9,
            "visibilityM": 760,
            "visitorIndex": 151,
            "visitorChangePct": 36,
            "anonymousCrowdCount": 42,
            "avgStayMinutes": 31,
            "returnDelayGroups": 2,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 60,
            "weather": 26,
            "visitor": 74,
            "history": 65,
            "spatial": 78,
            "field": 56
          },
          "riskScore": 59,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 74
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 60
            }
          ],
          "recommendationIds": [
            "facility-review",
            "visitor-prealert",
            "agency-share",
            "return-guidance"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T21:00:00+09:00",
          "time": "21:00",
          "rawSignals": {
            "tideCm": 719,
            "minutesToHighTide": 47,
            "tideDeltaCmPerHour": 44,
            "windMps": 4.61,
            "windGustMps": 5.89,
            "rainMm": 0,
            "temperature2m": 16.5,
            "visibilityM": 840,
            "visitorIndex": 165,
            "visitorChangePct": 44,
            "anonymousCrowdCount": 58,
            "avgStayMinutes": 38,
            "returnDelayGroups": 3,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 81,
            "weather": 21,
            "visitor": 87,
            "history": 65,
            "spatial": 78,
            "field": 81
          },
          "riskScore": 69,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 87
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 81
            },
            {
              "key": "field",
              "label": "익명 현장 체류·복귀 지연 신호",
              "score": 81
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            }
          ],
          "recommendationIds": [
            "visitor-prealert",
            "return-guidance",
            "field-broadcast",
            "facility-review"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T22:00:00+09:00",
          "time": "22:00",
          "rawSignals": {
            "tideCm": 735,
            "minutesToHighTide": 13,
            "tideDeltaCmPerHour": 16,
            "windMps": 3.06,
            "windGustMps": 4.39,
            "rainMm": 0,
            "temperature2m": 16.5,
            "visibilityM": 1420,
            "visitorIndex": 158,
            "visitorChangePct": 27,
            "anonymousCrowdCount": 53,
            "avgStayMinutes": 35,
            "returnDelayGroups": 2,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 81,
            "weather": 9,
            "visitor": 75,
            "history": 65,
            "spatial": 78,
            "field": 67
          },
          "riskScore": 63,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 81
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 75
            },
            {
              "key": "field",
              "label": "익명 현장 체류·복귀 지연 신호",
              "score": 67
            }
          ],
          "recommendationIds": [
            "return-guidance",
            "facility-review",
            "visitor-prealert",
            "field-broadcast"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T23:00:00+09:00",
          "time": "23:00",
          "rawSignals": {
            "tideCm": 710,
            "minutesToHighTide": -47,
            "tideDeltaCmPerHour": -25,
            "windMps": 3.08,
            "windGustMps": 4.19,
            "rainMm": 0,
            "temperature2m": 17,
            "visibilityM": 2640,
            "visitorIndex": 143,
            "visitorChangePct": -9,
            "anonymousCrowdCount": 39,
            "avgStayMinutes": 29,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 52,
            "weather": 9,
            "visitor": 50,
            "history": 65,
            "spatial": 78,
            "field": 45
          },
          "riskScore": 48,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 52
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 50
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-11T00:00:00+09:00",
          "time": "00:00",
          "rawSignals": {
            "tideCm": 672,
            "minutesToHighTide": -107,
            "tideDeltaCmPerHour": -38,
            "windMps": 3.83,
            "windGustMps": 4.69,
            "rainMm": 0,
            "temperature2m": 17,
            "visibilityM": 2820,
            "visitorIndex": 116,
            "visitorChangePct": -19,
            "anonymousCrowdCount": 25,
            "avgStayMinutes": 22,
            "returnDelayGroups": 0,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 26,
            "weather": 15,
            "visitor": 26,
            "history": 65,
            "spatial": 78,
            "field": 21
          },
          "riskScore": 35,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 26
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 26
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        }
      ],
      "effectBaseline": {
        "stayReductionPct": 18,
        "accessReductionPct": 12,
        "agencyShares": 3,
        "nextImprovement": "안내판 위치 조정, 야간 조명 보강"
      }
    },
    {
      "id": "A02",
      "name": "탄도항 후보 구역",
      "officialName": "탄도항",
      "type": "항구·방파제",
      "district": "단원구 대부동",
      "lat": 37.1921428,
      "lng": 126.6431133,
      "manager": "안산시 시범 운영 후보",
      "authority": "안산시 안내 + 관계기관 공유",
      "channels": [
        "관광안내 채널",
        "관계기관 공유"
      ],
      "riskContext": [
        "항구",
        "방파제",
        "낚시객",
        "갯벌 접근",
        "관광객 집중"
      ],
      "dominantAccidentTypes": [
        "추락",
        "익수"
      ],
      "pilotPriority": "P0",
      "dataStatus": {
        "coordinate": "verified_osm",
        "tide": "pending_api",
        "weather": "ready_open_meteo_pending_kma",
        "population": "pending_api",
        "accidentHistory": "national_prior_ready_local_pending"
      },
      "geocode": {
        "source": "openstreetmap_nominatim",
        "status": "matched",
        "matchedQuery": "탄도항 안산",
        "displayName": "탄도항, 대부동, 단원구, 안산시, 경기도, 대한민국",
        "osmType": "way",
        "osmId": 1436691519
      },
      "historyPrior": {
        "sourceModel": "history_prior_model_v0",
        "accidentTypes": [
          "추락",
          "익수"
        ],
        "priorScore": 73,
        "components": [
          {
            "accidentType": "추락",
            "priorScore": 73,
            "incidentMean": 214.8,
            "fatalityRatePct": 18.2,
            "riskBand": "주의"
          },
          {
            "accidentType": "익수",
            "priorScore": 72,
            "incidentMean": 150,
            "fatalityRatePct": 40.9,
            "riskBand": "주의"
          }
        ]
      },
      "series": [
        {
          "datetime": "2026-06-10T19:00:00+09:00",
          "time": "19:00",
          "rawSignals": {
            "tideCm": 601,
            "minutesToHighTide": 172,
            "tideDeltaCmPerHour": 28,
            "windMps": 5.78,
            "windGustMps": 9.61,
            "rainMm": 0,
            "temperature2m": 19,
            "visibilityM": 1320,
            "visitorIndex": 118,
            "visitorChangePct": 18,
            "anonymousCrowdCount": 27,
            "avgStayMinutes": 23,
            "returnDelayGroups": 0,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 31,
            "weather": 31,
            "visitor": 43,
            "history": 73,
            "spatial": 72,
            "field": 24
          },
          "riskScore": 43,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 73
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 72
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 43
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 31
            }
          ],
          "recommendationIds": [
            "agency-share",
            "facility-review",
            "visitor-prealert",
            "return-guidance"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T20:00:00+09:00",
          "time": "20:00",
          "rawSignals": {
            "tideCm": 632,
            "minutesToHighTide": 112,
            "tideDeltaCmPerHour": 31,
            "windMps": 4.75,
            "windGustMps": 8.19,
            "rainMm": 0,
            "temperature2m": 17.9,
            "visibilityM": 760,
            "visitorIndex": 132,
            "visitorChangePct": 24,
            "anonymousCrowdCount": 32,
            "avgStayMinutes": 26,
            "returnDelayGroups": 1,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 53,
            "weather": 23,
            "visitor": 55,
            "history": 73,
            "spatial": 72,
            "field": 37
          },
          "riskScore": 51,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 73
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 72
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 55
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 53
            }
          ],
          "recommendationIds": [
            "agency-share",
            "facility-review",
            "visitor-prealert",
            "return-guidance"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T21:00:00+09:00",
          "time": "21:00",
          "rawSignals": {
            "tideCm": 660,
            "minutesToHighTide": 52,
            "tideDeltaCmPerHour": 28,
            "windMps": 4.19,
            "windGustMps": 5.89,
            "rainMm": 0,
            "temperature2m": 16.6,
            "visibilityM": 840,
            "visitorIndex": 142,
            "visitorChangePct": 31,
            "anonymousCrowdCount": 38,
            "avgStayMinutes": 30,
            "returnDelayGroups": 1,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 73,
            "weather": 18,
            "visitor": 65,
            "history": 73,
            "spatial": 72,
            "field": 45
          },
          "riskScore": 58,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 73
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 73
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 72
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 65
            }
          ],
          "recommendationIds": [
            "return-guidance",
            "agency-share",
            "facility-review",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T22:00:00+09:00",
          "time": "22:00",
          "rawSignals": {
            "tideCm": 671,
            "minutesToHighTide": 17,
            "tideDeltaCmPerHour": 11,
            "windMps": 3.31,
            "windGustMps": 4.39,
            "rainMm": 0,
            "temperature2m": 16.4,
            "visibilityM": 1420,
            "visitorIndex": 136,
            "visitorChangePct": -4,
            "anonymousCrowdCount": 34,
            "avgStayMinutes": 27,
            "returnDelayGroups": 1,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 78,
            "weather": 11,
            "visitor": 47,
            "history": 73,
            "spatial": 72,
            "field": 40
          },
          "riskScore": 54,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 73
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 72
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 47
            }
          ],
          "recommendationIds": [
            "return-guidance",
            "agency-share",
            "facility-review",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T23:00:00+09:00",
          "time": "23:00",
          "rawSignals": {
            "tideCm": 648,
            "minutesToHighTide": -43,
            "tideDeltaCmPerHour": -23,
            "windMps": 3.11,
            "windGustMps": 4.19,
            "rainMm": 0,
            "temperature2m": 16.5,
            "visibilityM": 2640,
            "visitorIndex": 124,
            "visitorChangePct": -9,
            "anonymousCrowdCount": 28,
            "avgStayMinutes": 21,
            "returnDelayGroups": 0,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 54,
            "weather": 9,
            "visitor": 36,
            "history": 73,
            "spatial": 72,
            "field": 22
          },
          "riskScore": 43,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 73
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 72
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 54
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 36
            }
          ],
          "recommendationIds": [
            "agency-share",
            "facility-review",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-11T00:00:00+09:00",
          "time": "00:00",
          "rawSignals": {
            "tideCm": 613,
            "minutesToHighTide": -103,
            "tideDeltaCmPerHour": -35,
            "windMps": 3.83,
            "windGustMps": 4.69,
            "rainMm": 0,
            "temperature2m": 16.6,
            "visibilityM": 2820,
            "visitorIndex": 102,
            "visitorChangePct": -18,
            "anonymousCrowdCount": 19,
            "avgStayMinutes": 18,
            "returnDelayGroups": 0,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 29,
            "weather": 15,
            "visitor": 17,
            "history": 73,
            "spatial": 72,
            "field": 14
          },
          "riskScore": 34,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 73
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 72
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 29
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 17
            }
          ],
          "recommendationIds": [
            "agency-share",
            "facility-review",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        }
      ],
      "effectBaseline": {
        "stayReductionPct": 11,
        "accessReductionPct": 8,
        "agencyShares": 2,
        "nextImprovement": "방파제 접근 주의 문구 보강"
      }
    },
    {
      "id": "A03",
      "name": "시화방조제 후보 구역",
      "officialName": "시화방조제",
      "type": "시화호·방조제 인근",
      "district": "단원구 대부동 인근",
      "lat": 37.3142,
      "lng": 126.6086,
      "manager": "안산시 시범 운영 후보",
      "authority": "안산시 안내 + 관계기관 공유",
      "channels": [
        "관광안내 채널",
        "관계기관 공유"
      ],
      "riskContext": [
        "방조제",
        "해안도로",
        "낚시·관광",
        "관리주체 확인 필요"
      ],
      "dominantAccidentTypes": [
        "추락",
        "고립"
      ],
      "pilotPriority": "P0",
      "dataStatus": {
        "coordinate": "fallback_needs_official_verification",
        "tide": "pending_api",
        "weather": "ready_open_meteo_pending_kma",
        "population": "pending_api",
        "accidentHistory": "national_prior_ready_local_pending"
      },
      "geocode": {
        "source": "fallback_coordinate",
        "status": "no_result",
        "matchedQuery": null,
        "displayName": null,
        "osmType": null,
        "osmId": null
      },
      "historyPrior": {
        "sourceModel": "history_prior_model_v0",
        "accidentTypes": [
          "추락",
          "고립"
        ],
        "priorScore": 65,
        "components": [
          {
            "accidentType": "추락",
            "priorScore": 73,
            "incidentMean": 214.8,
            "fatalityRatePct": 18.2,
            "riskBand": "주의"
          },
          {
            "accidentType": "고립",
            "priorScore": 57,
            "incidentMean": 200.8,
            "fatalityRatePct": 3.7,
            "riskBand": "주의"
          }
        ]
      },
      "series": [
        {
          "datetime": "2026-06-10T19:00:00+09:00",
          "time": "19:00",
          "rawSignals": {
            "tideCm": 590,
            "minutesToHighTide": 184,
            "tideDeltaCmPerHour": 24,
            "windMps": 5.92,
            "windGustMps": 9.61,
            "rainMm": 0,
            "temperature2m": 19.2,
            "visibilityM": 1320,
            "visitorIndex": 108,
            "visitorChangePct": 14,
            "anonymousCrowdCount": 19,
            "avgStayMinutes": 20,
            "returnDelayGroups": 0,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 27,
            "weather": 32,
            "visitor": 34,
            "history": 65,
            "spatial": 68,
            "field": 16
          },
          "riskScore": 38,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 68
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 34
            },
            {
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 32
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "visitor-prealert",
            "wind-warning"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T20:00:00+09:00",
          "time": "20:00",
          "rawSignals": {
            "tideCm": 617,
            "minutesToHighTide": 124,
            "tideDeltaCmPerHour": 27,
            "windMps": 4.78,
            "windGustMps": 8.19,
            "rainMm": 0,
            "temperature2m": 17.4,
            "visibilityM": 760,
            "visitorIndex": 121,
            "visitorChangePct": 19,
            "anonymousCrowdCount": 23,
            "avgStayMinutes": 23,
            "returnDelayGroups": 0,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 48,
            "weather": 23,
            "visitor": 45,
            "history": 65,
            "spatial": 68,
            "field": 21
          },
          "riskScore": 44,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 68
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 48
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 45
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T21:00:00+09:00",
          "time": "21:00",
          "rawSignals": {
            "tideCm": 642,
            "minutesToHighTide": 64,
            "tideDeltaCmPerHour": 25,
            "windMps": 4.19,
            "windGustMps": 5.89,
            "rainMm": 0,
            "temperature2m": 16.7,
            "visibilityM": 840,
            "visitorIndex": 127,
            "visitorChangePct": 22,
            "anonymousCrowdCount": 26,
            "avgStayMinutes": 25,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 67,
            "weather": 18,
            "visitor": 51,
            "history": 65,
            "spatial": 68,
            "field": 33
          },
          "riskScore": 51,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 68
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 67
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 51
            }
          ],
          "recommendationIds": [
            "facility-review",
            "return-guidance",
            "agency-share",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T22:00:00+09:00",
          "time": "22:00",
          "rawSignals": {
            "tideCm": 653,
            "minutesToHighTide": 24,
            "tideDeltaCmPerHour": 11,
            "windMps": 3,
            "windGustMps": 4.39,
            "rainMm": 0,
            "temperature2m": 16.5,
            "visibilityM": 1420,
            "visitorIndex": 119,
            "visitorChangePct": -6,
            "anonymousCrowdCount": 24,
            "avgStayMinutes": 24,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 75,
            "weather": 8,
            "visitor": 34,
            "history": 65,
            "spatial": 68,
            "field": 30
          },
          "riskScore": 47,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 75
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 68
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 34
            }
          ],
          "recommendationIds": [
            "return-guidance",
            "facility-review",
            "agency-share",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T23:00:00+09:00",
          "time": "23:00",
          "rawSignals": {
            "tideCm": 630,
            "minutesToHighTide": -36,
            "tideDeltaCmPerHour": -23,
            "windMps": 2.97,
            "windGustMps": 4.19,
            "rainMm": 0,
            "temperature2m": 17,
            "visibilityM": 2640,
            "visitorIndex": 106,
            "visitorChangePct": -11,
            "anonymousCrowdCount": 20,
            "avgStayMinutes": 19,
            "returnDelayGroups": 0,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 57,
            "weather": 8,
            "visitor": 22,
            "history": 65,
            "spatial": 68,
            "field": 15
          },
          "riskScore": 39,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 68
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 57
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 22
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-11T00:00:00+09:00",
          "time": "00:00",
          "rawSignals": {
            "tideCm": 594,
            "minutesToHighTide": -96,
            "tideDeltaCmPerHour": -36,
            "windMps": 3.75,
            "windGustMps": 4.69,
            "rainMm": 0,
            "temperature2m": 17,
            "visibilityM": 2820,
            "visitorIndex": 92,
            "visitorChangePct": -13,
            "anonymousCrowdCount": 13,
            "avgStayMinutes": 16,
            "returnDelayGroups": 0,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 31,
            "weather": 14,
            "visitor": 11,
            "history": 65,
            "spatial": 68,
            "field": 8
          },
          "riskScore": 31,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 68
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 31
            },
            {
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 14
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "wind-warning"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        }
      ],
      "effectBaseline": {
        "stayReductionPct": 7,
        "accessReductionPct": 5,
        "agencyShares": 1,
        "nextImprovement": "관할 관리주체와 안내 채널 확인"
      }
    },
    {
      "id": "A04",
      "name": "구봉도 후보 구역",
      "officialName": "구봉도 낙조전망대 인근",
      "type": "해안 산책·전망 지점",
      "district": "단원구 대부북동",
      "lat": 37.2842587,
      "lng": 126.5423229,
      "manager": "확장 후보",
      "authority": "안산시 안내 + 관계기관 공유",
      "channels": [
        "관광안내 채널",
        "관계기관 공유"
      ],
      "riskContext": [
        "해안 산책",
        "일몰 시간대 체류",
        "갯바위·해안 접근"
      ],
      "dominantAccidentTypes": [
        "추락",
        "익수"
      ],
      "pilotPriority": "P1",
      "dataStatus": {
        "coordinate": "manual_candidate_needs_verification",
        "tide": "pending_api",
        "weather": "pending_collection",
        "population": "pending_api",
        "accidentHistory": "national_prior_ready_local_pending"
      },
      "geocode": {
        "source": "openstreetmap_nominatim",
        "status": "matched",
        "matchedQuery": "구봉도 안산",
        "displayName": "구봉도, 대부동, 단원구, 안산시, 경기도, 대한민국",
        "osmType": "way",
        "osmId": 1504176569
      },
      "historyPrior": {
        "sourceModel": "history_prior_model_v0",
        "accidentTypes": [
          "추락",
          "익수"
        ],
        "priorScore": 73,
        "components": [
          {
            "accidentType": "추락",
            "priorScore": 73,
            "incidentMean": 214.8,
            "fatalityRatePct": 18.2,
            "riskBand": "주의"
          },
          {
            "accidentType": "익수",
            "priorScore": 72,
            "incidentMean": 150,
            "fatalityRatePct": 40.9,
            "riskBand": "주의"
          }
        ]
      },
      "series": [
        {
          "datetime": "2026-06-10T19:00:00+09:00",
          "time": "19:00",
          "rawSignals": {
            "tideCm": 642,
            "minutesToHighTide": 167,
            "tideDeltaCmPerHour": 38,
            "windMps": 5.86,
            "windGustMps": 9.61,
            "rainMm": 0,
            "temperature2m": 18.6,
            "visibilityM": 1320,
            "visitorIndex": 108,
            "visitorChangePct": 20,
            "anonymousCrowdCount": 20,
            "avgStayMinutes": 20,
            "returnDelayGroups": 1,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 37,
            "weather": 32,
            "visitor": 36,
            "history": 73,
            "spatial": 78,
            "field": 24
          },
          "riskScore": 44,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 73
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 37
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 36
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T20:00:00+09:00",
          "time": "20:00",
          "rawSignals": {
            "tideCm": 681,
            "minutesToHighTide": 107,
            "tideDeltaCmPerHour": 42,
            "windMps": 5.14,
            "windGustMps": 8.19,
            "rainMm": 0,
            "temperature2m": 16.7,
            "visibilityM": 760,
            "visitorIndex": 124,
            "visitorChangePct": 25,
            "anonymousCrowdCount": 27,
            "avgStayMinutes": 25,
            "returnDelayGroups": 1,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 60,
            "weather": 26,
            "visitor": 50,
            "history": 73,
            "spatial": 78,
            "field": 33
          },
          "riskScore": 53,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 73
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 60
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 50
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T21:00:00+09:00",
          "time": "21:00",
          "rawSignals": {
            "tideCm": 719,
            "minutesToHighTide": 47,
            "tideDeltaCmPerHour": 44,
            "windMps": 4.61,
            "windGustMps": 5.89,
            "rainMm": 0,
            "temperature2m": 16.3,
            "visibilityM": 840,
            "visitorIndex": 135,
            "visitorChangePct": 31,
            "anonymousCrowdCount": 38,
            "avgStayMinutes": 31,
            "returnDelayGroups": 2,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 81,
            "weather": 21,
            "visitor": 60,
            "history": 73,
            "spatial": 78,
            "field": 54
          },
          "riskScore": 61,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 81
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 73
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 60
            }
          ],
          "recommendationIds": [
            "return-guidance",
            "facility-review",
            "agency-share",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T22:00:00+09:00",
          "time": "22:00",
          "rawSignals": {
            "tideCm": 735,
            "minutesToHighTide": 13,
            "tideDeltaCmPerHour": 16,
            "windMps": 3.06,
            "windGustMps": 4.39,
            "rainMm": 0,
            "temperature2m": 16.4,
            "visibilityM": 1420,
            "visitorIndex": 130,
            "visitorChangePct": 19,
            "anonymousCrowdCount": 34,
            "avgStayMinutes": 29,
            "returnDelayGroups": 1,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 81,
            "weather": 9,
            "visitor": 52,
            "history": 73,
            "spatial": 78,
            "field": 42
          },
          "riskScore": 56,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 81
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 73
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 52
            }
          ],
          "recommendationIds": [
            "return-guidance",
            "facility-review",
            "agency-share",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T23:00:00+09:00",
          "time": "23:00",
          "rawSignals": {
            "tideCm": 710,
            "minutesToHighTide": -47,
            "tideDeltaCmPerHour": -25,
            "windMps": 3.08,
            "windGustMps": 4.19,
            "rainMm": 0,
            "temperature2m": 16.8,
            "visibilityM": 2640,
            "visitorIndex": 117,
            "visitorChangePct": -6,
            "anonymousCrowdCount": 25,
            "avgStayMinutes": 24,
            "returnDelayGroups": 1,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 52,
            "weather": 9,
            "visitor": 32,
            "history": 73,
            "spatial": 78,
            "field": 31
          },
          "riskScore": 44,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 73
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 52
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 32
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-11T00:00:00+09:00",
          "time": "00:00",
          "rawSignals": {
            "tideCm": 672,
            "minutesToHighTide": -107,
            "tideDeltaCmPerHour": -38,
            "windMps": 3.83,
            "windGustMps": 4.69,
            "rainMm": 0,
            "temperature2m": 16.8,
            "visibilityM": 2820,
            "visitorIndex": 95,
            "visitorChangePct": -13,
            "anonymousCrowdCount": 16,
            "avgStayMinutes": 18,
            "returnDelayGroups": 0,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 26,
            "weather": 15,
            "visitor": 14,
            "history": 73,
            "spatial": 78,
            "field": 12
          },
          "riskScore": 33,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 73
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 26
            },
            {
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 15
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "wind-warning"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        }
      ]
    },
    {
      "id": "A05",
      "name": "대부바다향기테마파크 후보 구역",
      "officialName": "대부바다향기테마파크 인근",
      "type": "관광지·해안 접근부",
      "district": "단원구 대부북동",
      "lat": 37.2817424,
      "lng": 126.5783908,
      "manager": "확장 후보",
      "authority": "안산시 안내 + 관계기관 공유",
      "channels": [
        "관광안내 채널",
        "관계기관 공유"
      ],
      "riskContext": [
        "관광객 집중",
        "주차장",
        "해안 접근",
        "가족 단위 방문"
      ],
      "dominantAccidentTypes": [
        "고립",
        "익수"
      ],
      "pilotPriority": "P1",
      "dataStatus": {
        "coordinate": "manual_candidate_needs_verification",
        "tide": "pending_api",
        "weather": "pending_collection",
        "population": "pending_api",
        "accidentHistory": "national_prior_ready_local_pending"
      },
      "geocode": {
        "source": "openstreetmap_nominatim",
        "status": "matched",
        "matchedQuery": "대부바다향기테마파크 안산",
        "displayName": "대부바다향기테마파크, 단원구, 안산시, 경기도, 대한민국",
        "osmType": "way",
        "osmId": 1509669851
      },
      "historyPrior": {
        "sourceModel": "history_prior_model_v0",
        "accidentTypes": [
          "고립",
          "익수"
        ],
        "priorScore": 65,
        "components": [
          {
            "accidentType": "고립",
            "priorScore": 57,
            "incidentMean": 200.8,
            "fatalityRatePct": 3.7,
            "riskBand": "주의"
          },
          {
            "accidentType": "익수",
            "priorScore": 72,
            "incidentMean": 150,
            "fatalityRatePct": 40.9,
            "riskBand": "주의"
          }
        ]
      },
      "series": [
        {
          "datetime": "2026-06-10T19:00:00+09:00",
          "time": "19:00",
          "rawSignals": {
            "tideCm": 642,
            "minutesToHighTide": 167,
            "tideDeltaCmPerHour": 38,
            "windMps": 5.86,
            "windGustMps": 9.61,
            "rainMm": 0,
            "temperature2m": 18.7,
            "visibilityM": 1320,
            "visitorIndex": 108,
            "visitorChangePct": 20,
            "anonymousCrowdCount": 20,
            "avgStayMinutes": 20,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 37,
            "weather": 32,
            "visitor": 36,
            "history": 65,
            "spatial": 78,
            "field": 24
          },
          "riskScore": 43,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 37
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 36
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T20:00:00+09:00",
          "time": "20:00",
          "rawSignals": {
            "tideCm": 681,
            "minutesToHighTide": 107,
            "tideDeltaCmPerHour": 42,
            "windMps": 5.14,
            "windGustMps": 8.19,
            "rainMm": 0,
            "temperature2m": 16.9,
            "visibilityM": 760,
            "visitorIndex": 124,
            "visitorChangePct": 25,
            "anonymousCrowdCount": 27,
            "avgStayMinutes": 25,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 60,
            "weather": 26,
            "visitor": 50,
            "history": 65,
            "spatial": 78,
            "field": 33
          },
          "riskScore": 51,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 60
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 50
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T21:00:00+09:00",
          "time": "21:00",
          "rawSignals": {
            "tideCm": 719,
            "minutesToHighTide": 47,
            "tideDeltaCmPerHour": 44,
            "windMps": 4.61,
            "windGustMps": 5.89,
            "rainMm": 0,
            "temperature2m": 16.5,
            "visibilityM": 840,
            "visitorIndex": 135,
            "visitorChangePct": 31,
            "anonymousCrowdCount": 38,
            "avgStayMinutes": 31,
            "returnDelayGroups": 2,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 81,
            "weather": 21,
            "visitor": 60,
            "history": 65,
            "spatial": 78,
            "field": 54
          },
          "riskScore": 60,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 81
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 60
            }
          ],
          "recommendationIds": [
            "return-guidance",
            "facility-review",
            "agency-share",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T22:00:00+09:00",
          "time": "22:00",
          "rawSignals": {
            "tideCm": 735,
            "minutesToHighTide": 13,
            "tideDeltaCmPerHour": 16,
            "windMps": 3.06,
            "windGustMps": 4.39,
            "rainMm": 0,
            "temperature2m": 16.5,
            "visibilityM": 1420,
            "visitorIndex": 130,
            "visitorChangePct": 19,
            "anonymousCrowdCount": 34,
            "avgStayMinutes": 29,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 81,
            "weather": 9,
            "visitor": 52,
            "history": 65,
            "spatial": 78,
            "field": 42
          },
          "riskScore": 55,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 81
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 52
            }
          ],
          "recommendationIds": [
            "return-guidance",
            "facility-review",
            "agency-share",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T23:00:00+09:00",
          "time": "23:00",
          "rawSignals": {
            "tideCm": 710,
            "minutesToHighTide": -47,
            "tideDeltaCmPerHour": -25,
            "windMps": 3.08,
            "windGustMps": 4.19,
            "rainMm": 0,
            "temperature2m": 17,
            "visibilityM": 2640,
            "visitorIndex": 117,
            "visitorChangePct": -6,
            "anonymousCrowdCount": 25,
            "avgStayMinutes": 24,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 52,
            "weather": 9,
            "visitor": 32,
            "history": 65,
            "spatial": 78,
            "field": 31
          },
          "riskScore": 43,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 52
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 32
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-11T00:00:00+09:00",
          "time": "00:00",
          "rawSignals": {
            "tideCm": 672,
            "minutesToHighTide": -107,
            "tideDeltaCmPerHour": -38,
            "windMps": 3.83,
            "windGustMps": 4.69,
            "rainMm": 0,
            "temperature2m": 17,
            "visibilityM": 2820,
            "visitorIndex": 95,
            "visitorChangePct": -13,
            "anonymousCrowdCount": 16,
            "avgStayMinutes": 18,
            "returnDelayGroups": 0,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 26,
            "weather": 15,
            "visitor": 14,
            "history": 65,
            "spatial": 78,
            "field": 12
          },
          "riskScore": 32,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 26
            },
            {
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 15
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "wind-warning"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        }
      ]
    },
    {
      "id": "A06",
      "name": "선감도 후보 구역",
      "officialName": "선감도·선감어촌체험마을 인근",
      "type": "갯벌체험·어촌체험",
      "district": "단원구 선감동",
      "lat": 37.2238987,
      "lng": 126.6378667,
      "manager": "확장 후보",
      "authority": "안산시 안내 + 관계기관 공유",
      "channels": [
        "관광안내 채널",
        "관계기관 공유"
      ],
      "riskContext": [
        "갯벌체험",
        "체험객",
        "조위 영향",
        "복귀 지연 위험"
      ],
      "dominantAccidentTypes": [
        "고립",
        "익수"
      ],
      "pilotPriority": "P1",
      "dataStatus": {
        "coordinate": "manual_candidate_needs_verification",
        "tide": "pending_api",
        "weather": "pending_collection",
        "population": "pending_api",
        "accidentHistory": "national_prior_ready_local_pending"
      },
      "geocode": {
        "source": "openstreetmap_nominatim",
        "status": "matched",
        "matchedQuery": "선감도 안산",
        "displayName": "선감도, 선감동, 대부동, 단원구, 안산시, 경기도, 대한민국",
        "osmType": "way",
        "osmId": 1435253061
      },
      "historyPrior": {
        "sourceModel": "history_prior_model_v0",
        "accidentTypes": [
          "고립",
          "익수"
        ],
        "priorScore": 65,
        "components": [
          {
            "accidentType": "고립",
            "priorScore": 57,
            "incidentMean": 200.8,
            "fatalityRatePct": 3.7,
            "riskBand": "주의"
          },
          {
            "accidentType": "익수",
            "priorScore": 72,
            "incidentMean": 150,
            "fatalityRatePct": 40.9,
            "riskBand": "주의"
          }
        ]
      },
      "series": [
        {
          "datetime": "2026-06-10T19:00:00+09:00",
          "time": "19:00",
          "rawSignals": {
            "tideCm": 642,
            "minutesToHighTide": 167,
            "tideDeltaCmPerHour": 38,
            "windMps": 5.78,
            "windGustMps": 9.61,
            "rainMm": 0,
            "temperature2m": 18.7,
            "visibilityM": 1320,
            "visitorIndex": 108,
            "visitorChangePct": 20,
            "anonymousCrowdCount": 20,
            "avgStayMinutes": 20,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 37,
            "weather": 31,
            "visitor": 36,
            "history": 65,
            "spatial": 78,
            "field": 24
          },
          "riskScore": 43,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 37
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 36
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T20:00:00+09:00",
          "time": "20:00",
          "rawSignals": {
            "tideCm": 681,
            "minutesToHighTide": 107,
            "tideDeltaCmPerHour": 42,
            "windMps": 4.75,
            "windGustMps": 8.19,
            "rainMm": 0,
            "temperature2m": 17.6,
            "visibilityM": 760,
            "visitorIndex": 124,
            "visitorChangePct": 25,
            "anonymousCrowdCount": 27,
            "avgStayMinutes": 25,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 60,
            "weather": 23,
            "visitor": 50,
            "history": 65,
            "spatial": 78,
            "field": 33
          },
          "riskScore": 51,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 60
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 50
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T21:00:00+09:00",
          "time": "21:00",
          "rawSignals": {
            "tideCm": 719,
            "minutesToHighTide": 47,
            "tideDeltaCmPerHour": 44,
            "windMps": 4.19,
            "windGustMps": 5.89,
            "rainMm": 0,
            "temperature2m": 16.3,
            "visibilityM": 840,
            "visitorIndex": 135,
            "visitorChangePct": 31,
            "anonymousCrowdCount": 38,
            "avgStayMinutes": 31,
            "returnDelayGroups": 2,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 81,
            "weather": 18,
            "visitor": 60,
            "history": 65,
            "spatial": 78,
            "field": 54
          },
          "riskScore": 60,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 81
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 60
            }
          ],
          "recommendationIds": [
            "return-guidance",
            "facility-review",
            "agency-share",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T22:00:00+09:00",
          "time": "22:00",
          "rawSignals": {
            "tideCm": 735,
            "minutesToHighTide": 13,
            "tideDeltaCmPerHour": 16,
            "windMps": 3.31,
            "windGustMps": 4.39,
            "rainMm": 0,
            "temperature2m": 16.1,
            "visibilityM": 1420,
            "visitorIndex": 130,
            "visitorChangePct": 19,
            "anonymousCrowdCount": 34,
            "avgStayMinutes": 29,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 81,
            "weather": 11,
            "visitor": 52,
            "history": 65,
            "spatial": 78,
            "field": 42
          },
          "riskScore": 56,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 81
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 52
            }
          ],
          "recommendationIds": [
            "return-guidance",
            "facility-review",
            "agency-share",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T23:00:00+09:00",
          "time": "23:00",
          "rawSignals": {
            "tideCm": 710,
            "minutesToHighTide": -47,
            "tideDeltaCmPerHour": -25,
            "windMps": 3.11,
            "windGustMps": 4.19,
            "rainMm": 0,
            "temperature2m": 16.2,
            "visibilityM": 2640,
            "visitorIndex": 117,
            "visitorChangePct": -6,
            "anonymousCrowdCount": 25,
            "avgStayMinutes": 24,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 52,
            "weather": 9,
            "visitor": 32,
            "history": 65,
            "spatial": 78,
            "field": 31
          },
          "riskScore": 43,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 52
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 32
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-11T00:00:00+09:00",
          "time": "00:00",
          "rawSignals": {
            "tideCm": 672,
            "minutesToHighTide": -107,
            "tideDeltaCmPerHour": -38,
            "windMps": 3.83,
            "windGustMps": 4.69,
            "rainMm": 0,
            "temperature2m": 16.3,
            "visibilityM": 2820,
            "visitorIndex": 95,
            "visitorChangePct": -13,
            "anonymousCrowdCount": 16,
            "avgStayMinutes": 18,
            "returnDelayGroups": 0,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 26,
            "weather": 15,
            "visitor": 14,
            "history": 65,
            "spatial": 78,
            "field": 12
          },
          "riskScore": 32,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 65
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 26
            },
            {
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 15
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "wind-warning"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        }
      ]
    },
    {
      "id": "A07",
      "name": "풍도 후보 구역",
      "officialName": "풍도 선착장 인근",
      "type": "도서·선착장",
      "district": "단원구 풍도동",
      "lat": 37.1078592,
      "lng": 126.3870468,
      "manager": "확장 후보",
      "authority": "안산시 안내 + 관계기관 공유",
      "channels": [
        "관광안내 채널",
        "관계기관 공유"
      ],
      "riskContext": [
        "도서",
        "선착장",
        "기상 영향",
        "관계기관 협업"
      ],
      "dominantAccidentTypes": [
        "추락",
        "표류"
      ],
      "pilotPriority": "P2",
      "dataStatus": {
        "coordinate": "manual_candidate_needs_verification",
        "tide": "pending_api",
        "weather": "pending_collection",
        "population": "pending_api",
        "accidentHistory": "national_prior_ready_local_pending"
      },
      "geocode": {
        "source": "openstreetmap_nominatim",
        "status": "matched",
        "matchedQuery": "풍도 안산",
        "displayName": "풍도, 단원구, 안산시, 경기도, 15654, 대한민국",
        "osmType": "way",
        "osmId": 22785935
      },
      "historyPrior": {
        "sourceModel": "history_prior_model_v0",
        "accidentTypes": [
          "추락",
          "표류"
        ],
        "priorScore": 51,
        "components": [
          {
            "accidentType": "추락",
            "priorScore": 73,
            "incidentMean": 214.8,
            "fatalityRatePct": 18.2,
            "riskBand": "주의"
          },
          {
            "accidentType": "표류",
            "priorScore": 28,
            "incidentMean": 34,
            "fatalityRatePct": 0,
            "riskBand": "보통"
          }
        ]
      },
      "series": [
        {
          "datetime": "2026-06-10T19:00:00+09:00",
          "time": "19:00",
          "rawSignals": {
            "tideCm": 642,
            "minutesToHighTide": 167,
            "tideDeltaCmPerHour": 38,
            "windMps": 5.53,
            "windGustMps": 8.11,
            "rainMm": 0,
            "temperature2m": 16.7,
            "visibilityM": 3640,
            "visitorIndex": 108,
            "visitorChangePct": 20,
            "anonymousCrowdCount": 20,
            "avgStayMinutes": 20,
            "returnDelayGroups": 1,
            "historyPriorScore": 51
          },
          "factorScores": {
            "tide": 37,
            "weather": 29,
            "visitor": 36,
            "history": 51,
            "spatial": 78,
            "field": 24
          },
          "riskScore": 41,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 51
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 37
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 36
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T20:00:00+09:00",
          "time": "20:00",
          "rawSignals": {
            "tideCm": 681,
            "minutesToHighTide": 107,
            "tideDeltaCmPerHour": 42,
            "windMps": 5.56,
            "windGustMps": 6.69,
            "rainMm": 0,
            "temperature2m": 15.1,
            "visibilityM": 1000,
            "visitorIndex": 124,
            "visitorChangePct": 25,
            "anonymousCrowdCount": 27,
            "avgStayMinutes": 25,
            "returnDelayGroups": 1,
            "historyPriorScore": 51
          },
          "factorScores": {
            "tide": 60,
            "weather": 29,
            "visitor": 50,
            "history": 51,
            "spatial": 78,
            "field": 33
          },
          "riskScore": 50,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 60
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 51
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 50
            }
          ],
          "recommendationIds": [
            "facility-review",
            "return-guidance",
            "agency-share",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T21:00:00+09:00",
          "time": "21:00",
          "rawSignals": {
            "tideCm": 719,
            "minutesToHighTide": 47,
            "tideDeltaCmPerHour": 44,
            "windMps": 5.14,
            "windGustMps": 4.81,
            "rainMm": 0,
            "temperature2m": 14.9,
            "visibilityM": 740,
            "visitorIndex": 135,
            "visitorChangePct": 31,
            "anonymousCrowdCount": 38,
            "avgStayMinutes": 31,
            "returnDelayGroups": 2,
            "historyPriorScore": 51
          },
          "factorScores": {
            "tide": 81,
            "weather": 26,
            "visitor": 60,
            "history": 51,
            "spatial": 78,
            "field": 54
          },
          "riskScore": 59,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 81
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 60
            },
            {
              "key": "field",
              "label": "익명 현장 체류·복귀 지연 신호",
              "score": 54
            }
          ],
          "recommendationIds": [
            "return-guidance",
            "facility-review",
            "visitor-prealert",
            "field-broadcast"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T22:00:00+09:00",
          "time": "22:00",
          "rawSignals": {
            "tideCm": 735,
            "minutesToHighTide": 13,
            "tideDeltaCmPerHour": 16,
            "windMps": 4.14,
            "windGustMps": 3.81,
            "rainMm": 0,
            "temperature2m": 14.4,
            "visibilityM": 760,
            "visitorIndex": 130,
            "visitorChangePct": 19,
            "anonymousCrowdCount": 34,
            "avgStayMinutes": 29,
            "returnDelayGroups": 1,
            "historyPriorScore": 51
          },
          "factorScores": {
            "tide": 81,
            "weather": 18,
            "visitor": 52,
            "history": 51,
            "spatial": 78,
            "field": 42
          },
          "riskScore": 55,
          "riskLevel": "주의",
          "reasons": [
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 81
            },
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 52
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 51
            }
          ],
          "recommendationIds": [
            "return-guidance",
            "facility-review",
            "visitor-prealert",
            "agency-share"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-10T23:00:00+09:00",
          "time": "23:00",
          "rawSignals": {
            "tideCm": 710,
            "minutesToHighTide": -47,
            "tideDeltaCmPerHour": -25,
            "windMps": 3.81,
            "windGustMps": 3.31,
            "rainMm": 0,
            "temperature2m": 15.1,
            "visibilityM": 900,
            "visitorIndex": 117,
            "visitorChangePct": -6,
            "anonymousCrowdCount": 25,
            "avgStayMinutes": 24,
            "returnDelayGroups": 1,
            "historyPriorScore": 51
          },
          "factorScores": {
            "tide": 52,
            "weather": 15,
            "visitor": 32,
            "history": 51,
            "spatial": 78,
            "field": 31
          },
          "riskScore": 42,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 52
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 51
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 32
            }
          ],
          "recommendationIds": [
            "facility-review",
            "return-guidance",
            "agency-share",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-06-11T00:00:00+09:00",
          "time": "00:00",
          "rawSignals": {
            "tideCm": 672,
            "minutesToHighTide": -107,
            "tideDeltaCmPerHour": -38,
            "windMps": 4.28,
            "windGustMps": 4.19,
            "rainMm": 0,
            "temperature2m": 15.4,
            "visibilityM": 1420,
            "visitorIndex": 95,
            "visitorChangePct": -13,
            "anonymousCrowdCount": 16,
            "avgStayMinutes": 18,
            "returnDelayGroups": 0,
            "historyPriorScore": 51
          },
          "factorScores": {
            "tide": 26,
            "weather": 19,
            "visitor": 14,
            "history": 51,
            "spatial": 78,
            "field": 12
          },
          "riskScore": 30,
          "riskLevel": "낮음",
          "reasons": [
            {
              "key": "spatial",
              "label": "갯벌·방파제 등 공간 노출",
              "score": 78
            },
            {
              "key": "history",
              "label": "과거 유사 사고 이력",
              "score": 51
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 26
            },
            {
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 19
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "return-guidance",
            "wind-warning"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "live_open_meteo_ansan_forecast",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        }
      ]
    }
  ],
  "auditTrail": [
    {
      "at": "2026-07-04T16:30:00+09:00",
      "actor": "스마트도시과 담당자",
      "action": "A01 17:00 고위험 예측 확인",
      "status": "reviewed"
    },
    {
      "at": "2026-07-04T16:37:00+09:00",
      "actor": "현장 관리 담당자",
      "action": "전광판 조위 상승 안내 문구 선택",
      "status": "scheduled"
    },
    {
      "at": "2026-07-04T16:42:00+09:00",
      "actor": "재난안전 협업 담당자",
      "action": "관계기관 공유 리포트 생성",
      "status": "shared"
    }
  ]
};
