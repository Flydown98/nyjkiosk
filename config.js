/*
  ✅ 운영할 때 여기 DATA_URL만 바꾸면 됩니다.

  1) data/onedrive-board-template.csv 파일을 OneDrive에 업로드합니다.
  2) OneDrive에서 CSV 파일을 공유합니다. 가능하면 "링크가 있는 모든 사용자 보기 가능"으로 설정합니다.
  3) 공유 링크를 복사해서 아래 DATA_URL에 붙여 넣습니다.
  4) CSV 파일을 수정하면 키오스크 화면이 refreshMinutes 간격으로 다시 읽어옵니다.

  먼저 GitHub 화면이 정상 작동하는지 확인하려면 아래 기본값을 그대로 두세요.
  기본값은 GitHub 저장소 안의 샘플 CSV를 읽습니다.
*/
window.KIOSK_CONFIG = {
  DATA_FORMAT: "csv",
  DATA_URL: "https://namyangju-my.sharepoint.com/:x:/g/personal/jhc_nyjwel_org/IQBbhjziJFqlRY7SIc21V3lRAZcn45aF_y984vVLDa5C3hU?e=fdAtW1"
};
