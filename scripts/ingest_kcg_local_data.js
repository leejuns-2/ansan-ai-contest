const fs = require("fs");
const path = require("path");
const { TextDecoder } = require("util");

const rootDir = path.resolve(__dirname, "..");

const accidentCsvPath = path.join(
  rootDir,
  "data",
  "raw",
  "kcg_accident_history",
  "해양경찰청_연안사고 이력_20231231.csv"
);
const riskZoneDir = path.join(rootDir, "data", "raw", "kcg_coastal_risk_zones", "extracted");
const controlZoneDir = path.join(rootDir, "data", "raw", "kcg_control_zones", "extracted");
const masterPath = path.join(rootDir, "data", "master", "ansan_coastal_locations.json");

const localAccidentOutputPath = path.join(rootDir, "data", "processed", "kcg_accident_history_local.json");
const spatialInventoryOutputPath = path.join(rootDir, "data", "processed", "kcg_spatial_layers_inventory.json");
const riskZoneGeojsonOutputPath = path.join(rootDir, "data", "processed", "kcg_coastal_risk_zones.geojson");
const controlZoneGeojsonOutputPath = path.join(rootDir, "data", "processed", "kcg_control_zones.geojson");
const spatialExposureOutputPath = path.join(rootDir, "data", "processed", "kcg_spatial_exposure_ansan.json");
const localModelOutputPath = path.join(rootDir, "models", "local_accident_history_model.json");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readText(filePath, encoding = "utf-8") {
  const bytes = fs.readFileSync(filePath);
  return new TextDecoder(encoding).decode(bytes).replace(/^\uFEFF/, "");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        value += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === "," && !quoted) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => cell.length)) rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length || row.length) {
    row.push(value);
    if (row.some((cell) => cell.length)) rows.push(row);
  }

  const headers = rows.shift();
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""])));
}

