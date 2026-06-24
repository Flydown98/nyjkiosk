# 남양주시장애인복지관 키오스크 타운보드 v3

세로 키오스크 기준 **1080 × 1920** 비율에 맞춘 GitHub Pages용 파일입니다.

이번 버전은 **OneDrive에 올린 CSV 파일만 수정해서** 배너, 주요 일정, 하단 공지, 유튜브 영상, 날씨 표시 설정을 바꾸는 방식입니다.

---

## 1. GitHub에 올릴 파일

이 폴더 안의 파일을 GitHub 저장소의 루트에 그대로 업로드하세요.

```text
index.html
config.js
css/style.css
js/app.js
assets/logo.png
assets/default-banner.png
data/onedrive-board-template.csv
onedrive-board-template.csv
.nojekyll
README.md
```

`onedrive-board-template.csv`는 OneDrive에 올려서 수정할 원본 양식입니다.  
`data/onedrive-board-template.csv`는 GitHub에서 먼저 테스트할 때 쓰는 동일한 샘플 파일입니다.

---

## 2. 운영 흐름

```text
OneDrive CSV 수정
↓
키오스크 화면이 CSV를 다시 읽음
↓
배너 / 주요 일정 / 하단 공지 / 유튜브 영상 자동 반영
```

CSV를 다시 읽는 간격은 CSV 안의 `refreshMinutes` 값으로 조정합니다.

기본값은 5분입니다.

---

## 3. OneDrive CSV 연결 방법

### 1단계. CSV 양식 업로드

`onedrive-board-template.csv` 파일을 OneDrive에 업로드합니다.

### 2단계. 공유 링크 만들기

OneDrive에서 CSV 파일을 우클릭한 뒤 공유 링크를 만듭니다.

권한은 가능하면 아래처럼 설정하세요.

```text
링크가 있는 모든 사용자 보기 가능
```

기관 보안 설정 때문에 “모든 사용자” 링크가 안 되면, 키오스크 PC가 접근 가능한 권한으로 공유해야 합니다.

### 3단계. config.js 수정

`config.js` 파일을 열고 아래 부분만 바꿉니다.

```js
window.KIOSK_CONFIG = {
  DATA_FORMAT: "csv",
  DATA_URL: "./data/onedrive-board-template.csv"
};
```

`DATA_URL`에 OneDrive 공유 링크를 붙여넣습니다.

예시:

```js
window.KIOSK_CONFIG = {
  DATA_FORMAT: "csv",
  DATA_URL: "https://onedrive.live.com/...."
};
```

일반 공유 링크가 미리보기 화면으로만 열리면, 링크 끝에 `download=1`을 붙인 직접 다운로드 링크가 필요할 수 있습니다.

예시:

```text
https://example.com/파일공유링크?download=1
```

이미 물음표 `?`가 있는 링크라면 아래처럼 붙입니다.

```text
https://example.com/파일공유링크?abc=123&download=1
```

이 버전의 코드가 자동으로 `download=1`도 한 번 시도하지만, OneDrive/기관 보안 설정에 따라 브라우저에서 차단될 수 있습니다.

---

## 4. CSV 작성 방법

CSV의 첫 번째 줄은 헤더이므로 지우면 안 됩니다.

```csv
구분,항목,내용,노출,강조,제목,날짜,이미지주소,설명
```

두 번째 줄에는 작성 예시를 넣어두었습니다.

```csv
예시,,이 행은 작성 예시입니다. 화면에는 표시되지 않습니다. 구분은 설정/배너/공지 중 하나로 적고, 노출·강조는 Y 또는 N으로 적습니다.,,,,,,
```

`구분`에는 아래 셋 중 하나를 씁니다.

```text
설정
배너
공지
```

### 설정 행

설정은 `항목`과 `내용`을 사용합니다.

| 구분 | 항목 | 내용 |
|---|---|---|
| 설정 | noticeTitle | 📢 6월 주요일정 |
| 설정 | footerText | 복지관 이용문의는 1층... |
| 설정 | youtubeId | ABCDEFG1234 |

### 배너 행

배너는 `노출`, `제목`, `이미지주소`, `설명`을 사용합니다.

| 구분 | 노출 | 제목 | 이미지주소 | 설명 |
|---|---|---|---|---|
| 배너 | Y | 7월 프로그램 안내 | https://example.com/banner.png | 7월 배너 |

`노출`을 `N`으로 바꾸면 화면에 표시되지 않습니다.

### 공지 행

공지는 `노출`, `강조`, `제목`, `날짜`를 사용합니다.

| 구분 | 노출 | 강조 | 제목 | 날짜 |
|---|---|---|---|---|
| 공지 | Y | Y | 🏢 활동지원사업 평가(6-29 회의실) | 06-29 |
| 공지 | Y | N | 🔔 사회복지실습생 모집(상시 모집) | 06-01 |

`강조`가 `Y`이면 공지 왼쪽 선이 빨간색으로 표시됩니다.  
`강조`가 `N`이면 일반 공지 색상으로 표시됩니다.

---

## 5. 유튜브 영상 설정

유튜브 영상 주소가 아래와 같다면,

```text
https://www.youtube.com/watch?v=ABCDEFG1234
```

CSV에서 아래처럼 적으면 됩니다.

```csv
설정,youtubeId,ABCDEFG1234,,,,,,
```

또는 전체 주소를 넣어도 됩니다.

```csv
설정,youtubeUrl,https://www.youtube.com/watch?v=ABCDEFG1234,,,,,,
```

유튜브 영상은 자동재생, 무음재생, 무한반복으로 설정되어 있습니다.

---

## 6. 날씨 설정

날씨는 별도 API 키 없이 Open-Meteo 방식으로 표시됩니다.

CSV에서 아래 값을 수정할 수 있습니다.

```csv
설정,weatherEnabled,Y,,,,,,
설정,weatherLatitude,37.6360,,,,,,
설정,weatherLongitude,127.2165,,,,,,
설정,weatherLabel,남양주,,,,,,
```

날씨를 숨기고 싶으면 아래처럼 바꾸세요.

```csv
설정,weatherEnabled,N,,,,,,
```

---

## 7. GitHub Pages 설정

1. GitHub 저장소 생성
2. 이 폴더 안의 파일 전체 업로드
3. Settings → Pages
4. Branch를 `main`, 폴더를 `/root`로 지정
5. 생성된 Pages 주소를 키오스크 브라우저에서 열기

키오스크에서는 브라우저를 전체화면(F11)으로 띄우는 것을 권장합니다.

---

## 8. 화면 비율

기준 캔버스는 `1080 × 1920`입니다.

- 세로 키오스크에서 열면 화면 비율이 유지됩니다.
- 일반 PC 브라우저에서 미리 보면 브라우저 창 비율이 9:16이 아닐 경우 검은 여백이 보일 수 있습니다.
- 키오스크 전체화면에서 사용하는 것을 기준으로 만들었습니다.
