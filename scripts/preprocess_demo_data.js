const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const rawPath = path.join(rootDir, "data", "raw", "demo_observations.json");
const registryPath = path.join(rootDir, "data", "raw", "source_registry.json");
const outputPath = path.join(rootDir, "data", "processed", "risk_timeseries.json");

const checkOnly = process.argv.includes("--check");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value, min, max) {
  return clamp(((value - min) / (max - min)) * 100);
}

function level(score) {
  if (score >= 85) return "긴급";
  if (score >= 70) return "높음";
  if (score >= 50) return "주의";
  return "낮음";
}

function scoreFactors(row) {
  const highTideCloseness = clamp(100 - (Math.abs(row.minutesToHighTide) / 180) * 100);
  const tideRise = normalize(row.tideDeltaCmPerHour, -40, 50);
  const tide = clamp(highTideCloseness * 0.62 + tideRise * 0.38);

  const wind = normalize(row.windMps, 2, 12);
  const rain = normalize(row.rainMm, 0, 20);
  const weather = clamp(wind * 0.82 + rain * 0.18);

  const visitorVolume = normalize(row.visitorIndex, 80, 180);
  const visitorChange = normalize(row.visitorChangePct, -20, 50);
  const visitor = clamp(visitorVolume * 0.72 + visitorChange * 0.28);

  const fieldCrowd = normalize(row.anonymousCrowdCount, 10, 65);
  const fieldStay = normalize(row.avgStayMinutes, 10, 45);
  const fieldDelay = normalize(row.returnDelayGroups, 0, 4);
  const field = clamp(fieldCrowd * 0.36 + fieldStay * 0.34 + fieldDelay * 0.3);

  return {
    tide: Math.round(tide),
    weather: Math.round(weather),
    visitor: Math.round(visitor),
    history: row.accidentHistoryScore,
    spatial: row.spatialExposureScore,
    field: Math.round(field)
  };
}

function weightedRisk(scores) {
  const weights = {
    tide: 0.25,
    weather: 0.18,
    visitor: 0.18,
    history: 0.14,
    spatial: 0.12,
    field: 0.13
  };

  const riskScore = Object.entries(weights).reduce((sum, [key, weight]) => sum + scores[key] * weight, 0);
  return Math.round(riskScore);
}

