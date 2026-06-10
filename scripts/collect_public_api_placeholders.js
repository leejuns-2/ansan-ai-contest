const fs = require("fs");
const path = require("path");
const { loadEnv } = require("./load_env");

loadEnv();

const rootDir = path.resolve(__dirname, "..");
const masterPath = path.join(rootDir, "data", "master", "ansan_coastal_locations.json");
const outputPath = path.join(rootDir, "data", "raw", "api_collection_plan_status.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function envPresent(name) {
  const value = process.env[name];
  return Boolean(value && value.trim() && !value.includes("${"));
}

function buildStatus() {
  const master = readJson(masterPath);
  const requiredApis = [
    {
      id: "kma_forecast",
      name: "기상청 단기예보/초단기실황",
      env: "KMA_SERVICE_KEY",
      output: "data/raw/kma_forecast_ansan.json",
      status: envPresent("KMA_SERVICE_KEY") || envPresent("DATA_GO_KR_SERVICE_KEY") ? "ready_to_implement_request" : "waiting_for_key",
      nextAction: "위경도→기상청 격자 변환 후 후보지별 예보 조회"
    },
    {
      id: "khoa_tide",
      name: "국립해양조사원 조위 실측·예측",
      env: "KHOA_SERVICE_KEY",
      output: "data/raw/khoa_tide_ansan.json",
      status: envPresent("KHOA_SERVICE_KEY") || envPresent("DATA_GO_KR_SERVICE_KEY") ? "ready_to_implement_request" : "waiting_for_key",
      nextAction: "후보지별 인근 조위관측소 매핑 후 조위 조회"
    },
    {
      id: "kcg_accident_history",
      name: "해양경찰청 연안사고 이력",
      env: "KCG_ACCIDENT_HISTORY_SERVICE_KEY or KCG_ACCIDENT_HISTORY_DOWNLOAD_URL",
      output: "data/raw/kcg_accident_history_ansan.json",
      status: envPresent("KCG_ACCIDENT_HISTORY_DOWNLOAD_URL") || envPresent("KCG_ACCIDENT_HISTORY_SERVICE_KEY") || envPresent("DATA_GO_KR_SERVICE_KEY")
        ? "ready_to_implement_request"
        : "waiting_for_key_or_download_url",
      nextAction: "안산·대부도·관할 해역 키워드로 사고이력 필터"
    },
    {
      id: "gg_population",
      name: "경기데이터드림 유동인구",
      env: "GG_DATA_KEY",
      output: "data/raw/gg_population_ansan.json",
      status: envPresent("GG_DATA_KEY") ? "ready_to_implement_request" : "waiting_for_key_or_download_method",
      nextAction: "시군구·행정동·격자 단위 중 사용 가능한 해상도 확인"
    }
  ];

  return {
    generatedAt: new Date().toISOString(),
    locationsCount: master.locations.length,
    pilotLocations: master.locations.filter((location) => location.pilotPriority === "P0").map((location) => location.id),
    requiredApis,
    note: "이 파일은 인증키 확보 전 수집 준비 상태를 기록한다. 실제 API endpoint별 요청 파라미터는 인증키 발급 후 응답 예시를 확인해 구현한다."
  };
}

const status = buildStatus();
ensureDir(outputPath);
fs.writeFileSync(outputPath, `${JSON.stringify(status, null, 2)}\n`, "utf8");
console.log(`Wrote API collection plan status -> ${outputPath}`);
for (const api of status.requiredApis) {
  console.log(`${api.id}: ${api.status}`);
}
