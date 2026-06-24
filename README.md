# 남양주시장애인복지관 키오스크 타운보드

세로 키오스크 기준 **1080 × 1920** 비율에 맞춘 GitHub Pages용 파일입니다.

이번 버전은 기존 HTML의 세로 키오스크 비율을 기준으로 다시 맞췄고, 브라우저 창 크기가 달라도 9:16 비율을 유지하도록 수정했습니다.

## 1. GitHub에 올릴 파일

이 폴더 안의 파일을 GitHub 저장소의 루트에 그대로 업로드하면 됩니다.

```text
index.html
config.js
css/style.css
js/app.js
assets/logo.png
assets/default-banner.png
data/data.json
data/board.csv
.nojekyll
```

## 2. 화면 비율

기준 캔버스는 `1080 × 1920`입니다.

- 세로 키오스크에서 열면 화면에 꽉 차게 표시됩니다.
- 일반 PC 브라우저에서 미리 보면 브라우저 창 비율이 9:16이 아닐 경우 검은 여백이 보일 수 있습니다.
- 키오스크에서는 브라우저를 전체화면(F11)으로 띄우는 것을 권장합니다.

## 3. 기본 수정 방법

가장 쉬운 방식은 `data/data.json`만 수정하는 방식입니다.

주로 아래 값을 수정하면 됩니다.

```json
"youtubeId": "",
"noticeTitle": "📢 6월 주요일정",
"footerText": "하단에 흘러갈 안내문",
"banners": [],
"notices": []
```

## 4. 유튜브 영상 넣기

유튜브 주소가 아래와 같다면,

```text
https://www.youtube.com/watch?v=ABCDEFG1234
```

`data/data.json`에서 아래처럼 넣으면 됩니다.

```json
"youtubeId": "ABCDEFG1234"
```

단일 유튜브 영상은 자동재생, 무음재생, 무한반복으로 설정되어 있습니다.

유튜브 자동재생은 브라우저 정책상 **무음 상태**일 때 가장 안정적으로 작동합니다.

## 5. 배너 추가

이미지 파일을 `assets` 폴더에 올린 뒤 `data/data.json`에 추가합니다.

```json
{
  "visible": true,
  "imageUrl": "./assets/banner-july.png",
  "alt": "7월 프로그램 안내"
}
```

외부 이미지 주소도 사용할 수 있습니다.

```json
{
  "visible": true,
  "imageUrl": "https://example.com/banner.png",
  "alt": "외부 배너"
}
```

## 6. 공지 추가

```json
{
  "visible": true,
  "important": false,
  "title": "🔔 7월 프로그램 접수 안내",
  "date": "07-01"
}
```

`important`가 `true`이면 왼쪽 강조색이 빨간색으로 표시됩니다.

## 7. OneDrive / SharePoint CSV 연결

정적 GitHub Pages 사이트는 일반적인 OneDrive 엑셀 `.xlsx` 파일을 로그인 없이 직접 읽기 어렵습니다.

대신 `CSV 직접 다운로드 링크`가 있으면 연결할 수 있도록 만들어두었습니다.

`config.js`를 아래처럼 바꾸세요.

```js
window.KIOSK_CONFIG = {
  DATA_FORMAT: "csv",
  DATA_URL: "OneDrive 또는 SharePoint CSV 직접 다운로드 링크"
};
```

CSV 형식은 `data/board.csv`를 참고하면 됩니다.

기관 보안 설정 또는 공유 링크 설정에 따라 브라우저에서 차단될 수 있습니다. 차단되면 `data/data.json` 방식으로 운영하는 것이 가장 안정적입니다.

## 8. GitHub Pages 설정

1. GitHub 저장소 생성
2. 이 폴더 안의 파일 전체 업로드
3. Settings → Pages
4. Branch를 `main`, 폴더를 `/root`로 지정
5. 생성된 Pages 주소를 키오스크 브라우저에서 열기

## 9. 기존 mp4 영상에 대하여

이 버전은 로컬 mp4 대신 유튜브 영상을 재생하도록 구성했습니다.

기존 mp4 파일은 용량이 커서 GitHub에 직접 올리기 불편할 수 있으므로 포함하지 않았습니다.
