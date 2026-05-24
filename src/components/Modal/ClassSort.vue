<!--
@File(Method): ClassSort.vue
@Description: 나의 클래스/학교 순서 변경
@Modified: 2025-03-07 - #72798 목록 내 스크롤바 영역 개선 요청 - 스크롤바 공통화
@Modified: 2025-03-07 - #72845 나의 클래스/학교 순서 변경 팝업 팝업 노출 시 딤드 뒷화면 스크롤 되지 않도록 수정
-->
<template>
  <HiModal  type="type01" size="xl" @close="close" id="classSortModal">
    <template v-slot:heading>
      나의 클래스/학교 순서 변경
      <p class="smr">홈 화면에 노출되는 클래스/학교 목록을 내가 원하는 순서대로 변경할 수 있습니다.</p>
    </template>
    <template v-slot:content> 
      <div class="order-modal-classSchool">
      <div class="content-wrap">
        <div class="content-wrap__area">
          <div class="title">클래스</div>
          <div class="list custom-scr">
            <ul>
              <draggable
                  class="class-sort__list"
                  tag="div" 
                  v-bind="dragOptions"
                  handle=".draggable-area1"
                  @start="isDrag = true"
                  @end="changeClassSort"
              >
                  <transition-group type="transition" :name="!isDrag ? 'flip-list' : null">
                    <li v-for="(item) of classList" :key="`class-list-${item.classId}`" class="draggable-area1 draggable-area">
                      <div class="profile">
                        <i class="icon-admin" v-if="getIsAdmin(item.memberRole) === 'admin'"></i>
                        <span class="profile__image">
                          <img :src="item.classImagePath || classDefaultImage" />
                        </span>
                      </div>
                      <div class="content">
                        <span class="class">{{  item.className }}</span>
                        <span class="teacher">{{ item.classOwnerName }}</span>
                      </div>
                      <i class="ico ico-size-24 ico-gray ico-listmove"></i>
                    </li>
                  </transition-group>
              </draggable>
              <div ref="scrollListAccess"></div>
            </ul> 
            <div class="no-data" v-if="!(classList.length > 0)">
              <p>활동중인 클래스가 없습니다.</p>
            </div> 
          </div>
        </div>
        <div class="content-wrap__area">
          <div class="title">학교</div>
          <div class="list custom-scr">
            <ul>
              <draggable
                  class="school-sort__list"
                  tag="div" 
                  v-bind="dragOptions"
                  handle=".draggable-area2"
                  @start="isDrag = true"
                  @end="changeSchoolSort"
              >
                  <transition-group type="transition" :name="!isDrag ? 'flip-list' : null">
                    <li v-for="(item) of schoolList" :key="`school-list-${item.schoolId}`" class="draggable-area2 draggable-area">
                      <div class="profile">
                        <span class="profile__image">
                          <img :src="getSchoolImage(item.schoolImagePath)" />
                        </span>
                      </div>
                      <div class="content">
                        <span class="school">{{ item.schoolName }}</span>
                      </div>
                      <i class="ico ico-size-24 ico-gray ico-listmove"></i>
                    </li>
                  </transition-group>
              </draggable>
              <div ref="scrollListAccess2"></div>
            </ul> 

            <div class="no-data" v-if="!(schoolList.length > 0)">
              <p>구독 중인 학교가 없습니다.</p>
            </div> 
          </div>
        </div>
      </div>
    </div>
    </template>
  </HiModal>  
</template>


<script>
import {mapActions,mapGetters} from "vuex";
import {cloneDeep, template} from "lodash";
import draggable from "vuedraggable";
import { EXTERNAL_LINKS } from '@/constants/externalAssets';