function topReasons(scores) {
  const labels = {
    tide: "만조 임박·조위 변화",
    weather: "풍속·강수 등 기상 위험",
    visitor: "방문객 집중·증가율",
    history: "과거 유사 사고 이력",
    spatial: "갯벌·방파제 등 공간 노출",
    field: "익명 현장 체류·복귀 지연 신호"
  };

  return Object.entries(scores)
    .map(([key, score]) => ({ key, label: labels[key], score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function recommendationIds(reasons) {
  const map = {
    tide: "return-guidance",
    weather: "wind-warning",
    visitor: "visitor-prealert",
    history: "agency-share",
    spatial: "facility-review",
    field: "field-broadcast"
  };

  return Array.from(new Set(reasons.map((reason) => map[reason.key]))).filter(Boolean);
}

function buildOutput(raw, registry) {
  const observationsByLocation = raw.locations.map((location) => {
    const series = raw.observations
      .filter((row) => row.locationId === location.id)
      .map((row) => {
        const factorScores = scoreFactors(row);
        const riskScore = weightedRisk(factorScores);
        const reasons = topReasons(factorScores);

        return {
          datetime: row.datetime,
          time: row.datetime.slice(11, 16),
          rawSignals: {
            tideCm: row.tideCm,
            minutesToHighTide: row.minutesToHighTide,
            tideDeltaCmPerHour: row.tideDeltaCmPerHour,
            windMps: row.windMps,
            rainMm: row.rainMm,
            visitorIndex: row.visitorIndex,
            visitorChangePct: row.visitorChangePct,
            anonymousCrowdCount: row.anonymousCrowdCount,
            avgStayMinutes: row.avgStayMinutes,
            returnDelayGroups: row.returnDelayGroups
          },
          factorScores,
          riskScore,
          riskLevel: level(riskScore),
          reasons,
          recommendationIds: recommendationIds(reasons),
          dataQuality: {
            tide: "sample_from_public_api_schema",
            weather: "sample_from_public_api_schema",
            visitor: "sample_from_public_dataset_schema",
            history: "sample_from_public_file_schema",
            field: "future_pilot_sample"
          }
        };
      });

    return {
      ...location,
      series,
      effectBaseline: raw.effectBaseline[location.id]
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    scenarioDate: raw.scenarioDate,
    notice: raw.notice,
    preprocessing: {
      timeUnit: "1 hour",
      spatialUnit: "candidate POI",
      modelType: "explainable weighted risk score for MVP",
      weights: {
        tide: 0.25,
        weather: 0.18,
        visitor: 0.18,
        history: 0.14,
        spatial: 0.12,
        field: 0.13
      },
      riskLevels: [
        { min: 85, label: "긴급" },
        { min: 70, label: "높음" },
        { min: 50, label: "주의" },
        { min: 0, label: "낮음" }
      ]
    },
    sourceLineage: registry.records,
    recommendationCatalog: [
      {
        id: "return-guidance",
        title: "조위 상승 복귀 안내",
        owner: "안산시 현장 관리 부서",
        channel: "전광판·안내방송·관광안내 채널",
        authorityRisk: "낮음",
        effort: "낮음",
        effect: "갯벌·해안 접근부 체류자의 안전지대 이동 유도"
      },
      {
        id: "wind-warning",
        title: "강풍·방파제 접근 주의 안내",
        owner: "안산시 + 관계기관",
        channel: "현장 안내방송·관계기관 공유",
        authorityRisk: "낮음",
        effort: "중간",
        effect: "방파제·해안가 체류 위험 노출 감소"
      },
      {
        id: "visitor-prealert",
        title: "관광객 사전 알림",
        owner: "안산시 관광·홍보 채널",
        channel: "관광안내 페이지·SNS·주차장 안내",
        authorityRisk: "낮음",
        effort: "중간",
        effect: "방문 전 위험시간 인지 강화"
      },
      {
        id: "agency-share",
        title: "관계기관 공유 리포트",
        owner: "안산시 → 해경·소방 등 관계기관",
        channel: "PDF·메일·내부 공유",
        authorityRisk: "권한 대체 아님",
        effort: "낮음",
        effect: "고위험 시간대 사전 상황 공유"
      },
      {
        id: "facility-review",
        title: "시설 개선 후보 등록",
        owner: "안산시 시설 담당 부서",
        channel: "정책 리포트·예산 검토",
        authorityRisk: "낮음",
        effort: "높음",
        effect: "반복 위험구간의 구조적 위험 완화"
      },
      {
        id: "field-broadcast",
        title: "현장 안내 강화",
        owner: "안산시 현장 관리 부서",
        channel: "안내방송·현장 안내요원",
        authorityRisk: "낮음",
        effort: "중간",
        effect: "체류·복귀 지연 신호에 대한 즉시 안내"
      }
    ],
    locations: observationsByLocation,
    auditTrail: [
      {
        at: "2026-07-04T16:30:00+09:00",
        actor: "스마트도시과 담당자",
        action: "A01 17:00 고위험 예측 확인",
        status: "reviewed"
      },
      {
        at: "2026-07-04T16:37:00+09:00",
        actor: "현장 관리 담당자",
        action: "전광판 조위 상승 안내 문구 선택",
        status: "scheduled"
      },
      {
        at: "2026-07-04T16:42:00+09:00",
        actor: "재난안전 협업 담당자",
        action: "관계기관 공유 리포트 생성",
        status: "shared"
      }
    ]
  };
}

const raw = readJson(rawPath);
const registry = readJson(registryPath);
const output = buildOutput(raw, registry);

if (!checkOnly) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
}

if (!output.locations.length || !output.locations[0].series.length) {
  throw new Error("No processed risk series generated.");
}

console.log(`Processed ${output.locations.length} locations into ${outputPath}`);
