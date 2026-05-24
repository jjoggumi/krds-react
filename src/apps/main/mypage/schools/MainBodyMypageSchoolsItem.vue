<!--
@File(Method): MainBodyMypageSchoolsItem.vue
@Description: 마이페이지 > 나의 학교 > 아이템
@Modified: 2025-03-05 - #72684 프로필 이미지 아바타(HiAvatar) 구축 및 적용
-->
<template>
  <div class="thumbnail-box boundary-box">
    <!-- #72684 프로필 이미지 아바타(HiAvatar) 적용 전
    <div
      class="thumbnail-wrap"
      @click="goRouteSchool"
      :style="thumbnailStyle"
    ></div>
    -->
    <HiAvatar    
      @click="goRouteSchool"     
      type="school"
      size="lg" 
      outline
      :img="item.schoolImagePath ? item.schoolImagePath : null"
    />

    <div class="title-wrap" @click="goRouteSchool">
      <div class="title">
        {{ $stringUtil.shorteningByLength(item.schoolName, 40) }}
      </div>
    </div>

    <div class="btn-wrap">
      <!-- 학교 구독 버튼 -->
      <main-body-schools-subscribe-btn
        v-if="schoolUri"
        :is-subscribe="isSubscribe"
        :school-uri="schoolUri"
        :subscribe-uuid="subscribeUuid"
        :school-subscribe-button-type="CONSTANTS.SCHOOL_SUBSCRIBE_BUTTON_TYPE.MYPAGE"
        @unSubscribeComplete="unSubscribeComplete"
      />
    </div>

  </div>
</template>

<script>
import MainBodySchoolsSubscribeBtn from "@/apps/main/schools/MainBodySchoolsSubscribeBtn";
import {mapGetters} from "vuex";

export default {
  name: 'mainBodyMypageSchoolsItem',
  components: {MainBodySchoolsSubscribeBtn},
  props: {
    item: Object
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    isBusy() {
      return this.$store.state.isLoading || false
    },
    isSubscribe() {
      return !!(this.item.currentId)
    },
    schoolUri() {
      return `${this.$apiUrl}/schools/${this.item.schoolId}`
    },
    subscribeUuid() {
      return this.item.currentId || ''
    },
    thumbnailStyle() {
      let style = ''
      let imagePath = this.item.schoolImagePath || null

      if (imagePath) {
        const size = '90'
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
  mounted() {},
  methods: {
    goRouteSchool() {
      this.$router.push(
        '/main/schools/' + this.item.schoolId,
        () => {}
      )
    },
    unSubscribeComplete() {
      this.$hiClass.alert(this.$t('schools.header.message.unsubscribe'))
        .then(() => {
          this.$emit('onUnscribe', this.subscribeUuid)
        })
    },
  },
  created() {}
}
</script>

<style scoped >
.thumbnail-wrap:hover,
.title-wrap:hover {
  cursor: pointer;
}
.title-wrap:hover {
  opacity: 0.5;
}
.avatar-img.lg{
  margin-top: -20px;
}
</style>
