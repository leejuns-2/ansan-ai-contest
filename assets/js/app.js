const factorLabels = {
  tide: "조위",
  weather: "기상",
  visitor: "유동인구",
  history: "사고이력",
  spatial: "공간",
  field: "현장신호"
};

const factorWeights = {
  tide: 0.25,
  weather: 0.18,
  visitor: 0.18,
  history: 0.14,
  spatial: 0.12,
  field: 0.13
};

const state = {
  data: null,
  time: null,
  locationId: "A01",
  role: "smart",
  enabledFactors: {
    tide: true,
    weather: true,
    visitor: true,
    history: true,
    spatial: true,
    field: true
  },
  selectedActions: new Set(),
  audit: []
};

function levelClass(label) {
  return {
    낮음: "low",
    주의: "watch",
    높음: "high",
    긴급: "urgent"
  }[label] || "neutral";
}

function getTimes() {
  return state.data.locations[0].series.map((item) => item.time);
}

function getLocation(id = state.locationId) {
  return state.data.locations.find((location) => location.id === id) || state.data.locations[0];
}

function getPoint(location = getLocation(), time = state.time) {
  return location.series.find((item) => item.time === time) || location.series[0];
}

function activeWeightMap() {
  const active = Object.entries(state.enabledFactors).filter(([, enabled]) => enabled);
  const total = active.reduce((sum, [key]) => sum + factorWeights[key], 0);
  return Object.fromEntries(active.map(([key]) => [key, factorWeights[key] / total]));
}

function computeRisk(point) {
  const weights = activeWeightMap();
  const score = Object.entries(weights).reduce((sum, [key, weight]) => sum + point.factorScores[key] * weight, 0);
  return Math.round(score);
}

function computeLevel(score) {
  if (score >= 85) return "긴급";
  if (score >= 70) return "높음";
  if (score >= 50) return "주의";
  return "낮음";
}

function sortedSummaries() {
  return state.data.locations
    .map((location) => {
      const point = getPoint(location);
      const score = computeRisk(point);
      return { location, point, score, level: computeLevel(score) };
    })
    .sort((a, b) => b.score - a.score);
}

function activeReasons(point) {
  return Object.entries(point.factorScores)
    .filter(([key]) => state.enabledFactors[key])
    .map(([key, score]) => ({
      key,
      label: factorLabels[key],
      score,
      description: point.reasons.find((reason) => reason.key === key)?.label || factorLabels[key]
    }))
    .sort((a, b) => b.score - a.score);
}

function catalogById(id) {
  return state.data.recommendationCatalog.find((item) => item.id === id);
}