export default {
  name: 'class-sort',
  components: {
    draggable
  },
  props: {
  },
  data() {
    return {
      isDrag: false,
      dragOptions: {
        animation: 200,
        disabled: false,
        forceFallback: true
      },
      classList: [],
      schoolList: [],
      loadFinish: false,
      obsRef: null,
      observer: null,
      searchClassParams: {
        page: 0,
        size: 20
      },
      loadFinish2: false,
      obsRef2: null,
      observer2: null,
      searchSchoolParams: {
        page: 0,
        size: 20
      }
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
    classDefaultImage() {
      return EXTERNAL_LINKS.IMAGES.DEFAULT_CLASS
    }
    // clazzList() {
    //   let clazzMySubscribeView = cloneDeep(this.getHomeClazzMySubscribeView)

    //   // 1. 관리자 배열
    //   let ownerArr = clazzMySubscribeView.filter(item => item.memberRole === 'OWNER' || item.memberRole === 'MANAGER')
    //   // 2. 멤버 배열
    //   let memberArr = clazzMySubscribeView.filter(item => item.memberRole === 'MEMBER')

    //   let sortedSubscribeViews = []
    //   sortedSubscribeViews.push(...ownerArr)
    //   sortedSubscribeViews.push(...memberArr)

    //   sortedSubscribeViews.sort((a, b) => {
    //     return a.sortNo === null ? 1 : b.sortNo - a.sortNo
    //   })

    //   return sortedSubscribeViews.map(item => {
    //     const isClassManager = item.memberRole === this.CONSTANTS.CLAZZ_SUBSCRIBE.MEMBER_ROLE.OWNER
    //       || item.memberRole === this.CONSTANTS.CLAZZ_SUBSCRIBE.MEMBER_ROLE.MANAGER
    //     const routePath = `/main/clazzes/${item.classId}`
    //     const imagePath = item.classImagePath
    //     const iconType = isClassManager ? 'admin' : null
    //     const command = null
    //     const title = item.className
    //     const classId = item.classId
    //     const classOwnerName = item.classOwnerName

    //     return {
    //       routePath,
    //       imagePath,
    //       iconType,
    //       command,
    //       title,
    //       classId,
    //       classOwnerName
    //     }
    //   })
    // },
    // schoolList() {
    //   let schoolMySubscribeView = cloneDeep(this.getHomeSchoolMySubscribeView)

    //   schoolMySubscribeView.sort((a, b) => {
    //     return a.sortNo === null ? 1 : b.sortNo - a.sortNo
    //   })
    //   console.log("sortedSubscribeViews", schoolMySubscribeView)

    //   return schoolMySubscribeView.map(item => {
    //     const routePath = `/main/schools/${item.schoolId}`
    //     const imagePath = item.schoolImagePath
    //     const iconType = null
    //     const command = null
    //     const title = item.schoolName
    //     const schoolId = item.schoolId

    //     return {
    //       routePath,
    //       imagePath,
    //       iconType,
    //       command,
    //       title,
    //       schoolId
    //     }
    //   })
    // },
  },
  methods:{
    ...mapActions({
        openClassSort: 'openClassSort'
    }),
    getSchoolImage: function(imagePath) {
      return !imagePath === false ? imagePath :this.$store.state.schoolImageDefault
    },
    getIsAdmin: function(data) {
      const isClassManager = data === this.CONSTANTS.CLAZZ_SUBSCRIBE.MEMBER_ROLE.OWNER || data === this.CONSTANTS.CLAZZ_SUBSCRIBE.MEMBER_ROLE.MANAGER
      return isClassManager ? 'admin' : null
    },
    async getClazzList() {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/users/${this.userId()}/classes`,
          params: this.searchClassParams
        })

        if(res.data.page.totalElements > 0) {
          const data = res.data._embedded.classes
          if(data.length > 0) {
            this.classList = [...this.classList, ...data]
            if((this.classList.length < res.data.page.totalElements)) this.loadFinish = true
            else this.loadFinish = false
          }
        } else {
          this.loadFinish = false
        }
      } catch (err) {
        this.$log.debug('getClazzList GET() error => ', err)
      }
    },
    getClazzAddList() {
      this.$nextTick(function() {
        const option = {
          root: null, //viewport
          rootMargin: '0px',
          threshold: 1,
        }

        const callback = ([entry]) => {
          this.$log.debug("entry.isIntersecting", entry.isIntersecting, this.loadFinish)
          if (entry.isIntersecting && this.loadFinish === true) {
            this.loadFinish = false
            this.searchClassParams.page = (this.searchClassParams.page +1)
            this.getClazzList()
            this.$log.debug("callback")
          }
        };

        this.observer = new IntersectionObserver(callback, option);
        this.observer.observe(this.obsRef)
      })
    },
    async getSchoolList() {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/users/${this.userId()}/schools`,
          params: this.searchSchoolParams
        })

        if(res.data.page.totalElements > 0) {
          const data = res.data._embedded.schools
          if(data.length > 0) {
            this.schoolList = [...this.schoolList, ...data]
            if((this.schoolList.length < res.data.page.totalElements)) this.loadFinish2 = true
            else this.loadFinish2 = false
          }
        } else {
          this.loadFinish2 = false
        }
      } catch (err) {
        this.$log.debug('getSchoolList GET() error => ', err)
      }
    },
    getSchoolAddList() {
      this.$nextTick(function() {
        const option = {
          root: null, //viewport
          rootMargin: '0px',
          threshold: 1,
        }

        const callback = ([entry]) => {
          this.$log.debug("entry.isIntersecting", entry.isIntersecting, this.loadFinish2)
          if (entry.isIntersecting && this.loadFinish2 === true) {
            this.loadFinish2 = false
            this.searchSchoolParams.page = (this.searchSchoolParams.page +1)
            this.getSchoolList()
            this.$log.debug("callback")
          }
        };

        this.observer2 = new IntersectionObserver(callback, option);
        this.observer2.observe(this.obsRef2)
      })
    },
    async changeClassSort(e) {
      const newIndex = e.newIndex
      const oldIndex = e.oldIndex

      let beforeClassId = null
      let classId = null
      let moveValue = newIndex-oldIndex

      const newList = this.changeSortArray(this.classList, oldIndex, moveValue)
      this.classList = newList

      if(newIndex > 0) {
        classId = this.classList[newIndex].classId
        beforeClassId = this.classList[newIndex-1].classId
      } else {
        classId = this.classList[newIndex].classId
      }

      const data = {
        classId: classId,
        beforeClassId: beforeClassId
      }

      try {
        await this.$axios({
          method: 'PUT',
          url: `/users/${this.userId()}/classes/sorting`,
          data: data
        })
      } catch (err) {
        this.$log.debug('changeClassSort GET() error => ', err)
      }
    },
    async changeSchoolSort(e) {
      const newIndex = e.newIndex
      const oldIndex = e.oldIndex
      
      let beforeSchoolId = null
      let schoolId = null

      const newList = this.changeSortArray(this.schoolList, oldIndex, (newIndex-oldIndex))
      this.schoolList = newList

      if(newIndex > 0) {
        schoolId = this.schoolList[newIndex].schoolId
        beforeSchoolId = this.schoolList[newIndex-1].schoolId
      } else {
        schoolId = this.schoolList[newIndex].schoolId
      }

      const data = {
        schoolId: schoolId,
        beforeSchoolId: beforeSchoolId
      }

      try {
        const res = await this.$axios({
          method: 'PUT',
          url: `/users/${this.userId()}/schools/sorting`,
          data: data
        })
      } catch (err) {
        this.$log.debug('changeSchoolSort GET() error => ', err)
      }
    },
    changeSortArray: function(list,  targetIdx, moveValue) {
        if (list.length < 0) return;

      const newPosition = targetIdx + moveValue;
      if (newPosition < 0 || newPosition >= list.length) return;

      const tempList = JSON.parse(JSON.stringify(list));
      const target = tempList.splice(targetIdx, 1)[0];
      tempList.splice(newPosition, 0, target);
      return tempList;
    },
    close: function() {
      this.getCurUserAllSubscribes()
      this.openClassSort({open: false})
    },
    getCurUserAllSubscribes: async function() {
      try {
        const classList = await this.$hiClass.clazzSubscribeViews.search({
          userId: this.$store.state.user.currentId,
          size: 500,
          // 정렬 우선 순위: 최신 구독순 (20200408 정책 변경)
          sort: 'insertedTimestamp,desc'
        })

        const schoolList = await this.$hiClass.schoolSubscribeViews.search({
          userId: this.$store.state.user.currentId,
          size: 500,
          sort: 'insertedTimestamp,desc'
        })

        const clazzSubscribeViews = classList.data._embedded.clazzSubscribeViews
        const schoolSubscribeViews = schoolList.data._embedded.schoolSubscribeViews
        
        this.$store.commit('setClazzSubscribeViews', clazzSubscribeViews)
        this.$store.commit('setSchoolSubscribeViews', schoolSubscribeViews)
      } catch (err) {
        this.$log.debug('getCurUserAllSubscribes GET() error => ', err)
      }
      // Promise.all([
      //   this.$hiClass.clazzSubscribeViews.search({
      //     userId: this.$store.state.user.currentId,
      //     size: 500,
      //     // 정렬 우선 순위: 최신 구독순 (20200408 정책 변경)
      //     sort: 'sortNo,desc'
      //   }),
      //   this.$hiClass.schoolSubscribeViews.search({
      //     userId: this.$store.state.user.currentId,
      //     size: 500,
      //     sort: 'sortNo,desc'
      //   }),
      //   /*this.$hiClass.informations.search({
      //     size: 500,
      //     _infoStatus: 'ACTIVATE'
      //   })*/
      // ])
      // .then(r => {
      //   // this.$comn.log(this, "getCurUserAllSubscribes() r => ", r);
      //   const clazzSubscribeViews = r[0].data._embedded.clazzSubscribeViews
      //   const schoolSubscribeViews = r[1].data._embedded.schoolSubscribeViews
      //   console.log("getCurUserAllSubscribes")
      //   this.$store.commit('setClazzSubscribeViews', clazzSubscribeViews)
      //   this.$store.commit('setSchoolSubscribeViews', schoolSubscribeViews)
      // })
      // .catch(e => {
      //   this.$comn.log(this, 'getCurUserAllSubscribes() e => ', e)
      // })
      // .finally(() => {
      // })
    },
    userId() {
      return localStorage.uuid
    },
  },
  mounted() {
    this.obsRef = this.$refs.scrollListAccess
    this.obsRef2 = this.$refs.scrollListAccess2
  },
  async created() {
    this.getClazzList()
    this.getClazzAddList()
    this.getSchoolList()
    this.getSchoolAddList()
  },
}
</script>


