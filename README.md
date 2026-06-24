# 남양주시장애인복지관 세로 키오스크

1080 × 1920 세로 키오스크용 GitHub Pages 파일입니다.

## 핵심 변경사항

- 기존 화면 비율 유지
- 유튜브 영상 ID 입력 시 자동재생, 무음, 무한반복
- 주요 일정은 OneDrive `xlsx` 파일을 수정하면 자동 반영
- 배너 이미지는 OneDrive 사진 폴더의 이미지 공유 링크를 관리표에 적으면 순서대로 표시
- 날씨는 별도 API 키 없이 Open-Meteo로 표시

## 파일 구성

```text
index.html
config.js
css/style.css
js/app.js
assets/logo.png
assets/default-banner.png
kiosk-board-template.xlsx
kiosk-board-template.csv
data/kiosk-board-template.csv
```

## 1. GitHub에 올리기

ZIP 압축을 풀고 `namjangbok-kiosk-github-v4` 폴더 안의 파일을 GitHub 저장소에 그대로 업로드합니다.

GitHub Pages를 켜면 키오스크 주소가 생성됩니다.

## 2. OneDrive xlsx 연결하기

1. `kiosk-board-template.xlsx`를 OneDrive에 업로드합니다.
2. OneDrive에서 공유를 누르고 `링크가 있는 사용자 보기 가능` 형태로 공유 링크를 만듭니다.
3. `config.js` 파일을 열어 아래 부분의 주소를 바꿉니다.

```js
window.KIOSK_CONFIG = {
  DATA_FORMAT: "xlsx",
  DATA_URL: "여기에 OneDrive xlsx 공유 링크 붙여넣기"
};
```

이후에는 OneDrive의 xlsx 파일만 수정하면 됩니다.

## 3. 주요 일정 수정

`키오스크_관리표` 시트에서 `구분=공지` 행을 수정합니다.

- 노출: `Y`면 표시, `N`이면 숨김
- 강조: `Y`면 빨간색 강조, `N`이면 일반 파란색
- 순서: 숫자가 작은 것부터 표시
- 제목: 화면에 보일 내용
- 날짜: 오른쪽에 보일 날짜

## 4. 배너 이미지 수정

OneDrive에 사진 폴더를 만들고 이미지를 올립니다.

예시:

```text
키오스크_사진
├─ 01_7월_주요일정.png
├─ 02_후원물품_전달식.png
└─ 03_프로그램_모집.png
```

각 이미지에서 공유 링크를 복사한 뒤, `키오스크_관리표` 시트의 `구분=배너` 행 `이미지주소` 칸에 붙여넣습니다.

- 노출: `Y`
- 순서: 1, 2, 3 순서대로 입력
- 이미지주소: OneDrive 이미지 공유 링크
- 제목/설명: 관리용 메모로 사용 가능

## 5. 유튜브 영상 수정

`구분=설정`, `항목=youtubeId` 행의 `내용` 칸에 유튜브 영상 ID를 입력합니다.

예시:

유튜브 주소가 아래와 같다면

```text
https://www.youtube.com/watch?v=ABCDEFG1234
```

xlsx에는 이렇게 입력합니다.

```text
ABCDEFG1234
```

## 6. CSV도 가능하지만 xlsx 권장

CSV 파일도 지원합니다. 다만 OneDrive 웹에서는 CSV를 편집하기 불편할 수 있어서, 기본 운영은 xlsx 방식을 권장합니다.

CSV로 운영하려면 `config.js`를 이렇게 바꿉니다.

```js
window.KIOSK_CONFIG = {
  DATA_FORMAT: "csv",
  DATA_URL: "여기에 OneDrive CSV 공유/다운로드 링크"
};
```

## 7. 주의사항

- OneDrive 링크가 로그인 필요 상태이면 GitHub Pages에서 읽지 못합니다.
- 이미지 링크도 `링크가 있는 사용자 보기 가능`이어야 합니다.
- 로컬에서 `index.html`을 더블클릭하면 브라우저 보안 때문에 파일 읽기가 막힐 수 있습니다. 테스트는 GitHub Pages 주소에서 하는 것이 좋습니다.
