const fallbackData = {
  settings: {
    facilityName: "",
    subtitle: "주요일정 안내",
    noticeTitle: "📢 6월 주요일정",
    footerTitle: "공지 안내",
    footerText: "복지관 이용문의는 1층(운영, 시설, 활동지원서비스), 2층(각 프로그램) 개별 사무실에 문의주시면 감사하겠습니다. | 오늘 하루도 행복하고 건강한 시간 보내세요.",
    youtubeId: "",
    youtubeUrl: "",
    youtubePlaylistId: "",
    bannerSeconds: 8,
    noticeScrollSeconds: 22,
    tickerSeconds: 25,
    refreshMinutes: 5,
    weatherEnabled: true,
    weatherLatitude: 37.6360,
    weatherLongitude: 127.2165,
    weatherLabel: "남양주"
  },
  banners: [
    {
      visible: true,
      imageUrl: "./assets/default-banner.png",
      alt: "남양주시장애인복지관 안내 배너"
    }
  ],
  notices: [
    {
      visible: true,
      important: true,
      title: "🏢 활동지원사업 평가(6-29 회의실)",
      date: "06-29"
    }
  ]
};

const config = window.KIOSK_CONFIG || {};
const dataUrl = config.DATA_URL || "./data/onedrive-board-template.csv";
const dataFormat = (config.DATA_FORMAT || "csv").toLowerCase();

let currentBannerIndex = 0;
let bannerTimer = null;
let refreshTimer = null;
let latestData = fallbackData;

window.addEventListener("DOMContentLoaded", () => {
  fitStage();
  window.addEventListener("resize", fitStage);

  updateDateTime();
  setInterval(updateDateTime, 1000);

  loadAndRenderData();
});

function fitStage() {
  const stage = document.getElementById("stage");
  const baseWidth = 1080;
  const baseHeight = 1920;
  const scale = Math.min(window.innerWidth / baseWidth, window.innerHeight / baseHeight);
  const left = Math.max((window.innerWidth - baseWidth * scale) / 2, 0);
  const top = Math.max((window.innerHeight - baseHeight * scale) / 2, 0);

  stage.style.transform = `translate3d(${left}px, ${top}px, 0) scale(${scale})`;
}

async function loadAndRenderData() {
  try {
    const rawText = await fetchTextWithFallbacks(dataUrl);
    let loadedData;

    if (dataFormat === "csv") {
      loadedData = csvRowsToData(parseCsv(rawText));
    } else {
      loadedData = JSON.parse(rawText);
    }

    latestData = mergeData(fallbackData, loadedData);
  } catch (error) {
    console.warn("CSV/JSON을 불러오지 못해 기본 데이터로 표시합니다.", error);
    latestData = fallbackData;
  }

  renderAll(latestData);
  scheduleDataRefresh(latestData.settings.refreshMinutes || config.REFRESH_MINUTES || 5);
}

function scheduleDataRefresh(minutes) {
  const safeMinutes = Math.max(Number(minutes || 5), 1);
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(loadAndRenderData, safeMinutes * 60 * 1000);
}