function countBy(rows, field) {
  const counts = new Map();
  for (const row of rows) {
    const key = row[field] || "미상";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ko"));
}

function yearFromDate(dateValue) {
  const match = String(dateValue || "").match(/^(\d{4})/);
  return match ? match[1] : "미상";
}

function seasonFromDate(dateValue) {
  const month = Number(String(dateValue || "").slice(5, 7));
  if ([3, 4, 5].includes(month)) return "봄";
  if ([6, 7, 8].includes(month)) return "여름";
  if ([9, 10, 11].includes(month)) return "가을";
  if ([12, 1, 2].includes(month)) return "겨울";
  return "미상";
}

function isDirectAnsan(row) {
  return Object.values(row).some((value) => /안산|대부|탄도|방아머리|구봉|선감|풍도|시화/.test(String(value)));
}

function isGyeonggiCoast(row) {
  return /경기|경기도|화성|안산/.test(row.발생지역 || "") && /평택|인천/.test(row.해경서 || "");
}

function isJurisdictionProxy(row) {
  return /평택/.test(row.해경서 || "");
}

function summarizeAccidents(rows) {
  return {
    totalRows: rows.length,
    byYear: countBy(rows.map((row) => ({ ...row, year: yearFromDate(row.발생일자) })), "year"),
    bySeason: countBy(rows.map((row) => ({ ...row, season: seasonFromDate(row.발생일자) })), "season"),
    byWeekday: countBy(rows, "발생요일"),
    byAccidentType: countBy(rows, "사고유형_세분류"),
    byPlaceType: countBy(rows, "장소유형"),
    byCause: countBy(rows, "사고원인1차"),
    byRiskZoneFlag: countBy(rows, "위험구역지정"),
    byStation: countBy(rows, "해경서"),
    byRegion: countBy(rows, "발생지역")
  };
}

function scoreForLocation(location, localSummary, proxySummary) {
  const locationTypes = new Set(location.dominantAccidentTypes || []);
  const localTypeCounts = new Map(localSummary.byAccidentType.map((row) => [row.name, row.count]));
  const proxyTypeCounts = new Map(proxySummary.byAccidentType.map((row) => [row.name, row.count]));

  const localMatched = [...locationTypes].reduce((sum, type) => sum + (localTypeCounts.get(type) || 0), 0);
  const proxyMatched = [...locationTypes].reduce((sum, type) => sum + (proxyTypeCounts.get(type) || 0), 0);
  const localBase = localSummary.totalRows ? (localMatched / localSummary.totalRows) * 100 : 0;
  const proxyBase = proxySummary.totalRows ? (proxyMatched / proxySummary.totalRows) * 100 : 0;
  const categoryBoost = /tidal_flat|mudflat|beach|port|breakwater|dyke/.test(location.category || "") ? 8 : 3;
  const directBoost = /대부|탄도|방아머리|구봉|선감|풍도|시화/.test(`${location.name} ${location.displayName || ""}`) ? 6 : 2;
  const score = Math.max(45, Math.min(95, Math.round(localBase * 0.55 + proxyBase * 0.45 + categoryBoost + directBoost)));

  return {
    locationId: location.id,
    locationName: location.displayName || location.name,
    dominantAccidentTypes: [...locationTypes],
    localMatchedCount: localMatched,
    proxyMatchedCount: proxyMatched,
    priorScore: score,
    confidence: localSummary.totalRows >= 20 ? "medium" : "low",
    limitation: "원본 연안사고 이력의 발생지역 해상도가 시군·광역 단위라 후보지별 정밀 학습이 아니라 지역/관할 proxy prior로 사용한다."
  };
}

function decodeDbfValue(buffer, decoder) {
  return decoder.decode(buffer).replace(/\0/g, "").trim();
}

function readDbf(dbfPath, encoding, fieldNameOverrides = []) {
  const buffer = fs.readFileSync(dbfPath);
  const recordCount = buffer.readUInt32LE(4);
  const headerLength = buffer.readUInt16LE(8);
  const recordLength = buffer.readUInt16LE(10);
  const fields = [];

  for (let offset = 32; offset < headerLength - 1; offset += 32) {
    if (buffer[offset] === 0x0d) break;
    const rawName = buffer.subarray(offset, offset + 11);
    const name = rawName.toString("ascii").replace(/\0/g, "").trim();
    fields.push({
      name: fieldNameOverrides[fields.length] || name || `field_${fields.length + 1}`,
      rawName: name,
      type: String.fromCharCode(buffer[offset + 11]),
      length: buffer[offset + 16],
      decimalCount: buffer[offset + 17]
    });
  }

  const decoder = new TextDecoder(encoding);
  const records = [];

  for (let rowIndex = 0; rowIndex < recordCount; rowIndex += 1) {
    const recordOffset = headerLength + rowIndex * recordLength;
    if (buffer[recordOffset] === 0x2a) continue;
    let fieldOffset = recordOffset + 1;
    const record = { featureId: rowIndex + 1 };
    for (const field of fields) {
      const valueBuffer = buffer.subarray(fieldOffset, fieldOffset + field.length);
      record[field.name] = decodeDbfValue(valueBuffer, decoder);
      fieldOffset += field.length;
    }
    records.push(record);
  }

  return {
    path: path.relative(rootDir, dbfPath).replace(/\\/g, "/"),
    encoding,
    recordCount,
    headerLength,
    recordLength,
    fields,
    sampleRecords: records.slice(0, 5),
    records
  };
}

function readShp(shpPath) {
  const buffer = fs.readFileSync(shpPath);
  const fileLengthBytes = buffer.readInt32BE(24) * 2;
  const shapeType = buffer.readInt32LE(32);
  const bbox = {
    xmin: buffer.readDoubleLE(36),
    ymin: buffer.readDoubleLE(44),
    xmax: buffer.readDoubleLE(52),
    ymax: buffer.readDoubleLE(60)
  };

  let recordCount = 0;
  let offset = 100;
  while (offset + 8 <= buffer.length) {
    const contentLengthBytes = buffer.readInt32BE(offset + 4) * 2;
    recordCount += 1;
    offset += 8 + contentLengthBytes;
  }

  return {
    path: path.relative(rootDir, shpPath).replace(/\\/g, "/"),
    fileLengthBytes,
    shapeType,
    recordCount,
    bbox
  };
}

function readShpGeometries(shpPath) {
  const buffer = fs.readFileSync(shpPath);
  const geometries = [];
  let offset = 100;

  while (offset + 8 <= buffer.length) {
    const recordNumber = buffer.readInt32BE(offset);
    const contentLengthBytes = buffer.readInt32BE(offset + 4) * 2;
    const contentOffset = offset + 8;
    const shapeType = buffer.readInt32LE(contentOffset);

    if (shapeType === 0) {
      geometries.push({ recordNumber, geometry: null });
      offset += 8 + contentLengthBytes;
      continue;
    }

    if (shapeType !== 5) {
      throw new Error(`Unsupported SHP shapeType ${shapeType} in ${shpPath}`);
    }

    const numParts = buffer.readInt32LE(contentOffset + 36);
    const numPoints = buffer.readInt32LE(contentOffset + 40);
    const parts = [];
    for (let i = 0; i < numParts; i += 1) {
      parts.push(buffer.readInt32LE(contentOffset + 44 + i * 4));
    }

    const pointsOffset = contentOffset + 44 + numParts * 4;
    const rings = [];
    for (let partIndex = 0; partIndex < numParts; partIndex += 1) {
      const start = parts[partIndex];
      const end = partIndex + 1 < numParts ? parts[partIndex + 1] : numPoints;
      const ring = [];
      for (let pointIndex = start; pointIndex < end; pointIndex += 1) {
        const pointOffset = pointsOffset + pointIndex * 16;
        ring.push([buffer.readDoubleLE(pointOffset), buffer.readDoubleLE(pointOffset + 8)]);
      }
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
        ring.push(first);
      }
      rings.push(ring);
    }

    geometries.push({
      recordNumber,
      geometry: rings.length === 1
        ? { type: "Polygon", coordinates: [rings[0]] }
        : { type: "MultiPolygon", coordinates: rings.map((ring) => [ring]) }
    });

    offset += 8 + contentLengthBytes;
  }

  return geometries;
}