<style scoped lang="scss">
#classSortModal {
  background: rgba(0, 0, 0, 0.7);
  .modal-cont-wrap {
    overflow-y: auto;
  }
  .modal-cont {
    height: auto;
    min-height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
.order-modal-classSchool {
  // width: 835px;
  // height: 637px;
  // background: #fff;
  // border-radius: 16px;
  // box-shadow: 0px 10px 40px 0px #0000004d;
  // position: relative;
  // display: flex;
  // flex-direction: column;
  .title-wrap {
    width: 100%;
    height: 53px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    margin-top: 40px;
    margin-bottom: 26px;
    h2 {
      font-size: 20px;
      font-weight: 700;
      color: #000;
    }
    span {
      display: inline-block;
      font-size: 15px;
      font-weight: 400;
      color: #616161;
      line-height: 23px;
    }
  }
  .content-wrap {
    width: 100%;
    height: 488px;
    display: flex;
    justify-content: space-between;
    .content-wrap__area {
      width: 385px;
      height: 488px;
      border-radius: 8px;
      background: #fff;
      border: 1px solid #e0e0e0;
      .title {
        height: 50px;
        line-height: 50px;
        padding-left: 20px;
        font-size: 15px;
        font-weight: 700;
        color: #222222;
        border-bottom: 1px solid #e0e0e0;
        text-align: left;
      }
    }
  }
  .list {
    height: calc(100% - 50px);
    overflow-y: scroll;
    position: relative;
    ul {
      padding: 0 15px;
      li {
        width: 100%;
        height: 73px;
        border-bottom: 1px solid #eeeeee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        div {
          &.profile {
            width: 36px;
            height: 36px;
            margin-left: 5px;
            position: relative;
            .icon-admin {
              position: absolute;
              left: -5px;
              bottom: 20px;
              width: 20px;
              height: 20px;
              background: url("~@/assets/img/icon/icon_admin.svg") 0/18px no-repeat;
              border-radius: 50%;
              border: 1px solid #fff;
            }
            .profile__image {
              width: 100%;
              height: 100%;
              display: inline-flex;
              border-radius: 50%;
              overflow: hidden;
              justify-content: center;
              align-items: center;
              border: 1px solid #e0eaff;
            }
            .profile__image img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              image-rendering: auto;
            }
          }
          &.content {
            width: 261px;
            height: 43px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .class,
            .school {
              width: 100%;
              display: inline-block;
              font-size: 15px;
              font-weight: 500;
              color: #222;
              height: 23px;
              line-height: 23px;
              text-align: left;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .school {
              height: 43px;
              line-height: 43px;
            }
            .teacher {
              width: 100%;
              display: inline-block;
              font-size: 12px;
              font-weight: 400;
              color: #888;
              height: 18px;
              line-height: 18px;
              text-align: left;
            }
          }
        }
      }
    }
    .no-data {
      position: absolute;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
    }
    .no-data:before {
      content: "!";
      display: block;
      width: 64px;
      height: 64px;
      color: #d6d6d6;
      font-size: 32px;
      font-weight: 400;
      line-height: 64px;
      text-align: center;
      border: 3px solid #d6d6d6;
      border-radius: 50%;
      margin: 0 auto 16px;
    }
    .no-data p {
      font-size: 15px;
      font-weight: 400;
      color: #616161;
    }
  }
  .modal-close-btn {
    position: absolute;
    width: 24px;
    height: 24px;
    top: 20px;
    right: 20px;
    background: url("~@/assets/img/icon/icon_modal_close.svg") no-repeat;
    cursor: pointer;
  }
}
</style>