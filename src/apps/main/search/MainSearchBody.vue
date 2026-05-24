<template>
  <div class="tab-cont-wrap search-result-list-wrap">
    <div
      class="tab-cont-item search-result-list"
      :class="{ on: showBytab === 0 }"
      v-infinite-scroll="$parent.getClazzList"
      :infinite-scroll-disabled="paging.clazzes.isBusy"
      :infinite-scroll-distance="paging.scrollLimit"
    >
      <ul v-if="count.clazzes > 0 && showBytab === 0">
        <MainSearchItemClazz
          v-for="(item, index) in clazzes"
          :key="item.currentId"
          :showBytab="showBytab"
          :index="index"
          :itemObj="item"
          :isTempStudent="isTempStudent"
        ></MainSearchItemClazz>
        <MainLoadingScroll v-if="paging.clazzes.isBusy"></MainLoadingScroll>
      </ul>
      <MainSearchItemNoResult v-else-if="!isSearch || paging.clazzes.isListEnd"/>
    </div>
    <div
      class="tab-cont-item search-result-list"
      :class="{ on: showBytab === 1 }"
      v-infinite-scroll="$parent.getSchoolList"
      :infinite-scroll-disabled="paging.schools.isBusy"
      :infinite-scroll-distance="paging.scrollLimit"
    >
      <ul v-if="count.schools > 0 && showBytab === 1">
        <MainSearchItemSchool
          v-for="school in schools"
          :key="school.currentId"
          :school="school"
        ></MainSearchItemSchool>
        <MainLoadingScroll v-if="paging.schools.isBusy"></MainLoadingScroll>
      </ul>
      <MainSearchItemNoResult v-else-if="!isSearch || paging.schools.isListEnd"/>
    </div>

    <!-- 팝업 컴포넌트 시작-->
    <component
      :is="isUser"
      @close-event="goReqPopClose"
      @comp-evnt="goCompPop"
      :clazzesKey="clazzesKey"
    ></component>
    <MainSearchJoinComp
      v-if="isJoinComplete"
      @close-event="goReqPopClose"
      @comp-evnt="goCompPop"
    ></MainSearchJoinComp>
  </div>
</template>

<script>
import MainSearchItemClazz from './MainSearchItemClazz'
import MainSearchItemSchool from './MainSearchItemSchool'
import MainSearchItemNoResult from './MainSearchItemNoFoundResult'

import MainSearchJoinInputFormByParent from './MainSearchJoinInputFormByParent'
import MainSearchJoinInputFormByStudent from './MainSearchJoinInputFormByStudent'
import MainSearchJoinComp from './MainSearchJoinComp'

import MainLoadingScroll from '../../main/MainLoadingScroll.vue'

export default {
  name: 'mainSearchBody',
  props: [
    'user',
    'isTempStudent',
    'showBytab',
    'count',
    'clazzes',
    'schools',
    'paging',
    'isSearch'
  ],
  data: () => ({
    clazzesKey: '',
    classId: null,
    isUser: '',
    isJoinComplete: false,
    updateClazzesIndex: '',
    isProfileSetting: false
  }),
  components: {
    MainSearchItemClazz,
    MainSearchItemSchool,
    MainSearchItemNoResult,
    MainSearchJoinInputFormByParent,
    MainSearchJoinInputFormByStudent,
    MainSearchJoinComp,
    MainLoadingScroll,
  },
  methods: {
    goReqJoin: function(clazzesKey, index) {
      this.clazzesKey = clazzesKey
      this.classId = this.$comn.split(clazzesKey, '/')
      this.updateClazzesIndex = index
      this.checkCurUserClassSubscribe()
    },
    goReqPopClose: function() {
      this.isUser = ''
    },
    goCompPop: function(bool, obj=false) {
      if (bool) {
        // store clazzSubscribeViews 갱신
        this.$hiClass.setClazzSubscribeViews(this)
        // store schoolSubscribeViews 갱신
        this.$hiClass.setSchoolSubscribeViews(this)

        if(obj === false) {
          this.isJoinComplete = true
        } else {
          this.$emit("updateClazzes", obj.classId)
        }
      } else {
        this.isJoinComplete = false
      }
      // this.isProfileSetting = true
    },
    // submitProfileSettingModal() {
    //   this.isProfileSetting = false
    //   this.isJoinComplete = true
    // },
    checkCurUserClassSubscribe() {
      if (this.user.userUri === undefined || this.user.userUri === '') {
        return false
      }

      const params = {
        classId: this.$comn.split(this.clazzesKey, '/'),
        userId: this.user.currentId,
        size: 1000
      }

      this.$comn.log(this, 'params', params)

      this.$hiClass.clazzSubscribeViews
        .search(params)
        .then(res => {
          this.$comn.log(this, 'checkCurUserClassSubscribe', res.data)
          const memberStatus =
            res.data.page.totalElements > 0
              ? res.data._embedded.clazzSubscribeViews[0].memberStatus
              : ''
          let msg = ''

          if (res.data.page.totalElements > 0 && memberStatus === 'APPLY') {
            msg = '신청 승인 대기 중입니다.'
            this.$hiClass.alert(msg)
            // msg = '클래스 가입 요청을 취소하시겠습니까?'
            // this.$hiClass.confirm(msg)
            //   .then(() => {
            //     const clazzSubscribeUuid =
            //       res.data._embedded.clazzSubscribeViews[0].currentId

            //     this.$hiClass.clazzSubscribes
            //       .delete(`/clazzSubscribes/${clazzSubscribeUuid}`)
            //       .then(() => {
            //         // store clazzSubscribeViews 갱신
            //         this.$hiClass.setClazzSubscribeViews(this)
            //         this.$hiClass.alert('가입 요청이 취소되었습니다.')
            //       })
            //       .catch(err => {
            //         this.$log.debug(err)
            //       })
            //   })
            //   .catch(err => {
            //     this.$log.debug(err)
            //   })
          } else if (
            res.data.page.totalElements > 0 &&
            memberStatus !== 'DENIAL'
          ) {
            msg = '가입 중이거나 이미 가입된 클래스입니다.'
            this.$hiClass.alert(msg)
            // } else if (memberStatus === "DENIAL") {
            //   msg = "클래스 가입이 거절되었습니다.\n관리자에게 문의해주세요.";
            //   alert(msg);
          } else {
            this.showJoinPop()
          }
        })
        .catch(error => {
          this.$log.debug(error)
        })
    },
    showJoinPop() {
      if (this.user.userType === 'STUDENT') {
        this.isUser = 'MainSearchJoinInputFormByStudent'
      } else {
        this.isUser = 'MainSearchJoinInputFormByParent'
      }
    },
    showJoinPop2(){
      alert("showJoinPop2")
    }, 
    checkCurForm(item) {
      if (item.className !== undefined) return 'MainSearchItemClazz'
      else if (item.schoolName !== undefined) return 'MainSearchItemSchool'
      else return ''
    },
  },
  created() {},
}
</script>

<style scoped></style>
