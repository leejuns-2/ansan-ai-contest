const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const inputPath = path.join(rootDir, "data", "raw", "kcg_coastal_accident_stats_2020_2024.json");
const modelPath = path.join(rootDir, "models", "history_prior_model.json");
const reportPath = path.join(rootDir, "models", "history_prior_report.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function std(values) {
  const m = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - m) ** 2))) || 1;
}

function linearRegression(points) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const mx = mean(xs);
  const my = mean(ys);
  const numerator = points.reduce((sum, point) => sum + (point.x - mx) * (point.y - my), 0);
  const denominator = points.reduce((sum, point) => sum + (point.x - mx) ** 2, 0) || 1;
  const slope = numerator / denominator;
  const intercept = my - slope * mx;
  const predictions = points.map((point) => intercept + slope * point.x);
  const mae = mean(predictions.map((prediction, index) => Math.abs(prediction - ys[index])));
  return { slope, intercept, mae };
}

function buildTypeFeatures(records) {
  const byType = new Map();
  for (const record of records) {
    if (!byType.has(record.accidentType)) byType.set(record.accidentType, []);
    byType.get(record.accidentType).push(record);
  }

  const incidentMeans = [];
  const fatalityRates = [];
  const trendValues = [];
  const features = [];

  for (const [accidentType, rows] of byType.entries()) {
    const sorted = rows.sort((a, b) => a.year - b.year);
    const incidentMean = mean(sorted.map((row) => row.incidentCount));
    const deathMean = mean(sorted.map((row) => row.deathCount));
    const fatalityRate = sorted.reduce((sum, row) => sum + row.deathCount, 0) /
      Math.max(1, sorted.reduce((sum, row) => sum + row.incidentCount, 0));
    const trend = linearRegression(sorted.map((row) => ({
      x: row.year - sorted[0].year,
      y: row.incidentCount
    })));

    incidentMeans.push(incidentMean);
    fatalityRates.push(fatalityRate);
    trendValues.push(trend.slope);

    features.push({
      accidentType,
      incidentMean,
      deathMean,
      fatalityRate,
      trendSlope: trend.slope,
      trendMae: trend.mae,
      latestIncidentCount: sorted[sorted.length - 1].incidentCount,
      latestDeathCount: sorted[sorted.length - 1].deathCount,
      years: sorted.map((row) => row.year)
    });
  }

  const incidentMeanStats = { mean: mean(incidentMeans), std: std(incidentMeans) };
  const fatalityRateStats = { mean: mean(fatalityRates), std: std(fatalityRates) };
  const trendStats = { mean: mean(trendValues), std: std(trendValues) };

  return features.map((feature) => {
    const incidentZ = (feature.incidentMean - incidentMeanStats.mean) / incidentMeanStats.std;
    const fatalityZ = (feature.fatalityRate - fatalityRateStats.mean) / fatalityRateStats.std;
    const trendZ = (feature.trendSlope - trendStats.mean) / trendStats.std;
    const priorScore = Math.round(Math.max(0, Math.min(100, 50 + incidentZ * 18 + fatalityZ * 16 + trendZ * 8)));

    return {
      ...feature,
      priorScore,
      riskBand: priorScore >= 75 ? "높음" : priorScore >= 55 ? "주의" : "보통"
    };
  }).sort((a, b) => b.priorScore - a.priorScore);
}

function buildModel(dataset) {
  const priors = buildTypeFeatures(dataset.records);
  const weights = {
    incidentMeanZ: 18,
    fatalityRateZ: 16,
    trendSlopeZ: 8,
    base: 50
  };

  return {
    trainedAt: new Date().toISOString(),
    modelName: "history_prior_model_v0",
    modelType: "interpretable statistical prior",
    source: dataset.source,
    objective: "최근 5년 연안사고 유형별 발생·사망 통계를 이용해 사고유형별 사고이력 prior 점수를 산출한다.",
    limitation: "전국 집계 통계 기반이므로 안산 특정 장소 위험도 모델이 아니다. 안산·대부도 필터 데이터 확보 전까지 사고유형 prior로만 사용한다.",
    formula: "prior_score = clamp(50 + incident_mean_z*18 + fatality_rate_z*16 + trend_slope_z*8, 0, 100)",
    weights,
    priors
  };
}

function writeReport(model, outputPath) {
  const lines = [
    "# 사고이력 Prior 모델 리포트",
    "",
    `- 학습 시각: ${model.trainedAt}`,
    `- 모델명: ${model.modelName}`,
    `- 원천: ${model.source.name} (${model.source.url})`,
    "",
    "## 모델 목적",
    "",
    model.objective,
    "",
    "## 한계",
    "",
    model.limitation,
    "",
    "## 산식",
    "",
    "```text",
    model.formula,
    "```",
    "",
    "## 사고유형별 prior",
    "",
    "| 사고유형 | Prior 점수 | 위험대 | 평균 발생 | 평균 사망 | 치명률 | 추세 기울기 |",
    "|---|---:|---|---:|---:|---:|---:|",
    ...model.priors.map((row) => (
      `| ${row.accidentType} | ${row.priorScore} | ${row.riskBand} | ${row.incidentMean.toFixed(1)} | ${row.deathMean.toFixed(1)} | ${(row.fatalityRate * 100).toFixed(1)}% | ${row.trendSlope.toFixed(2)} |`
    )),
    "",
    "## 사용 방법",
    "",
    "현재 대시보드는 장소별 사고이력 점수에 이 모델의 사고유형 prior를 직접 결합하지 않는다. 다음 단계에서 장소 유형(갯벌, 방파제, 해안 접근부)과 사고유형 매핑을 정의해 `history` 피처를 실제 prior 기반으로 교체한다."
  ];

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
}

if (!fs.existsSync(inputPath)) {
  console.error(`Missing input data: ${inputPath}`);
  console.error("Run: node scripts/collect_kcg_accident_stats.js");
  process.exit(1);
}

const dataset = readJson(inputPath);
const model = buildModel(dataset);
fs.mkdirSync(path.dirname(modelPath), { recursive: true });
fs.writeFileSync(modelPath, `${JSON.stringify(model, null, 2)}\n`, "utf8");
writeReport(model, reportPath);

console.log(`Trained history prior model -> ${modelPath}`);
console.log(`Wrote model report -> ${reportPath}`);