async function fetchTextWithFallbacks(url) {
  const urls = makeFetchUrls(url);
  let lastError;

  for (const candidate of urls) {
    try {
      const response = await fetch(`${candidate}${candidate.includes("?") ? "&" : "?"}_=${Date.now()}`, {
        cache: "no-store",
        redirect: "follow"
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const text = await response.text();
      if (looksLikeHtml(text)) throw new Error("CSV가 아니라 OneDrive 미리보기 HTML이 내려왔습니다. 직접 다운로드 링크가 필요합니다.");
      return text;
    } catch (error) {
      lastError = error;
      console.warn(`데이터 주소 시도 실패: ${candidate}`, error);
    }
  }

  throw lastError || new Error("데이터 파일을 불러오지 못했습니다.");
}

function makeFetchUrls(url) {
  const original = String(url || "").trim();
  if (!original) return [];

  const candidates = [original];

  try {
    const parsed = new URL(original, window.location.href);
    if (!parsed.searchParams.has("download")) {
      parsed.searchParams.set("download", "1");
      candidates.push(parsed.toString());
    }
  } catch (error) {
    // 상대경로 등 URL 변환이 안 되는 경우 원본만 사용합니다.
  }

  return [...new Set(candidates)];
}

function looksLikeHtml(text) {
  const sample = String(text || "").trim().slice(0, 200).toLowerCase();
  return sample.startsWith("<!doctype html") || sample.startsWith("<html") || sample.includes("<body");
}

function mergeData(base, incoming) {
  const merged = {
    settings: { ...base.settings, ...(incoming.settings || {}) },
    banners: Array.isArray(incoming.banners) && incoming.banners.length ? incoming.banners : base.banners,
    notices: Array.isArray(incoming.notices) && incoming.notices.length ? incoming.notices : base.notices
  };

  return merged;
}

function renderAll(data) {
  renderTextSettings(data.settings);
  renderYoutube(data.settings);
  renderBanners(data.banners, data.settings);
  renderNotices(data.notices, data.settings);
  renderWeather(data.settings);
}

function renderTextSettings(settings) {
  document.getElementById("facility-name").textContent = settings.facilityName || "";
  document.getElementById("subtitle").textContent = settings.subtitle || "주요일정 안내";
  document.getElementById("notice-title").textContent = settings.noticeTitle || "📢 주요일정";
  document.getElementById("footer-title").textContent = settings.footerTitle || "공지 안내";

  const footerTicker = document.getElementById("footer-ticker");
  footerTicker.textContent = settings.footerText || "";
  footerTicker.style.setProperty("--ticker-duration", `${Number(settings.tickerSeconds || 25)}s`);
}

function renderYoutube(settings) {
  const videoArea = document.getElementById("video-area");
  const youtubeId = settings.youtubeId || extractYoutubeId(settings.youtubeUrl || "");
  const playlistId = settings.youtubePlaylistId || youtubeId;

  videoArea.innerHTML = "";

  if (!youtubeId) {
    videoArea.innerHTML = `
      <div class="video-placeholder">
        <div class="placeholder-title">유튜브 영상 준비 중</div>
        <div class="placeholder-desc">CSV 파일의 youtubeId 또는 youtubeUrl 값을 입력해주세요.</div>
      </div>
    `;
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.title = "복지관 안내 유튜브 영상";
  iframe.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
  iframe.allowFullscreen = true;

  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: playlistId,
    controls: "0",
    modestbranding: "1",
    rel: "0",
    playsinline: "1",
    iv_load_policy: "3",
    fs: "0"
  });

  iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?${params.toString()}`;
  videoArea.appendChild(iframe);
}

function extractYoutubeId(url) {
  if (!url) return "";

  const patterns = [
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/watch\?v=([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
    /youtube\.com\/shorts\/([^?&#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }

  return "";
}

function renderBanners(banners, settings) {
  const visibleBanners = (banners || []).filter(isVisible);
  const bannerImage = document.getElementById("banner-image");
  const bannerSeconds = Number(settings.bannerSeconds || 8);

  if (bannerTimer) clearInterval(bannerTimer);

  if (!visibleBanners.length) {
    bannerImage.src = "./assets/default-banner.png";
    bannerImage.alt = "기본 배너";
    return;
  }

  currentBannerIndex = currentBannerIndex % visibleBanners.length;

  const showBanner = () => {
    const banner = visibleBanners[currentBannerIndex];
    bannerImage.style.opacity = "0";

    setTimeout(() => {
      bannerImage.src = banner.imageUrl || "./assets/default-banner.png";
      bannerImage.alt = banner.alt || banner.title || "배너 이미지";
      bannerImage.style.opacity = "1";
      currentBannerIndex = (currentBannerIndex + 1) % visibleBanners.length;
    }, 250);
  };

  showBanner();

  if (visibleBanners.length > 1) {
    bannerTimer = setInterval(showBanner, Math.max(bannerSeconds, 3) * 1000);
  }
}

function renderNotices(notices, settings) {
  const visibleNotices = (notices || []).filter(isVisible);
  const list = document.getElementById("notice-rolling-list");
  list.innerHTML = "";

  if (!visibleNotices.length) {
    const emptyItem = createNoticeItem({
      title: "등록된 공지가 없습니다.",
      date: ""
    });
    list.appendChild(emptyItem);
    list.classList.add("paused");
    return;
  }

  const shouldRoll = visibleNotices.length >= 5;
  const renderItems = shouldRoll ? [...visibleNotices, ...visibleNotices] : visibleNotices;

  renderItems.forEach((notice) => {
    list.appendChild(createNoticeItem(notice));
  });

  list.classList.toggle("paused", !shouldRoll);
  list.style.setProperty("--notice-duration", `${Number(settings.noticeScrollSeconds || 22)}s`);
}

function createNoticeItem(notice) {
  const li = document.createElement("li");
  li.className = `notice-item ${notice.important ? "" : "normal"}`;

  const title = document.createElement("span");
  title.className = "item-title";
  title.textContent = notice.title || "";

  const date = document.createElement("span");
  date.className = "item-date";
  date.textContent = notice.date || "";

  li.appendChild(title);
  li.appendChild(date);

  return li;
}

function isVisible(item) {
  if (!item) return false;
  const value = item.visible;
  if (typeof value === "boolean") return value;
  if (value === undefined || value === null || value === "") return true;

  return ["y", "yes", "true", "1", "노출", "예", "o", "on"].includes(String(value).trim().toLowerCase());
}

function updateDateTime() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const weekList = ["일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = weekList[now.getDay()];

  document.getElementById("date-box").textContent = `${month}월 ${date}일 (${dayOfWeek})`;

  let hours = now.getHours();
  let minutes = now.getMinutes();
  hours = hours < 10 ? `0${hours}` : hours;
  minutes = minutes < 10 ? `0${minutes}` : minutes;

  document.getElementById("clock").textContent = `${hours}:${minutes}`;
}

async function renderWeather(settings) {
  const temp = document.getElementById("temp");
  const status = document.getElementById("weather-status");

  if (!isVisible({ visible: settings.weatherEnabled })) {
    temp.textContent = "--°C";
    status.textContent = "날씨";
    return;
  }

  const latitude = Number(settings.weatherLatitude || 37.6360);
  const longitude = Number(settings.weatherLongitude || 127.2165);
  const label = settings.weatherLabel || "남양주";

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&current=temperature_2m,weather_code&timezone=Asia%2FSeoul`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("날씨 API 연결 실패");

    const data = await response.json();
    const temperature = Math.round(data.current.temperature_2m);
    const code = Number(data.current.weather_code);

    temp.textContent = `${temperature}°C`;
    status.textContent = `${weatherCodeToKorean(code)} ${label}`;
  } catch (error) {
    console.warn(error);
    temp.textContent = "--°C";
    status.textContent = "통신확인";
  }
}

