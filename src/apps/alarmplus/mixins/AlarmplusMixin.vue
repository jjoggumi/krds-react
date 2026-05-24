<!--TODO: 학교알리미 iframe 공통 사용 믹스인. 추후 중복 로직 공통화 처리하기 -->
<script lang="js">
import { handleShare } from '@/plugins/utils';

export default {
  name: 'AlarmplusMixin',
  methods: {
    shareAlarmplusIndexPage(selectedTab) {
      try {
        const textShareData = {
          url: `${process.env.VUE_APP_BASE_UI_URI}/alarmplus/index?tab=${selectedTab}`,
          text: '학교 현장에 딱 맞춘 문자 서비스, 발송부터 관리까지 지금 바로 시작해보세요.',
          title: '하이클래스 문자서비스'
        }
        const shareData = {
          url: `${process.env.VUE_APP_BASE_UI_URI}/alarmplus/index?tab=${selectedTab}`,
          text: '학교 설문부터 시간표 자동 생성, 문자 발송까지 지금 바로 하이클래스를 이용해보세요',
          title: '하이클래스 학교알리미',
        };

        handleShare(selectedTab === 'text' ? textShareData : shareData, '링크가 복사되었습니다.');
      } catch (err) {
        console.log('공유 취소 또는 오류:', err);
      }
    }
  }
}
</script>