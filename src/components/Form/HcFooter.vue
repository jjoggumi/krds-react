<template>
  <div
    v-if="isShowFooter"
    :class="{
      'l-footer' : isShowDetail,
      'l-footer-sub' : !isShowDetail
    }"
  >
    <div class="footer__inner">
      <ul class="footer__list">
        <li>
          <a href="javascript:void(0)" @click="openTermsView({ layerType: 'terms' })">{{$t("index.footer.link.termsTitle")}}</a>
        </li>
        <li>
          <a href="javascript:void(0)" @click="openTermsView({ layerType: 'privacyPolicy' })" >{{$t("index.footer.link.privacyPolicyTitle")}}</a>
        </li>
        <li>
          <router-link to="/help/contactus">{{ $t("index.footer.link.contactUsTitle") }}</router-link>
        </li>
      </ul>      
      <div v-if="isShowDetail" class="footer__info">
        <div class="footer__info__txt">
          <p>{{ $t('index.footer.nameCorporation') }}</p>
          <ul>
            <li>{{ $t('index.footer.ceo') }}</li>
            <li>{{ $t('index.footer.address') }}</li>
            <li>{{ $t('index.footer.businessLicenseNumber') }}</li>
            <li>{{ $t('index.footer.mailOrderBusinessReferenceNumber') }}</li>
            <li>{{ $t('index.footer.email') }}</li>
            <li>{{ isTeacher ? $t('index.footer.teachTel') : $t('index.footer.tel') }}</li>
          </ul>
          <p class="copyright">{{ $t('index.footer.copyright') }}</p>
        </div>
        <!-- <div v-if="isLoggedOut === true" class="footer__info__mark">
          <img src="https://yeorcqadlpopsmgaoudu.supabase.co/storage/v1/object/public/certification/mark/dc82e7dd-338a-4690-b8b4-a39b1a79f767/55fdf564-578f-4105-8809-fd51682bf046-2024-12-26T08:20:43.461Z" 
          onclick="(function(){window.open('https://cleanspam.or.kr/ci/252&#39;,&#39;_blank&#39;,&#39;width=800, height=1151, toolbar=no, menubar=no, scrollbars=no, resizable=no')})()" />
        </div> -->
      </div>
      <template v-else>
        <p>{{ $t('common.footer.copyright') }}</p>
      </template>
    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "hc-footer",  
  props: {
    isLoggedOut: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentRoute: this.$route
    }
  },
  components: {
  },
  computed: {
    isShowFooter() {
      return !this.isHideFooter
    },
    isHideFooter() {
      const ignorePaths = ['/main/alarmplus', '/main/text', '/hitalk']
      return ignorePaths.some(path => this.currentRoutePathLowerCase.includes(path))
    },
    isShowDetail() {
      const detailPaths = ['/', '/main/home']
      return detailPaths.includes(this.currentRoutePathLowerCase)
    },
    currentRoutePathLowerCase() {
      return this.currentRoute.path
        ? this.currentRoute.path.toLowerCase()
        : ''
    },
    isTeacher() {
      const userType = this.$store.state.userType || localStorage.getItem('userType');
      return userType === 'TEACHER';
    }
  },
  watch: {
    $route(route) {
      this.currentRoute = route
    }
  },
  methods: {
    ...mapActions({
      openTermsView: "openTermsView",
    }),
    goRoute(path) {
      this.$router.push(path, () => {});
    }
  }
};
</script>

<style scoped>
</style>
