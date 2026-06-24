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
    refreshMinutes: 10,
    weatherEnabled: false,
    weatherApiKey: "",
    weatherCity: "Namyangju"
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
      date: "06-22"
    },
    {
      visible: true,
      important: false,
      title: "🤝 한국수자원공사 동북권지사 후원물품 전달식(6-23, 10:30 ~ 11:00)",
      date: "06-22"
    }
  ]
};

const config = window.KIOSK_CONFIG || {};
const dataUrl = config.DATA_URL || "./data/data.json";
const dataFormat = (config.DATA_FORMAT || "json").toLowerCase();

let currentBannerIndex = 0;
let bannerTimer = null;
let latestData = fallbackData;

document.addEventListener("DOMContentLoaded", () => {
  fitStage();
  window.addEventListener("resize", fitStage);

  updateDateTime();
  setInterval(updateDateTime, 1000);

  loadAndRenderData();

  const refreshMinutes = Number(fallbackData.settings.refreshMinutes || 10);
  setInterval(loadAndRenderData, Math.max(refreshMinutes, 1) * 60 * 1000);
});

function fitStage() {
  const stage = document.getElementById("stage");
  const scale = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
  const left = (window.innerWidth - 1080 * scale) / 2;
  const top = (window.innerHeight - 1920 * scale) / 2;

  stage.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
}

async function loadAndRenderData() {
  try {
    const response = await fetch(`${dataUrl}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("데이터 파일을 불러오지 못했습니다.");

    const rawText = await response.text();
    let loadedData;

    if (dataFormat === "csv") {
      loadedData = csvRowsToData(parseCsv(rawText));
    } else {
      loadedData = JSON.parse(rawText);
    }

    latestData = mergeData(fallbackData, loadedData);
  } catch (error) {
    console.warn("기본 데이터로 표시합니다.", error);
    latestData = fallbackData;
  }

  renderAll(latestData);
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
        <div class="placeholder-desc">data/data.json 파일의 youtubeId 값을 입력해주세요.</div>
      </div>
    `;
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.title = "복지관 안내 유튜브 영상";
  iframe.allow = "autoplay; encrypted-media; fullscreen";
  iframe.allowFullscreen = true;
  iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&mute=1&loop=1&playlist=${encodeURIComponent(playlistId)}&controls=0&modestbranding=1&rel=0&playsinline=1`;

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

  return ["y", "yes", "true", "1", "노출", "o", "on"].includes(String(value).trim().toLowerCase());
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

  if (!settings.weatherEnabled || !settings.weatherApiKey) {
    temp.textContent = "--°C";
    status.textContent = "날씨";
    return;
  }

  const weatherMap = {
    Clear: "☀️ 맑음",
    Clouds: "☁️ 흐림",
    Rain: "🌧️ 비",
    Drizzle: "🌦️ 이슬비",
    Thunderstorm: "⛈️ 뇌우",
    Snow: "❄️ 눈",
    Mist: "🌫️ 안개",
    Smoke: "🌫️ 안개",
    Haze: "🌫️ 안개",
    Dust: "😷 황사",
    Fog: "🌫️ 안개"
  };

  try {
    const city = settings.weatherCity || "Namyangju";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${encodeURIComponent(settings.weatherApiKey)}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("날씨 API 연결 실패");

    const data = await response.json();
    const temperature = Math.round(data.main.temp);
    const mainStatus = data.weather[0].main;
    temp.textContent = `${temperature}°C`;
    status.textContent = weatherMap[mainStatus] || "🌤️ 날씨";
  } catch (error) {
    console.warn(error);
    temp.textContent = "--°C";
    status.textContent = "통신확인";
  }
}

/* CSV 지원: type,key,value,visible,important,title,date,imageUrl,alt */
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

  const headers = rows[0].map((header) => header.trim());
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

  if (["true", "TRUE", "Y", "y", "예", "노출", "1", "O", "o"].includes(text)) return true;
  if (["false", "FALSE", "N", "n", "아니오", "숨김", "0", "X", "x"].includes(text)) return false;

  if (text !== "" && !Number.isNaN(Number(text))) return Number(text);

  return text;
}
