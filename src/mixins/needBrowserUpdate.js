import {getBrowserVersion} from "@/plugins/firebase";

export default {
  methods: {
    browserCheckAndUpdateAlert(needVersion = 81) {
      getBrowserVersion().then(({version, fullVersion, name}) => {
        try {
          const browserUpdateURLMap = {
            'chrome': 'https://www.google.com/intl/ko/chrome/update',
            'Chrome': 'https://www.google.com/intl/ko/chrome/update',
            'Google Chrome': 'https://www.google.com/intl/ko/chrome/update',
            'Chromium': 'https://www.google.com/intl/ko/chrome/update',
            'Microsoft Edge': 'https://www.microsoft.com/ko-kr/edge/download',
            'Edge': 'https://www.microsoft.com/ko-kr/edge/download',
            'Whale': 'https://whale.naver.com/ko/download/'
          }

          const updateURL = browserUpdateURLMap[name]

          // 크롬 버전 80보다 낮을 경우
          if (updateURL && Number(version) < needVersion) {
            this.$hiClass.alert(`현재 사용 중인 브라우저 버전 <br/> ${name} ${version}에서는 지원되지 않습니다.<br/>최신 버전으로 업데이트 후 이용해 주세요.`).then(() => {
              location.href = updateURL
            })
          }
        } catch (e) {
          //에러나면 아무것도 안함
          console.error(e);
        }
      })
    }
  }
}