window.__RISK_DATA__ = {
  "generatedAt": "2026-06-10T12:48:57.222Z",
  "scenarioDate": "2026-07-04",
  "notice": "공개 데이터 구조를 모사한 MVP 샘플이다. 실제 관측·사고 통계로 단정하지 않는다.",
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
      "type": "갯벌·해안 접근부",
      "lat": 37.288,
      "lng": 126.574,
      "manager": "안산시 현장 관리 부서",
      "authority": "안산시 안내 + 관계기관 공유",
      "channels": [
        "전광판",
        "관광안내 채널",
        "현장 안내방송"
      ],
      "dominantAccidentTypes": [
        "고립",
        "익수"
      ],
      "verificationStatus": "실제 위험 근거 검증 필요",
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
          "datetime": "2026-07-04T15:00:00+09:00",
          "time": "15:00",
          "rawSignals": {
            "tideCm": 642,
            "minutesToHighTide": 167,
            "tideDeltaCmPerHour": 38,
            "windMps": 5.4,
            "rainMm": 0,
            "visitorIndex": 132,
            "visitorChangePct": 28,
            "anonymousCrowdCount": 31,
            "avgStayMinutes": 24,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 37,
            "weather": 28,
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
            "weather": "sample_from_public_api_schema",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-07-04T16:00:00+09:00",
          "time": "16:00",
          "rawSignals": {
            "tideCm": 681,
            "minutesToHighTide": 107,
            "tideDeltaCmPerHour": 42,
            "windMps": 6.1,
            "rainMm": 0,
            "visitorIndex": 151,
            "visitorChangePct": 36,
            "anonymousCrowdCount": 42,
            "avgStayMinutes": 31,
            "returnDelayGroups": 2,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 60,
            "weather": 34,
            "visitor": 74,
            "history": 65,
            "spatial": 78,
            "field": 56
          },
          "riskScore": 60,
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
            "weather": "sample_from_public_api_schema",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-07-04T17:00:00+09:00",
          "time": "17:00",
          "rawSignals": {
            "tideCm": 719,
            "minutesToHighTide": 47,
            "tideDeltaCmPerHour": 44,
            "windMps": 7.8,
            "rainMm": 0,
            "visitorIndex": 165,
            "visitorChangePct": 44,
            "anonymousCrowdCount": 58,
            "avgStayMinutes": 38,
            "returnDelayGroups": 3,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 81,
            "weather": 48,
            "visitor": 87,
            "history": 65,
            "spatial": 78,
            "field": 81
          },
          "riskScore": 74,
          "riskLevel": "높음",
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
            "weather": "sample_from_public_api_schema",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-07-04T18:00:00+09:00",
          "time": "18:00",
          "rawSignals": {
            "tideCm": 735,
            "minutesToHighTide": 13,
            "tideDeltaCmPerHour": 16,
            "windMps": 8.3,
            "rainMm": 0,
            "visitorIndex": 158,
            "visitorChangePct": 27,
            "anonymousCrowdCount": 53,
            "avgStayMinutes": 35,
            "returnDelayGroups": 2,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 81,
            "weather": 52,
            "visitor": 75,
            "history": 65,
            "spatial": 78,
            "field": 67
          },
          "riskScore": 70,
          "riskLevel": "높음",
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
            "weather": "sample_from_public_api_schema",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-07-04T19:00:00+09:00",
          "time": "19:00",
          "rawSignals": {
            "tideCm": 710,
            "minutesToHighTide": -47,
            "tideDeltaCmPerHour": -25,
            "windMps": 7.1,
            "rainMm": 0,
            "visitorIndex": 143,
            "visitorChangePct": -9,
            "anonymousCrowdCount": 39,
            "avgStayMinutes": 29,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 52,
            "weather": 42,
            "visitor": 50,
            "history": 65,
            "spatial": 78,
            "field": 45
          },
          "riskScore": 54,
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
            "weather": "sample_from_public_api_schema",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-07-04T20:00:00+09:00",
          "time": "20:00",
          "rawSignals": {
            "tideCm": 672,
            "minutesToHighTide": -107,
            "tideDeltaCmPerHour": -38,
            "windMps": 6.4,
            "rainMm": 0,
            "visitorIndex": 116,
            "visitorChangePct": -19,
            "anonymousCrowdCount": 25,
            "avgStayMinutes": 22,
            "returnDelayGroups": 0,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 26,
            "weather": 36,
            "visitor": 26,
            "history": 65,
            "spatial": 78,
            "field": 21
          },
          "riskScore": 39,
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
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 36
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 26
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "wind-warning",
            "return-guidance"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "sample_from_public_api_schema",
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
      "type": "항구·방파제",
      "lat": 37.192,
      "lng": 126.647,
      "manager": "안산시 관광·안전 협업 부서",
      "authority": "안산시 안내 + 관계기관 공유",
      "channels": [
        "관광안내 채널",
        "현장 안내방송",
        "관계기관 공유"
      ],
      "dominantAccidentTypes": [
        "추락",
        "익수"
      ],
      "verificationStatus": "관리 주체와 실제 사고 사례 검증 필요",
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
          "datetime": "2026-07-04T15:00:00+09:00",
          "time": "15:00",
          "rawSignals": {
            "tideCm": 601,
            "minutesToHighTide": 172,
            "tideDeltaCmPerHour": 28,
            "windMps": 7.1,
            "rainMm": 0,
            "visitorIndex": 118,
            "visitorChangePct": 18,
            "anonymousCrowdCount": 27,
            "avgStayMinutes": 23,
            "returnDelayGroups": 0,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 31,
            "weather": 42,
            "visitor": 43,
            "history": 73,
            "spatial": 72,
            "field": 24
          },
          "riskScore": 45,
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
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 42
            }
          ],
          "recommendationIds": [
            "agency-share",
            "facility-review",
            "visitor-prealert",
            "wind-warning"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "sample_from_public_api_schema",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-07-04T16:00:00+09:00",
          "time": "16:00",
          "rawSignals": {
            "tideCm": 632,
            "minutesToHighTide": 112,
            "tideDeltaCmPerHour": 31,
            "windMps": 8.2,
            "rainMm": 0,
            "visitorIndex": 132,
            "visitorChangePct": 24,
            "anonymousCrowdCount": 32,
            "avgStayMinutes": 26,
            "returnDelayGroups": 1,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 53,
            "weather": 51,
            "visitor": 55,
            "history": 73,
            "spatial": 72,
            "field": 37
          },
          "riskScore": 56,
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
            "weather": "sample_from_public_api_schema",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-07-04T17:00:00+09:00",
          "time": "17:00",
          "rawSignals": {
            "tideCm": 660,
            "minutesToHighTide": 52,
            "tideDeltaCmPerHour": 28,
            "windMps": 9.4,
            "rainMm": 0,
            "visitorIndex": 142,
            "visitorChangePct": 31,
            "anonymousCrowdCount": 38,
            "avgStayMinutes": 30,
            "returnDelayGroups": 1,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 73,
            "weather": 61,
            "visitor": 65,
            "history": 73,
            "spatial": 72,
            "field": 45
          },
          "riskScore": 66,
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
            "weather": "sample_from_public_api_schema",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-07-04T18:00:00+09:00",
          "time": "18:00",
          "rawSignals": {
            "tideCm": 671,
            "minutesToHighTide": 17,
            "tideDeltaCmPerHour": 11,
            "windMps": 10.1,
            "rainMm": 0,
            "visitorIndex": 136,
            "visitorChangePct": -4,
            "anonymousCrowdCount": 34,
            "avgStayMinutes": 27,
            "returnDelayGroups": 1,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 78,
            "weather": 66,
            "visitor": 47,
            "history": 73,
            "spatial": 72,
            "field": 40
          },
          "riskScore": 64,
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
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 66
            }
          ],
          "recommendationIds": [
            "return-guidance",
            "agency-share",
            "facility-review",
            "wind-warning"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "sample_from_public_api_schema",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-07-04T19:00:00+09:00",
          "time": "19:00",
          "rawSignals": {
            "tideCm": 648,
            "minutesToHighTide": -43,
            "tideDeltaCmPerHour": -23,
            "windMps": 8.8,
            "rainMm": 0,
            "visitorIndex": 124,
            "visitorChangePct": -9,
            "anonymousCrowdCount": 28,
            "avgStayMinutes": 21,
            "returnDelayGroups": 0,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 54,
            "weather": 56,
            "visitor": 36,
            "history": 73,
            "spatial": 72,
            "field": 22
          },
          "riskScore": 52,
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
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 56
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 54
            }
          ],
          "recommendationIds": [
            "agency-share",
            "facility-review",
            "wind-warning",
            "return-guidance"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "sample_from_public_api_schema",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-07-04T20:00:00+09:00",
          "time": "20:00",
          "rawSignals": {
            "tideCm": 613,
            "minutesToHighTide": -103,
            "tideDeltaCmPerHour": -35,
            "windMps": 7.3,
            "rainMm": 0,
            "visitorIndex": 102,
            "visitorChangePct": -18,
            "anonymousCrowdCount": 19,
            "avgStayMinutes": 18,
            "returnDelayGroups": 0,
            "historyPriorScore": 73
          },
          "factorScores": {
            "tide": 29,
            "weather": 43,
            "visitor": 17,
            "history": 73,
            "spatial": 72,
            "field": 14
          },
          "riskScore": 39,
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
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 43
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 29
            }
          ],
          "recommendationIds": [
            "agency-share",
            "facility-review",
            "wind-warning",
            "return-guidance"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "sample_from_public_api_schema",
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
      "type": "시화호·방조제 인근",
      "lat": 37.314,
      "lng": 126.608,
      "manager": "관계기관 관리 주체 확인 필요",
      "authority": "관계기관 관리 주체 확인 필요",
      "channels": [
        "관계기관 공유",
        "관광안내 채널"
      ],
      "dominantAccidentTypes": [
        "추락",
        "고립"
      ],
      "verificationStatus": "관할·시설 데이터 검증 필요",
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
          "datetime": "2026-07-04T15:00:00+09:00",
          "time": "15:00",
          "rawSignals": {
            "tideCm": 590,
            "minutesToHighTide": 184,
            "tideDeltaCmPerHour": 24,
            "windMps": 6.5,
            "rainMm": 0,
            "visitorIndex": 108,
            "visitorChangePct": 14,
            "anonymousCrowdCount": 19,
            "avgStayMinutes": 20,
            "returnDelayGroups": 0,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 27,
            "weather": 37,
            "visitor": 34,
            "history": 65,
            "spatial": 68,
            "field": 16
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
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 37
            },
            {
              "key": "visitor",
              "label": "방문객 집중·증가율",
              "score": 34
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "wind-warning",
            "visitor-prealert"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "sample_from_public_api_schema",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-07-04T16:00:00+09:00",
          "time": "16:00",
          "rawSignals": {
            "tideCm": 617,
            "minutesToHighTide": 124,
            "tideDeltaCmPerHour": 27,
            "windMps": 7.2,
            "rainMm": 0,
            "visitorIndex": 121,
            "visitorChangePct": 19,
            "anonymousCrowdCount": 23,
            "avgStayMinutes": 23,
            "returnDelayGroups": 0,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 48,
            "weather": 43,
            "visitor": 45,
            "history": 65,
            "spatial": 68,
            "field": 21
          },
          "riskScore": 48,
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
            "weather": "sample_from_public_api_schema",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-07-04T17:00:00+09:00",
          "time": "17:00",
          "rawSignals": {
            "tideCm": 642,
            "minutesToHighTide": 64,
            "tideDeltaCmPerHour": 25,
            "windMps": 8.6,
            "rainMm": 0,
            "visitorIndex": 127,
            "visitorChangePct": 22,
            "anonymousCrowdCount": 26,
            "avgStayMinutes": 25,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 67,
            "weather": 54,
            "visitor": 51,
            "history": 65,
            "spatial": 68,
            "field": 33
          },
          "riskScore": 57,
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
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 54
            }
          ],
          "recommendationIds": [
            "facility-review",
            "return-guidance",
            "agency-share",
            "wind-warning"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "sample_from_public_api_schema",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-07-04T18:00:00+09:00",
          "time": "18:00",
          "rawSignals": {
            "tideCm": 653,
            "minutesToHighTide": 24,
            "tideDeltaCmPerHour": 11,
            "windMps": 9.2,
            "rainMm": 0,
            "visitorIndex": 119,
            "visitorChangePct": -6,
            "anonymousCrowdCount": 24,
            "avgStayMinutes": 24,
            "returnDelayGroups": 1,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 75,
            "weather": 59,
            "visitor": 34,
            "history": 65,
            "spatial": 68,
            "field": 30
          },
          "riskScore": 57,
          "riskLevel": "주의",
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
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 59
            }
          ],
          "recommendationIds": [
            "return-guidance",
            "facility-review",
            "agency-share",
            "wind-warning"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "sample_from_public_api_schema",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-07-04T19:00:00+09:00",
          "time": "19:00",
          "rawSignals": {
            "tideCm": 630,
            "minutesToHighTide": -36,
            "tideDeltaCmPerHour": -23,
            "windMps": 8.4,
            "rainMm": 0,
            "visitorIndex": 106,
            "visitorChangePct": -11,
            "anonymousCrowdCount": 20,
            "avgStayMinutes": 19,
            "returnDelayGroups": 0,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 57,
            "weather": 52,
            "visitor": 22,
            "history": 65,
            "spatial": 68,
            "field": 15
          },
          "riskScore": 47,
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
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 52
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
            "weather": "sample_from_public_api_schema",
            "visitor": "sample_from_public_dataset_schema",
            "history": "sample_from_public_file_schema",
            "field": "future_pilot_sample"
          }
        },
        {
          "datetime": "2026-07-04T20:00:00+09:00",
          "time": "20:00",
          "rawSignals": {
            "tideCm": 594,
            "minutesToHighTide": -96,
            "tideDeltaCmPerHour": -36,
            "windMps": 7,
            "rainMm": 0,
            "visitorIndex": 92,
            "visitorChangePct": -13,
            "anonymousCrowdCount": 13,
            "avgStayMinutes": 16,
            "returnDelayGroups": 0,
            "historyPriorScore": 65
          },
          "factorScores": {
            "tide": 31,
            "weather": 41,
            "visitor": 11,
            "history": 65,
            "spatial": 68,
            "field": 8
          },
          "riskScore": 35,
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
              "key": "weather",
              "label": "풍속·강수 등 기상 위험",
              "score": 41
            },
            {
              "key": "tide",
              "label": "만조 임박·조위 변화",
              "score": 31
            }
          ],
          "recommendationIds": [
            "facility-review",
            "agency-share",
            "wind-warning",
            "return-guidance"
          ],
          "dataQuality": {
            "tide": "sample_from_public_api_schema",
            "weather": "sample_from_public_api_schema",
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