function getRoleOwner() {
  const map = {
    smart: "스마트도시과 총괄",
    safety: "재난안전 협업",
    tourism: "관광·현장관리"
  };
  return map[state.role];
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function renderControls() {
  const timeSelect = document.getElementById("timeSelect");
  if (!timeSelect.options.length) {
    getTimes().forEach((time) => {
      const option = document.createElement("option");
      option.value = time;
      option.textContent = time;
      timeSelect.appendChild(option);
    });
  }
  timeSelect.value = state.time;
  document.getElementById("roleSelect").value = state.role;
  setText("timeBadge", state.time);
}

function renderRibbon() {
  const summaries = sortedSummaries();
  const top = summaries[0];
  const openActions = getActiveRecommendations(top.point).length;
  setText("scenarioDate", state.data.scenarioDate);
  setText("highestRisk", `${top.location.name} ${top.score}점`);
  setText("openActions", `${openActions}건`);
  setText("dataStatus", "샘플 PoC · 실제 연계 전");
}

function renderLocations() {
  const container = document.getElementById("locationList");
  container.innerHTML = "";

  sortedSummaries().forEach(({ location, score, level }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `location-card ${location.id === state.locationId ? "active" : ""}`;
    button.dataset.location = location.id;
    button.innerHTML = `
      <span class="location-id">${location.id}</span>
      <strong>${location.name}</strong>
      <span>${location.type}</span>
      <span class="card-score ${levelClass(level)}">${score}점 · ${level}</span>
    `;
    container.appendChild(button);
  });
}

function renderMap() {
  state.data.locations.forEach((location) => {
    const point = getPoint(location);
    const score = computeRisk(point);
    const level = computeLevel(score);
    const marker = document.querySelector(`.marker[data-location="${location.id}"]`);
    if (!marker) return;
    marker.className = `marker ${levelClass(level)} ${location.id === state.locationId ? "active" : ""}`;
    marker.setAttribute("aria-label", `${location.name} ${score}점 ${level}`);
  });

  const table = document.getElementById("riskTable");
  table.innerHTML = sortedSummaries()
    .map(({ location, score, level }) => {
      return `
        <div class="risk-row">
          <span>${location.id}</span>
          <strong>${location.name}</strong>
          <span class="level-text ${levelClass(level)}">${level}</span>
          <span>${score}점</span>
        </div>
      `;
    })
    .join("");
}

function renderRiskDetail() {
  const location = getLocation();
  const point = getPoint(location);
  const score = computeRisk(point);
  const level = computeLevel(score);
  const previousIndex = Math.max(0, location.series.findIndex((item) => item.time === state.time) - 1);
  const previousScore = computeRisk(location.series[previousIndex]);
  const delta = score - previousScore;

  setText("selectedName", location.name);
  setText("selectedMeta", `${location.type} · ${location.manager}`);
  const levelChip = document.getElementById("selectedLevel");
  levelChip.textContent = level;
  levelChip.className = `level-chip ${levelClass(level)}`;
  setText("riskScore", String(score));
  setText("riskDelta", `${delta >= 0 ? "+" : ""}${delta}점 / 이전 시간`);
  document.getElementById("riskBar").style.width = `${score}%`;
  document.getElementById("riskBar").className = levelClass(level);

  const reasonList = document.getElementById("reasonList");
  reasonList.innerHTML = activeReasons(point)
    .slice(0, 5)
    .map((reason) => `<li><strong>${reason.description}</strong><span>${reason.score}점</span></li>`)
    .join("");

  const factorBars = document.getElementById("factorBars");
  factorBars.innerHTML = Object.entries(point.factorScores)
    .map(([key, value]) => {
      const enabled = state.enabledFactors[key];
      return `
        <div class="factor-row ${enabled ? "" : "disabled"}">
          <span>${factorLabels[key]}</span>
          <div class="mini-track"><div style="width:${value}%"></div></div>
          <strong>${value}</strong>
        </div>
      `;
    })
    .join("");

  const raw = point.rawSignals;
  const rawItems = [
    ["조위", `${raw.tideCm}cm`],
    ["만조까지", `${raw.minutesToHighTide}분`],
    ["조위 변화", `${raw.tideDeltaCmPerHour}cm/h`],
    ["풍속", `${raw.windMps}m/s`],
    ["돌풍", raw.windGustMps == null ? "-" : `${raw.windGustMps}m/s`],
    ["기온", raw.temperature2m == null ? "-" : `${raw.temperature2m}°C`],
    ["시정", raw.visibilityM == null ? "-" : `${raw.visibilityM}m`],
    ["유동지수", `${raw.visitorIndex}%`],
    ["이력 prior", `${raw.historyPriorScore}점`],
    ["체류", `${raw.avgStayMinutes}분`],
    ["추정 인원", `${raw.anonymousCrowdCount}명`],
    ["복귀 지연", `${raw.returnDelayGroups}군집`]
  ];

  document.getElementById("rawSignals").innerHTML = rawItems
    .map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

function getActiveRecommendations(point = getPoint()) {
  const topKeys = activeReasons(point).slice(0, 4).map((reason) => reason.key);
  const ids = point.recommendationIds.filter((id) => {
    const item = catalogById(id);
    if (!item) return false;
    if (id === "field-broadcast") return topKeys.includes("field");
    if (id === "return-guidance") return topKeys.includes("tide");
    if (id === "wind-warning") return topKeys.includes("weather");
    if (id === "visitor-prealert") return topKeys.includes("visitor");
    if (id === "agency-share") return topKeys.includes("history");
    if (id === "facility-review") return topKeys.includes("spatial");
    return true;
  });

  return ids.map(catalogById).filter(Boolean);
}

function renderRecommendations() {
  const location = getLocation();
  const point = getPoint(location);
  const list = document.getElementById("recommendationList");
  const recommendations = getActiveRecommendations(point);
  setText("actionOwner", getRoleOwner());

  list.innerHTML = recommendations
    .map((item) => {
      const selected = state.selectedActions.has(item.id);
      return `
        <article class="recommendation ${selected ? "selected" : ""}">
          <div>
            <strong>${item.title}</strong>
            <p>${item.effect}</p>
            <div class="pill-row">
              <span>${item.owner}</span>
              <span>${item.channel}</span>
              <span>${item.authorityRisk}</span>
              <span>난이도 ${item.effort}</span>
            </div>
          </div>
          <button type="button" data-action="${item.id}">${selected ? "등록됨" : "실행 예정 등록"}</button>
        </article>
      `;
    })
    .join("");
}

function renderReport() {
  const location = getLocation();
  const point = getPoint(location);
  const score = computeRisk(point);
  const level = computeLevel(score);
  const reasons = activeReasons(point)
    .slice(0, 3)
    .map((reason) => reason.description)
    .join(", ");
  const selected = Array.from(state.selectedActions).map(catalogById).filter(Boolean);
  const actions = selected.length ? selected.map((item) => `- ${item.title} (${item.owner})`).join("\n") : "- 검토 중";

  document.getElementById("shareReport").textContent = [
    `[안산 세이프코스트 AI] 고위험상황 예측 공유`,
    `기준: ${state.data.scenarioDate} ${state.time}`,
    ``,
    `위치: ${location.name}`,
    `장소 유형: ${location.type}`,
    `위험도: ${score}점 / ${level}`,
    `주요 원인: ${reasons}`,
    `권한 구분: ${location.authority}`,
    ``,
    `안산시 예정 조치:`,
    actions,
    ``,
    `공유 요청:`,
    `- 고위험 시간대 상황 공유 및 순찰 협조 검토`,
    ``,
    `권한 안내:`,
    `본 리포트는 예방 행정 지원 자료이며 구조·통제 권한을 대체하지 않습니다.`
  ].join("\n");
}

function renderPlaybook() {
  const steps = [
    ["위험 예측 확인", "완료"],
    ["권고 조치 검토", state.selectedActions.size ? "완료" : "진행"],
    ["관계기관 공유", state.selectedActions.has("agency-share") ? "예약" : "대기"],
    ["시민 안내 채널 반영", state.selectedActions.size ? "예약" : "대기"],
    ["사후 효과 분석", "대기"]
  ];

  document.getElementById("playbook").innerHTML = steps
    .map(([label, status], index) => `
      <div class="playbook-step">
        <span>${index + 1}</span>
        <strong>${label}</strong>
        <em>${status}</em>
      </div>
    `)
    .join("");

  setText("playbookStatus", state.selectedActions.size ? "실행 예약" : "검토 중");

  const location = getLocation();
  const effect = location.effectBaseline;
  document.getElementById("effectMetrics").innerHTML = [
    ["체류 추정 감소", `${effect.stayReductionPct}%`],
    ["접근량 감소", `${effect.accessReductionPct}%`],
    ["관계기관 공유", `${effect.agencyShares}회`],
    ["개선 후보", effect.nextImprovement]
  ]
    .map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

function renderDataLineage() {
  const container = document.getElementById("sourceLineage");
  container.innerHTML = state.data.sourceLineage
    .slice(0, 6)
    .map((source) => `
      <article class="source-card">
        <strong>${source.name}</strong>
        <span>${source.agency}</span>
        <span>${source.status}</span>
        <p>${source.use}</p>
      </article>
    `)
    .join("");
}

function renderPreprocessing() {
  const prep = state.data.preprocessing;
  const model = state.data.models?.historyPrior;
  const weights = Object.entries(prep.weights)
    .map(([key, value]) => `
      <div class="weight-row">
        <span>${factorLabels[key]}</span>
        <strong>${Math.round(value * 100)}%</strong>
      </div>
    `)
    .join("");

  document.getElementById("preprocessing").innerHTML = `
    <div class="formula">
      risk_score = 조위 25% + 기상 18% + 유동인구 18% + 사고이력 14% + 공간 12% + 현장신호 13%
    </div>
    <div class="weight-grid">${weights}</div>
    <p>시간 단위: ${prep.timeUnit} · 공간 단위: ${prep.spatialUnit} · 모델: ${prep.modelType}</p>
    ${model ? `<p>사고이력 prior: ${model.modelName} · 원천: ${model.source.name} · ${model.limitation}</p>` : ""}
  `;
}

function renderAudit() {
  const audit = [...state.data.auditTrail, ...state.audit];
  setText("auditCount", `${audit.length}건`);
  document.getElementById("auditTrail").innerHTML = audit
    .slice(-8)
    .reverse()
    .map((item) => `
      <div class="audit-item">
        <strong>${item.action}</strong>
        <span>${item.at} · ${item.actor} · ${item.status}</span>
      </div>
    `)
    .join("");
}

function render() {
  renderControls();
  renderRibbon();
  renderLocations();
  renderMap();
  renderRiskDetail();
  renderRecommendations();
  renderReport();
  renderPlaybook();
  renderDataLineage();
  renderPreprocessing();
  renderAudit();
}

function registerAction(actionId) {
  if (state.selectedActions.has(actionId)) {
    state.selectedActions.delete(actionId);
  } else {
    state.selectedActions.add(actionId);
    state.audit.push({
      at: new Date().toISOString(),
      actor: getRoleOwner(),
      action: `${catalogById(actionId)?.title || actionId} 실행 예정 등록`,
      status: "scheduled"
    });
  }
  render();
}

function bindEvents() {
  document.getElementById("timeSelect").addEventListener("change", (event) => {
    state.time = event.target.value;
    state.selectedActions.clear();
    render();
  });

  document.getElementById("roleSelect").addEventListener("change", (event) => {
    state.role = event.target.value;
    render();
  });

  document.querySelectorAll("[data-factor]").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      state.enabledFactors[event.target.dataset.factor] = event.target.checked;
      if (!Object.values(state.enabledFactors).some(Boolean)) {
        state.enabledFactors[event.target.dataset.factor] = true;
        event.target.checked = true;
      }
      render();
    });
  });

  document.body.addEventListener("click", (event) => {
    const locationButton = event.target.closest("[data-location]");
    if (locationButton) {
      state.locationId = locationButton.dataset.location;
      state.selectedActions.clear();
      render();
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      registerAction(actionButton.dataset.action);
    }
  });

  document.getElementById("copyReport").addEventListener("click", async () => {
    const text = document.getElementById("shareReport").textContent;
    try {
      await navigator.clipboard.writeText(text);
      document.getElementById("copyReport").textContent = "복사됨";
      setTimeout(() => {
        document.getElementById("copyReport").textContent = "복사";
      }, 1200);
    } catch {
      window.alert("브라우저 권한 때문에 복사하지 못했습니다.");
    }
  });
}

async function loadData() {
  if (window.__RISK_DATA__) {
    state.data = window.__RISK_DATA__;
    state.time = getTimes()[2] || getTimes()[0];
    state.audit = [];
    return;
  }

  const response = await fetch("data/processed/risk_timeseries.json");
  if (!response.ok) {
    throw new Error("Processed risk data not found. Run npm run preprocess or open through a local server.");
  }
  state.data = await response.json();
  state.time = getTimes()[2] || getTimes()[0];
  state.audit = [];
}

async function init() {
  try {
    await loadData();
    bindEvents();
    render();
  } catch (error) {
    document.body.innerHTML = `<main class="load-error"><h1>데이터 로드 실패</h1><p>${error.message}</p></main>`;
  }
}

init();
