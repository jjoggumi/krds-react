<template>
  <li>
    <div class="inner">
      <div class="school-class-name-wrap">
        <a href="javascript:void(0)" @click="goRouteSchool">
          <div
            class="school-class-img-wrap"
            :style="thumbnailStyle"
          ></div>
          <div
            class="school-class-name"
            v-html="insertToSpan(school.schoolName)"
          ></div>
        </a>
      </div>
      <div
        class="school-class-etc-wrap"
        v-if="!isDisabledSubscribeButton"
        :class="{
          on: isSchoolSubscribed
        }"
      >
        <!-- 학교 구독 버튼 -->
        <main-body-schools-subscribe-btn
          v-if="schoolUri"
          :is-disabled-subscribe-button="isDisabledSubscribeButton"
          :is-subscribe="isSchoolSubscribed"
          :school-uri="schoolUri"
          :subscribe-uuid="subscribeUuid"
          :school-subscribe-button-type="CONSTANTS.SCHOOL_SUBSCRIBE_BUTTON_TYPE.SEARCH"
          @subscribeComplete="subscribeComplete"
          @unSubscribeComplete="unSubscribeComplete"
        />
      </div>
    </div>
  </li>
</template>

<script>
import MainBodySchoolsSubscribeBtn from "@/apps/main/schools/MainBodySchoolsSubscribeBtn";
import {mapGetters} from "vuex";
export default {
  name: 'MainSearchItemSchool',
  components: {MainBodySchoolsSubscribeBtn},
  props: {
    school: Object
  },
  data() {
    return {
      schoolSubscribeJoinType: '',
      isDisabledSubscribeButton: false,
      isSchoolSubscribed: false,
      subscribeUri: '',
      subscribeUuid: '',
      subscribeClassIdList: [],
      subscribeClassIdListCnt: 0,
      userSubscribeClassCntByCurrenSchool: 0
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    isBusy() {
      return this.$store.state.isLoading || false
    },
    schoolUri() {
      return this.school._links.self.href
    },
    thumbnailStyle() {
      let style = ''
      let imagePath = this.school.schoolImagePath || null

      if (imagePath) {
        const size = '66'
        imagePath = imagePath + `?width=${size}&height=${size}`
        style =
          `background-image: url('${imagePath}');` +
          `background-size: ${size}px ${size}px;`
      } else {
        style = `background-image: url('${this.$store.state.schoolImageDefault}')`
      }
      return style
    },
  },
  created() {
    this.checkUserSchoolSubscribed()
  },
  mounted() {},
  methods: {
    goRouteSchool() {
      this.$router.push(
        `/main/schools/${this.school.currentId}`,
        () => {}
      )
    },
    insertToSpan(resStr) {
      let keyword = this.$route.query.searchKeyword
      let address = ''

      if (resStr.includes(keyword)) {
        resStr = this.$stringUtil.replaceAll(
          resStr,
          keyword,
          '<span>' + keyword + '</span>'
        )
      }

      if (
        this.school.schoolAddress !== undefined &&
        this.school.schoolAddress !== null
      ) {
        address = `<p class="address">${this.school.schoolAddress}</p>`
        resStr = resStr.concat(address)
      }
      return resStr
    },
    checkUserSchoolSubscribed() {
      for (const schoolSubscribe of this.$store.state.schoolSubscribeViews) {
        if (schoolSubscribe.schoolId === this.school.currentId) {
          this.isSchoolSubscribed = true
          this.subscribeUri = `${process.env.VUE_APP_BASE_API_URI}/schoolSubscribes/${schoolSubscribe.currentId}`
          this.subscribeUuid = schoolSubscribe.currentId
          this.schoolSubscribeJoinType = schoolSubscribe.joinType
          // if (item.joinType === "CLASS") this.isDisabledSubscribeButton = true;
          break
        }
      }
    },
    setIsBusy(flag) {
      flag === true
        ? this.$store.commit('setIsLoading', true)
        : this.$store.commit('setIsLoading', false)
    },
    subscribeComplete(subscribeUri) {
      this.isSchoolSubscribed = true

      this.setIsBusy(false)
      this.subscribeUri = subscribeUri
      this.subscribeUuid = this.$comn.split(this.subscribeUri, '/')

      // store schoolSubscribeViews 갱신
      this.$hiClass.setSchoolSubscribeViews(this)
    },
    unSubscribeComplete() {
      // alert(this.$t("schools.header.message.unsubscribe"));
      this.setIsBusy(false)
      this.isSchoolSubscribed = false

      // store schoolSubscribeViews 갱신
      this.$hiClass.setSchoolSubscribeViews(this)

      this.subscribeUri = ''
      this.subscribeUuid = ''
    },
  },
}
</script>

<style scoped></style>
