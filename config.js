/*
  기본은 data/data.json을 읽습니다.

  OneDrive/SharePoint에 CSV 파일을 올려 직접 연결하려면 아래처럼 바꿔주세요.
  단, 회사/기관 보안 설정에 따라 브라우저에서 차단될 수 있습니다.

  window.KIOSK_CONFIG = {
    DATA_FORMAT: "csv",
    DATA_URL: "OneDrive 또는 SharePoint CSV 직접 다운로드 링크"
  };
*/

window.KIOSK_CONFIG = {
  DATA_FORMAT: "json",
  DATA_URL: "./data/data.json"
};
