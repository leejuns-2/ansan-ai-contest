const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const masterPath = path.join(rootDir, "data", "master", "ansan_coastal_locations.json");
const locationsPath = path.join(rootDir, "data", "raw", "ansan_candidate_locations.json");
const weatherPath = path.join(rootDir, "data", "raw", "ansan_open_meteo_weather_latest.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readMasterLocations() {
  const master = readJson(masterPath);
  return master.locations.map((location) => ({
    id: location.id,
    name: location.displayName || location.name,
    officialName: location.name,
    query: location.query,
    aliases: location.aliases || [],
    lat: location.lat,
    lng: location.lng,
    type: location.category,
    district: location.district,
    riskContext: location.riskContext,
    dominantAccidentTypes: location.dominantAccidentTypes,
    pilotPriority: location.pilotPriority,
    dataStatus: location.dataStatus
  }));
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "ansan-safe-coast-ai-mvp/0.2 contact:github.com/leejuns-2/ansan-ai-contest",
      ...options.headers
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function geocodeLocation(location) {
  const queries = [location.query, ...(location.aliases || [])];

  for (const query of queries) {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "kr");
    url.searchParams.set("accept-language", "ko");

    try {
    const results = await fetchJson(url.toString());
      if (!Array.isArray(results) || !results.length) continue;

      const hit = results[0];
      return {
        ...location,
        lat: Number(hit.lat),
        lng: Number(hit.lon),
        source: "openstreetmap_nominatim",
        geocodeStatus: "matched",
        matchedQuery: query,
        displayName: hit.display_name,
        osmType: hit.osm_type,
        osmId: hit.osm_id,
        importance: hit.importance
      };
    } catch (error) {
      location.lastGeocodeError = error.message;
    }

    await new Promise((resolve) => setTimeout(resolve, 1100));
  }

  return {
    ...location,
    source: "fallback_coordinate",
    geocodeStatus: location.lastGeocodeError ? `error: ${location.lastGeocodeError}` : "no_result"
  };
}

function nearestHourlyIndexes(hourly, maxCount = 8) {
  const now = Date.now();
  return hourly.time
    .map((time, index) => ({ index, diff: Math.abs(new Date(time).getTime() - now) }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, maxCount)
    .map((item) => item.index)
    .sort((a, b) => a - b);
}

async function collectWeather(location) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(location.lat));
  url.searchParams.set("longitude", String(location.lng));
  url.searchParams.set("timezone", "Asia/Seoul");
  url.searchParams.set("forecast_days", "2");
  url.searchParams.set("hourly", "temperature_2m,precipitation,wind_speed_10m,wind_gusts_10m,visibility");
  url.searchParams.set("current", "temperature_2m,precipitation,wind_speed_10m,wind_gusts_10m");

  let payload = null;
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      payload = await fetchJson(url.toString());
      break;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
    }
  }
  if (!payload) throw lastError;
  const indexes = nearestHourlyIndexes(payload.hourly, 8);
  return {
    locationId: location.id,
    source: "open-meteo",
    url: url.toString(),
    latitude: payload.latitude,
    longitude: payload.longitude,
    timezone: payload.timezone,
    current: payload.current,
    hourly: indexes.map((index) => ({
      time: payload.hourly.time[index],
      temperature2m: payload.hourly.temperature_2m[index],
      precipitationMm: payload.hourly.precipitation[index],
      windSpeed10mKmh: payload.hourly.wind_speed_10m[index],
      windGusts10mKmh: payload.hourly.wind_gusts_10m[index],
      visibilityM: payload.hourly.visibility[index]
    }))
  };
}

async function main() {
  const candidateLocations = readMasterLocations();
  const geocoded = [];
  for (const location of candidateLocations) {
    geocoded.push(await geocodeLocation(location));
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }

  const weather = [];
  for (const location of geocoded) {
    try {
      weather.push(await collectWeather(location));
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      weather.push({
        locationId: location.id,
        source: "open-meteo",
        error: error.message,
        hourly: []
      });
    }
  }

  const locationsOutput = {
    collectedAt: new Date().toISOString(),
    source: {
      name: "OpenStreetMap Nominatim",
      url: "https://nominatim.openstreetmap.org/",
      note: "안산 연안 후보지명 좌표 확인용. 실패 시 수동 후보 좌표를 사용한다."
    },
    records: geocoded
  };

  const weatherOutput = {
    collectedAt: new Date().toISOString(),
    source: {
      name: "Open-Meteo Forecast API",
      url: "https://open-meteo.com/",
      note: "인증키 없이 사용할 수 있는 기상 예보 API. 공공데이터포털 기상청 API 연동 전 PoC 보조 데이터로 사용한다."
    },
    records: weather
  };

  ensureDir(locationsPath);
  fs.writeFileSync(locationsPath, `${JSON.stringify(locationsOutput, null, 2)}\n`, "utf8");
  fs.writeFileSync(weatherPath, `${JSON.stringify(weatherOutput, null, 2)}\n`, "utf8");

  console.log(`Collected ${geocoded.length} Ansan candidate locations -> ${locationsPath}`);
  console.log(`Collected weather for ${weather.length} locations -> ${weatherPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