function buildGeoJson(shpPath, dbfRecords, sourceName) {
  const geometries = readShpGeometries(shpPath);
  return {
    type: "FeatureCollection",
    name: sourceName,
    crs: {
      type: "name",
      properties: { name: "EPSG:4326" }
    },
    features: geometries.map((item, index) => ({
      type: "Feature",
      id: item.recordNumber,
      properties: dbfRecords[index] || { featureId: item.recordNumber },
      geometry: item.geometry
    }))
  };
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function metersBetween(a, b) {
  const earthRadiusM = 6371008.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * earthRadiusM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function projectNear(point, origin) {
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320 * Math.cos(toRad(origin.lat));
  return {
    x: (point.lng - origin.lng) * metersPerDegreeLng,
    y: (point.lat - origin.lat) * metersPerDegreeLat
  };
}

function distancePointToSegmentM(point, a, b) {
  const p = projectNear(point, point);
  const start = projectNear(a, point);
  const end = projectNear(b, point);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return metersBetween(point, a);
  const t = Math.max(0, Math.min(1, ((p.x - start.x) * dx + (p.y - start.y) * dy) / lengthSquared));
  const projection = { x: start.x + t * dx, y: start.y + t * dy };
  return Math.sqrt((p.x - projection.x) ** 2 + (p.y - projection.y) ** 2);
}

function ringContainsPoint(ring, point) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersects = yi > point.lat !== yj > point.lat
      && point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function polygonContainsPoint(coordinates, point) {
  if (!coordinates.length || !ringContainsPoint(coordinates[0], point)) return false;
  return !coordinates.slice(1).some((hole) => ringContainsPoint(hole, point));
}

function geometryContainsPoint(geometry, point) {
  if (!geometry) return false;
  if (geometry.type === "Polygon") return polygonContainsPoint(geometry.coordinates, point);
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygon) => polygonContainsPoint(polygon, point));
  }
  return false;
}

