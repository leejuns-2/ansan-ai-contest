const fs = require("fs");
const path = require("path");

const SOURCE_URL = "https://imsm.kcg.go.kr/CSMS/main/csiAcdnt/CsiAcdntSttusRB.do";
const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "data", "raw", "kcg_coastal_accident_stats_2020_2024.json");

const fallbackRows = [
  ["익수", "발생(건)", 151, 183, 140, 148, 128],
  ["익수", "사망(명)", 61, 67, 52, 60, 67],
  ["추락", "발생(건)", 214, 234, 203, 211, 212],
  ["추락", "사망(명)", 27, 34, 40, 50, 45],
  ["고립", "발생(건)", 201, 213, 187, 208, 195],
  ["고립", "사망(명)", 9, 6, 7, 10, 5],
  ["표류", "발생(건)", 16, 38, 37, 42, 37],
  ["표류", "사망(명)", 0, 0, 0, 0, 0],
  ["기타", "발생(건)", 20, 49, 8, 42, 21],
  ["기타", "사망(명)", 0, 2, 1, 0, 1]
];

function parseStats(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const years = ["2020", "2021", "2022", "2023", "2024"];
  const types = ["익수", "추락", "고립", "표류", "기타"];
  const rows = [];

  for (const type of types) {
    const pattern = new RegExp(`${type}\\s+발생\\(건\\)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+사망\\(명\\)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)`);
    const match = text.match(pattern);
    if (!match) continue;

    years.forEach((year, index) => {
      rows.push({
        accidentType: type,
        year: Number(year),
        incidentCount: Number(match[1 + index]),
        deathCount: Number(match[6 + index])
      });
    });
  }

  return rows;
}

function rowsFromFallback() {
  const years = [2020, 2021, 2022, 2023, 2024];
  const byType = new Map();

  for (const [type, metric, ...values] of fallbackRows) {
    if (!byType.has(type)) byType.set(type, {});
    byType.get(type)[metric] = values;
  }

  const rows = [];
  for (const [type, metrics] of byType.entries()) {
    years.forEach((year, index) => {
      rows.push({
        accidentType: type,
        year,
        incidentCount: metrics["발생(건)"][index],
        deathCount: metrics["사망(명)"][index]
      });
    });
  }
  return rows;
}

async function collect() {
  let html = "";
  let collectionMode = "live_fetch";
  try {
    const response = await fetch(SOURCE_URL, {
      headers: {
        "user-agent": "ansan-safe-coast-ai-mvp/0.1"
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
  } catch (error) {
    collectionMode = `fallback_embedded_official_snapshot: ${error.message}`;
  }

  let rows = html ? parseStats(html) : [];
  if (rows.length !== 25) {
    collectionMode = collectionMode === "live_fetch"
      ? "fallback_embedded_official_snapshot: parse_mismatch"
      : collectionMode;
    rows = rowsFromFallback();
  }

  const output = {
    collectedAt: new Date().toISOString(),
    source: {
      name: "해양경찰청 연안사고통계",
      agency: "해양경찰청",
      url: SOURCE_URL,
      table: "최근 5년('20 ~ '24년) 연안사고 유형별 현황"
    },
    collectionMode,
    licenseNote: "공식 공개 페이지의 집계 통계를 MVP 학습용 원천 데이터로 사용. 출처 표시 필요.",
    schema: {
      accidentType: "사고 유형",
      year: "연도",
      incidentCount: "발생 건수",
      deathCount: "사망자 수"
    },
    records: rows
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Collected ${rows.length} KCG accident statistic records -> ${outputPath}`);
  console.log(`collectionMode=${collectionMode}`);
}

collect().catch((error) => {
  console.error(error);
  process.exit(1);
});
