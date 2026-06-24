/*
  ✅ 운영할 때 여기 DATA_URL만 바꾸면 됩니다.

  권장 방식:
  - OneDrive에서는 CSV보다 xlsx가 수정하기 편하므로 DATA_FORMAT은 "xlsx"를 권장합니다.
  - kiosk-board-template.xlsx 파일을 OneDrive에 올리고 공유 링크를 복사해 DATA_URL에 붙여 넣으세요.
  - 이후 OneDrive xlsx 파일만 수정하면 refreshMinutes 간격으로 화면에 자동 반영됩니다.

  CSV로 쓰고 싶은 경우:
  - DATA_FORMAT을 "csv"로 바꾸고 DATA_URL에 CSV 공유/다운로드 링크를 넣으면 됩니다.
*/
window.KIOSK_CONFIG = {
  DATA_FORMAT: "xlsx",
  DATA_URL: "./kiosk-board-template.xlsx"
};