function ringsFromGeometry(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat();
  return [];
}

function distanceToGeometryM(point, geometry) {
  if (!geometry) return Number.POSITIVE_INFINITY;
  if (geometryContainsPoint(geometry, point)) return 0;
  let minDistance = Number.POSITIVE_INFINITY;
  for (const ring of ringsFromGeometry(geometry)) {
    for (let i = 1; i < ring.length; i += 1) {
      const a = { lng: ring[i - 1][0], lat: ring[i - 1][1] };
      const b = { lng: ring[i][0], lat: ring[i][1] };
      minDistance = Math.min(minDistance, distancePointToSegmentM(point, a, b));
    }
  }
  return minDistance;
}

function nearestFeature(point, features) {
  let nearest = null;
  for (const feature of features) {
    const distanceM = distanceToGeometryM(point, feature.geometry);
    if (!nearest || distanceM < nearest.distanceM) {
      nearest = { feature, distanceM };
    }
  }
  return nearest;
}

function spatialScore({ insideRiskZone, insideControlZone, nearestRiskZoneDistanceM, nearestControlZoneDistanceM }) {
  let score = 35;
  if (insideRiskZone) score = 82;
  else if (nearestRiskZoneDistanceM <= 500) score = 72;
  else if (nearestRiskZoneDistanceM <= 1500) score = 62;
  else if (nearestRiskZoneDistanceM <= 3000) score = 52;

  if (insideControlZone) score += 15;
  else if (nearestControlZoneDistanceM <= 1000) score += 8;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildSpatialExposure(locations, riskGeojson, controlGeojson) {
  return {
    generatedAt: new Date().toISOString(),
    method: "candidate point vs KCG WGS84 polygon layers; point-in-polygon plus nearest boundary distance",
    limitation: "후보지를 단일 대표 좌표로 계산하므로 실제 운영 전에는 주차장·진입로·갯벌 접근로 등 후보 구역 polygon으로 재계산해야 한다.",
    locations: locations.map((location) => {
      const point = { lat: location.lat, lng: location.lng };
      const riskInside = riskGeojson.features.filter((feature) => geometryContainsPoint(feature.geometry, point));
      const controlInside = controlGeojson.features.filter((feature) => geometryContainsPoint(feature.geometry, point));
      const nearestRisk = nearestFeature(point, riskGeojson.features);
      const nearestControl = nearestFeature(point, controlGeojson.features);
      const nearestRiskZoneDistanceM = Math.round(nearestRisk?.distanceM ?? -1);
      const nearestControlZoneDistanceM = Math.round(nearestControl?.distanceM ?? -1);

      return {
        locationId: location.id,
        locationName: location.displayName || location.name,
        point,
        insideCoastalRiskZone: riskInside.length > 0,
        insideOfficialControlZone: controlInside.length > 0,
        nearestCoastalRiskZoneDistanceM: nearestRiskZoneDistanceM,
        nearestControlZoneDistanceM,
        coastalRiskZoneName: riskInside[0]?.properties?.placeName || nearestRisk?.feature?.properties?.placeName || null,
        coastalRiskZoneType: riskInside[0]?.properties?.zoneType || nearestRisk?.feature?.properties?.zoneType || null,
        controlZoneName: controlInside[0]?.properties?.name || nearestControl?.feature?.properties?.name || null,
        authorityOwner: controlInside[0]?.properties?.announceme || nearestControl?.feature?.properties?.announceme || null,
        spatialExposureScore: spatialScore({
          insideRiskZone: riskInside.length > 0,
          insideControlZone: controlInside.length > 0,
          nearestRiskZoneDistanceM,
          nearestControlZoneDistanceM
        }),
        evidence: {
          riskZoneFeatureId: riskInside[0]?.id || nearestRisk?.feature?.id || null,
          controlZoneFeatureId: controlInside[0]?.id || nearestControl?.feature?.id || null
        }
      };
    })
  };
}

function findFirstByExt(dir, ext) {
  return fs.readdirSync(dir)
    .map((file) => path.join(dir, file))
    .find((filePath) => filePath.toLowerCase().endsWith(ext));
}

function recordMatchesAnsan(record) {
  return /안산|대부|구봉|탄도|방아머리|선감|풍도|시화/.test(Object.values(record).join(" "));
}

function readSpatialLayer({ id, name, dir, dbfEncoding, fieldNameOverrides, geojsonOutputPath }) {
  const dbfPath = findFirstByExt(dir, ".dbf");
  const shpPath = findFirstByExt(dir, ".shp");
  const prjPath = findFirstByExt(dir, ".prj");
  const cpgPath = findFirstByExt(dir, ".cpg");
  const dbf = dbfPath ? readDbf(dbfPath, dbfEncoding, fieldNameOverrides) : null;
  const geojson = shpPath && dbf ? buildGeoJson(shpPath, dbf.records, name) : null;

  if (geojson && geojsonOutputPath) {
    ensureDir(geojsonOutputPath);
    fs.writeFileSync(geojsonOutputPath, `${JSON.stringify(geojson, null, 2)}\n`, "utf8");
  }

  return {
    id,
    name,
    sourceDirectory: path.relative(rootDir, dir).replace(/\\/g, "/"),
    cpg: cpgPath ? readText(cpgPath, "utf-8").trim() : null,
    prj: prjPath ? readText(prjPath, "utf-8").trim() : null,
    shp: shpPath ? readShp(shpPath) : null,
    dbf: dbf
      ? {
          path: dbf.path,
          encoding: dbf.encoding,
          recordCount: dbf.recordCount,
          headerLength: dbf.headerLength,
          recordLength: dbf.recordLength,
          fields: dbf.fields,
          sampleRecords: dbf.sampleRecords,
          ansanMatchedRecords: dbf.records.filter(recordMatchesAnsan)
        }
      : null,
    geojsonOutput: geojsonOutputPath ? path.relative(rootDir, geojsonOutputPath).replace(/\\/g, "/") : null,
    usableForMap: Boolean(shpPath && dbfPath && prjPath),
    nextStep: "GeoJSON 변환 후 후보지 point-in-polygon 및 최단거리 계산에 사용"
  };
}

function main() {
  if (!fs.existsSync(accidentCsvPath)) {
    throw new Error(`Missing local KCG accident CSV: ${accidentCsvPath}`);
  }

  const master = JSON.parse(fs.readFileSync(masterPath, "utf8"));
  const accidentRows = parseCsv(readText(accidentCsvPath, "euc-kr"));
  const directAnsanRows = accidentRows.filter(isDirectAnsan);
  const gyeonggiCoastRows = accidentRows.filter(isGyeonggiCoast);
  const jurisdictionProxyRows = accidentRows.filter(isJurisdictionProxy);
  const modelBaseRows = [...new Map([...directAnsanRows, ...gyeonggiCoastRows, ...jurisdictionProxyRows].map((row) => [JSON.stringify(row), row])).values()];

  const localSummary = summarizeAccidents([...new Map([...directAnsanRows, ...gyeonggiCoastRows].map((row) => [JSON.stringify(row), row])).values()]);
  const proxySummary = summarizeAccidents(jurisdictionProxyRows);

  const localAccidentOutput = {
    generatedAt: new Date().toISOString(),
    source: {
      agency: "해양경찰청",
      name: "해양경찰청_연안사고 이력_20231231.csv",
      path: path.relative(rootDir, accidentCsvPath).replace(/\\/g, "/"),
      encoding: "euc-kr/cp949",
      sourceDate: "2023-12-31"
    },
    columns: Object.keys(accidentRows[0] || {}),
    totalRows: accidentRows.length,
    filters: {
      directAnsanRows: directAnsanRows.length,
      gyeonggiCoastRows: gyeonggiCoastRows.length,
      pyeongtaekJurisdictionProxyRows: jurisdictionProxyRows.length,
      modelBaseRows: modelBaseRows.length
    },
    summaryAll: summarizeAccidents(accidentRows),
    summaryLocal: localSummary,
    summaryJurisdictionProxy: proxySummary,
    localRecords: modelBaseRows
  };

  const localModel = {
    modelName: "kcg-local-accident-history-prior-v1",
    trainedAt: new Date().toISOString(),
    modelType: "rule-based local/proxy prior from KCG coastal accident history",
    source: localAccidentOutput.source,
    filters: localAccidentOutput.filters,
    limitation: "안산 직접 표기 사고가 적어 평택해경 관할/경기도 연안 proxy를 함께 사용한다. 후보지별 정밀 모델은 더 상세한 위치 좌표 또는 내부 사고위치 데이터가 필요하다.",
    priors: master.locations.map((location) => scoreForLocation(location, localSummary, proxySummary)),
    featureSummary: {
      localAccidentTypes: localSummary.byAccidentType.slice(0, 10),
      localPlaceTypes: localSummary.byPlaceType.slice(0, 10),
      localCauses: localSummary.byCause.slice(0, 10),
      proxyAccidentTypes: proxySummary.byAccidentType.slice(0, 10)
    }
  };

  const riskLayer = readSpatialLayer({
    id: "kcg_coastal_risk_zones",
    name: "해양경찰청 연안위험구역현황",
    dir: riskZoneDir,
    dbfEncoding: "utf-8",
    fieldNameOverrides: ["name", "policeStation", "areaName", "zoneType", "placeName", "placeType", "address"],
    geojsonOutputPath: riskZoneGeojsonOutputPath
  });
  const controlLayer = readSpatialLayer({
    id: "kcg_control_zones",
    name: "해양경찰청 연안 출입통제구역 현황",
    dir: controlZoneDir,
    dbfEncoding: "euc-kr",
    geojsonOutputPath: controlZoneGeojsonOutputPath
  });

  const riskGeojson = JSON.parse(fs.readFileSync(riskZoneGeojsonOutputPath, "utf8"));
  const controlGeojson = JSON.parse(fs.readFileSync(controlZoneGeojsonOutputPath, "utf8"));
  const spatialExposure = buildSpatialExposure(master.locations, riskGeojson, controlGeojson);

  const spatialInventory = {
    generatedAt: new Date().toISOString(),
    layers: [riskLayer, controlLayer]
  };

  ensureDir(localAccidentOutputPath);
  ensureDir(spatialInventoryOutputPath);
  ensureDir(localModelOutputPath);
  ensureDir(spatialExposureOutputPath);
  fs.writeFileSync(localAccidentOutputPath, `${JSON.stringify(localAccidentOutput, null, 2)}\n`, "utf8");
  fs.writeFileSync(spatialInventoryOutputPath, `${JSON.stringify(spatialInventory, null, 2)}\n`, "utf8");
  fs.writeFileSync(localModelOutputPath, `${JSON.stringify(localModel, null, 2)}\n`, "utf8");
  fs.writeFileSync(spatialExposureOutputPath, `${JSON.stringify(spatialExposure, null, 2)}\n`, "utf8");

  console.log(`KCG accident rows: ${accidentRows.length}`);
  console.log(`Direct Ansan rows: ${directAnsanRows.length}`);
  console.log(`Gyeonggi coast rows: ${gyeonggiCoastRows.length}`);
  console.log(`Pyeongtaek jurisdiction proxy rows: ${jurisdictionProxyRows.length}`);
  console.log(`Wrote ${localAccidentOutputPath}`);
  console.log(`Wrote ${localModelOutputPath}`);
  console.log(`Wrote ${spatialInventoryOutputPath}`);
  console.log(`Wrote ${riskZoneGeojsonOutputPath}`);
  console.log(`Wrote ${controlZoneGeojsonOutputPath}`);
  console.log(`Wrote ${spatialExposureOutputPath}`);
}

main();