function weatherCodeToKorean(code) {
  if (code === 0) return "☀️ 맑음";
  if ([1, 2].includes(code)) return "🌤️ 구름조금";
  if (code === 3) return "☁️ 흐림";
  if ([45, 48].includes(code)) return "🌫️ 안개";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️ 이슬비";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️ 비";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️ 눈";
  if ([95, 96, 99].includes(code)) return "⛈️ 뇌우";
  return "🌤️ 날씨";
}

/* CSV 지원: 한글 헤더/영문 헤더 모두 가능 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);

  if (!rows.length) return [];

  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim());
  return rows.slice(1).map((cells) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = (cells[index] || "").trim();
    });
    return obj;
  });
}

function csvRowsToData(rows) {
  const data = {
    settings: {},
    banners: [],
    notices: []
  };

  rows.forEach((row) => {
    const type = String(row.type || row.구분 || "").trim().toLowerCase();

    if (type === "setting" || type === "설정") {
      const key = row.key || row.항목;
      const value = row.value || row.내용;
      if (key) data.settings[key] = castValue(value);
    }

    if (type === "banner" || type === "배너") {
      data.banners.push({
        visible: castValue(row.visible || row.노출),
        title: row.title || row.제목,
        imageUrl: row.imageUrl || row.이미지주소,
        alt: row.alt || row.설명
      });
    }

    if (type === "notice" || type === "공지") {
      data.notices.push({
        visible: castValue(row.visible || row.노출),
        important: castValue(row.important || row.강조),
        title: row.title || row.제목,
        date: row.date || row.날짜
      });
    }
  });

  return data;
}

function castValue(value) {
  if (value === undefined || value === null) return "";

  const text = String(value).trim();

  if (["true", "TRUE", "Y", "y", "예", "노출", "1", "O", "o", "on", "ON"].includes(text)) return true;
  if (["false", "FALSE", "N", "n", "아니오", "숨김", "0", "X", "x", "off", "OFF"].includes(text)) return false;

  if (text !== "" && !Number.isNaN(Number(text))) return Number(text);

  return text;
}
