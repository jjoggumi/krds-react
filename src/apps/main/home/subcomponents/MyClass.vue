<!--
@File(Method): MyClass.vue
@Description: 메인 > 나의 클래스/학교 영역
@Modified: 2025-03-05 - #72684 프로필 이미지 아바타(HiAvatar) 구축 및 적용
-->
<template>
  <div
    class="component-main-myclass"
    :class="{
      'is-opened': isMoreOpen
    }"
  >
    <div class="main-myclass__inner">
      <div class="heading-main-wrap">
        <h2 class="heading-main">나의 클래스/학교</h2>
        <button v-if="myItemList.length > 0" class="btn-order" @click="openClickClassSort"><i></i>순서변경</button>
      </div>
      <template v-if="myItemList.length > 0">
        <div class="group-link">
          <a
            v-if="clazzListAll.length > 0"
            href="javascript:void(0);"
            class="link"
            @click="goRoute('/main/mypage/clazzes')"
          >
            클래스 더보기
          </a>
          <a
            v-if="schoolList.length > 0"
            href="javascript:void(0);"
            class="link"
            @click="goRoute('/main/mypage/schools')"
          >
            학교 더보기
          </a>
        </div>

        <div class="main-myclass__list">
          <div
            v-for="(myItem, index) of myItemList"
            :key="index"
            class="main-myclass__item"
          >
            <a href="javascript:void(0);" @click="onClickLink(myItem)">
              <div class="image" v-if="myItem.iconType &&  myItem.iconType !== 'admin'">
                  <i :class="`icon-${myItem.iconType}`"></i>
              </div>   
              <HiAvatar v-else
                :type="myItem.routePath.startsWith('/main/clazzes') ? 'class' : 'school'"
                size="xl" 
                :img="myItem.imagePath ? getThumbnail(myItem.imagePath) : null"
              >              
                <template v-slot:badge>
                  <i class="badge main-admin" v-if="myItem.iconType === 'admin'"></i>
                </template>
              </HiAvatar>              
              <span class="name" :inner-html.prop="myItem.title"></span>
            </a>
            <!-- #72684 프로필 이미지 아바타(HiAvatar) 적용 전
            <a href="javascript:void(0);" @click="onClickLink(myItem)">
              <div class="image">
                <img
                    v-if="myItem.imagePath"
                    :src="getThumbnail(myItem.imagePath)"
                    alt=""
                >
                <template v-if="myItem.iconType &&  myItem.iconType !== 'admin'">
                  <i :class="`icon-${myItem.iconType}`"></i>
                </template>
              </div>              
              <template v-if="myItem.iconType === 'admin'">
                <i :class="`icon-${myItem.iconType}`"></i>
              </template>
              <span class="name" :inner-html.prop="myItem.title"></span>
            </a> -->
          </div>
        </div>

        <!-- 더보기 토글 버튼 -->
        <template v-if="isMoreVisible">
          <span role="button" class="btn-more" @click="toggleIsMoreOpen(null)"></span>
        </template>
      </template>

      <!-- No Data -->
      <template v-else>
        <div class="group-link">
          <a href="javascript:void(0);" class="link" @click="openGuide">더 자세한 가이드를 원하시나요?</a>
        </div>

        <my-class-no-data />
      </template>
    </div>

  </div>

</template>

<script>
import { eventBus } from '@/main'
import {mapActions, mapGetters} from "vuex";
import MyClassNoData from "@/apps/main/home/subcomponents/MyClassNoData";
import {cloneDeep} from "lodash";

