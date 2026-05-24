<!--
@File(Method): AlarmPlusIndex.vue
@Description: 학교알리미 인덱스페이지 (fullScreen 으로 로그인 없이 진입 가능)
-->
<template>
  <iframe :src="alarmPlusIndexSrc" :style="iframeStyle" @load="recalcIframeStyle" />
</template>

<script>
import { handleShare } from '@/plugins/utils';
import { mapActions } from 'vuex';
import AlarmplusMixin from '@/apps/alarmplus/mixins/AlarmplusMixin.vue';

export default {
  name: 'AlarmPlusIndex',
  data() {
    return {
      iframeStyle: {
        width: '',
        height: '',
        position: 'relative',
        top: 0,
        border: 0,
      },
    };
  },
  mixins: [ AlarmplusMixin ],
  computed: {
    alarmPlusIndexSrc() {
      const { tab } = this.$route.query;
      const src = `${process.env.VUE_APP_BASE_ALARM_PLUS_URI}/main/publicIndex`;
      return tab ? `${src}?tab=${tab}` : src;
    },
  },
  mounted() {
    this.recalcIframeStyle();
    window.addEventListener('message', this.handleIframeTask);
    window.addEventListener('resize', this.recalcIframeStyle);
  },
  beforeDestroy() {
    window.removeEventListener('message', this.handleIframeTask);
    window.removeEventListener('resize', this.recalcIframeStyle);
  },
  methods: {
    ...mapActions(['openTermsView']),
    recalcIframeStyle() {
      const height = window.innerHeight;
      this.iframeStyle.width = `100vw`;
      this.iframeStyle.height = `${height - 2}px`;
    },
    handleIframeTask(e) {
      if (e.data === null || e.data === undefined || e.data === '') return;
      const iframeData = e.data;

      if (iframeData.command === 'clickBtnAlarmplusIndexShare') {
        const { selectedTab } = iframeData.payload;
        this.shareAlarmplusIndexPage(selectedTab);
        return;
      } else if (iframeData.command === 'clickBtnTextPolicy') {
        this.openTermsView({ layerType: 'textPolicy' })
      } else if (iframeData.command === 'clickBtnPrivacyPolicy') {
        this.openTermsView({ layerType: 'privacyPolicy' })
      }

      if (iframeData === 'clickBtnAlarmplusStart') {
        this.goAlarmPlus();
      }
    },
    goAlarmPlus() {
      if (this.$authentication.isAuthenticated()) {
        this.$router.push('/main/alarmplus/apply');
        return;
      }

      sessionStorage.setItem(
        'redirectUrl',
        JSON.stringify({
          url: '/main/alarmplus/apply',
          expiresAt: Date.now() + 5 * 60 * 1000, // 5분동안만 유효
        })
      );
      this.$router.push('/');
    }
  },
};
</script>