export default {
  name: "main-body-home-my-class",
  components: {MyClassNoData},
  data() {
    return {
      isMoreOpen: false,
      isMoreOpenInit: false
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      isCurUserTypeTeacher: 'isCurUserTypeTeacher',
      isCurUserTempStudent: 'isCurUserTempStudent',
      isEmptyClassSubscriptionAndTempStudent: 'isEmptyClassSubscriptionAndTempStudent',
      getHomeClazzMySubscribeView: 'getHomeClazzMySubscribeView',
      getHomeClazzMySubscribeViewAll: 'getHomeClazzMySubscribeViewAll',
      getHomeSchoolMySubscribeView: 'getHomeSchoolMySubscribeView'
    }),
    isMoreVisible() {
      return this.myItemList.length > 5
    },
    clazzList() {
      let clazzMySubscribeView = cloneDeep(this.getHomeClazzMySubscribeView)

      // 1. 관리자 배열
      let ownerArr = clazzMySubscribeView.filter(item => item.memberRole === 'OWNER' || item.memberRole === 'MANAGER')
      // 2. 멤버 배열
      let memberArr = clazzMySubscribeView.filter(item => item.memberRole === 'MEMBER')

      let sortedSubscribeViews = []
      sortedSubscribeViews.push(...ownerArr)
      sortedSubscribeViews.push(...memberArr)

      sortedSubscribeViews.sort((a, b) => {
        return a.sortNo === null ? 1 : b.sortNo - a.sortNo
      })

      return sortedSubscribeViews.map(item => {
        const isClassManager = item.memberRole === this.CONSTANTS.CLAZZ_SUBSCRIBE.MEMBER_ROLE.OWNER
          || item.memberRole === this.CONSTANTS.CLAZZ_SUBSCRIBE.MEMBER_ROLE.MANAGER
        const routePath = `/main/clazzes/${item.classId}`
        const imagePath = item.classImagePath
        const iconType = isClassManager ? 'admin' : null
        const command = null
        const title = item.className

        return {
          routePath,
          imagePath,
          iconType,
          command,
          title
        }
      })
    },
    clazzListAll() {
      return this.getHomeClazzMySubscribeViewAll.map(item => {
        const isClassManager = item.memberRole === this.CONSTANTS.CLAZZ_SUBSCRIBE.MEMBER_ROLE.OWNER
          || item.memberRole === this.CONSTANTS.CLAZZ_SUBSCRIBE.MEMBER_ROLE.MANAGER
        const routePath = `/main/clazzes/${item.classId}`
        const imagePath = item.classImagePath
        const iconType = isClassManager ? 'admin' : null
        const command = null
        const title = item.className

        return {
          routePath,
          imagePath,
          iconType,
          command,
          title
        }
      })
    },
    schoolList() {
      let schoolMySubscribeView = cloneDeep(this.getHomeSchoolMySubscribeView)
      schoolMySubscribeView.sort((a, b) => {
        return a.sortNo === null ? 1 : b.sortNo - a.sortNo
      })
      return schoolMySubscribeView.map(item => {
        const routePath = `/main/schools/${item.schoolId}`
        const imagePath = item.schoolImagePath
        const iconType = null
        const command = null
        const title = item.schoolName

        return {
          routePath,
          imagePath,
          iconType,
          command,
          title
        }
      })
    },
    menuList() {
      const list = []
      const createClass = {
        routePath: '/main/create',
        imagePath: null,
        iconType: 'class',
        command: null,
        title: '새 클래스<br>만들기'
      }
      const inviteCode = {
        routePath: null,
        imagePath: null,
        iconType: 'invitecode',
        command: 'openJoinInviteCode',
        title: '초대코드<br>가입하기'
      }
      const searchClassSchool = {
        routePath: null,
        imagePath: null,
        iconType: 'search',
        command: 'openSearchLayer',
        title: '클래스, 학교<br>찾기'
      }

      if (this.isCurUserTypeTeacher)
        list.push(createClass)

      if (!this.isCurUserTempStudent)
        list.push(inviteCode)

      if (!this.isEmptyClassSubscriptionAndTempStudent)
        list.push(searchClassSchool)

      return list
    },
    myItemList() {
      let itemList = []
      itemList.push(...this.clazzList)
      itemList.push(...this.schoolList)

      // 구독 중인 클래스, 학교가 6개 이상일 경우 펼치기 default
      if (itemList.length > 5)
        this.$nextTick(() => { 
          if(this.isMoreOpenInit === false) {
            this.toggleIsMoreOpen(true) 
            this.isMoreOpenInit = true
          }
        })

      /**
       * test 구독 클래스 개수
       */
      // itemList.splice(0)
      // itemList.push(this.clazzList[0])
      // itemList.push(this.clazzList[1])
      // itemList.push(this.clazzList[2])
      // itemList.push(this.clazzList[3])

      // 22~23 개까지 표시 개수 제한
      itemList = itemList.slice(0, 25 - this.menuList.length)

      if (itemList.length > 0) {
        itemList.push(...this.menuList)

        /**
         * test 항상 최상단 우측에 위치하도록 조정
         */
        // const positionByUserType = this.isCurUserTypeTeacher ? 2 : 3
        // const menuListInsertPosition = itemList.length > positionByUserType - 1 ? positionByUserType : itemList.length
        // itemList.splice(menuListInsertPosition, 0, ...this.menuList)
      }

      return itemList
    },
    guideLink() {
      return this.$store.state.userGuideLink[this.$store.state.user.userType]
    }
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
      openClassSort: 'openClassSort'
    }),
    ...mapActions('storeHome', {
      toggleJoinWithInviteCode: 'toggleJoinWithInviteCode'
    }),
    goRoute(path) {
      this.$router.push(path, () => {})
    },
    openSearchLayer() {
      const searchType = 'class_school'
      const path = '/main/search'
      const query = { searchType }
      this.$router.push({ path, query }, () => {})
    },
    openGuide() {
      this.triggerAnalyticsLogEvent({ code: 'analytics.home.myClass.guide.click' })
      window.open(this.guideLink)
    },
    executeCommand(command) {
      switch (command) {
        case 'openJoinInviteCode':
          this.toggleJoinWithInviteCode({ isOpen: true })
          break
        case 'openSearchLayer':
          this.openSearchLayer()
          break
      }
    },
    onClickLink(item) {
      switch (item.iconType) {
        case 'class':
          this.triggerAnalyticsLogEvent({ code: 'analytics.home.myClass.create.click' })
          break
        case 'invitecode':
          this.triggerAnalyticsLogEvent({ code: 'analytics.home.myClass.invitecode.click' })
          break
        case 'search':
          this.triggerAnalyticsLogEvent({ code: 'analytics.home.myClass.search.click' })
          break
      }

      if (item.routePath) {
        this.goRoute(item.routePath)

      } else if (item.command) {
        this.executeCommand(item.command)

      } else {
        return false
      }
    },
    getThumbnail(imagePath) {
      return imagePath.split('.').pop().toLowerCase() === 'gif' ?
          imagePath :
          `${imagePath.replace('download.hiclass.net', 'image.hiclass.net')}?width=200&height=200`
    },
    toggleIsMoreOpen(data = null) {
      if(data !== null) {
        this.isMoreOpen = data
      } else {
        this.isMoreOpen = !this.isMoreOpen
      }
    },
    openClickClassSort() {
      this.openClassSort({open: true})
    }

  }
}
</script>

<style scoped lang="scss">
.avatar-img{
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  min-width: auto;
  min-height: auto;
  height: auto;
  ::v-deep .img-area{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>