<template>
  <div v-if="isExistClazzSubscribes && isLoadComplete">
    <div
      class="thumbnail-box-cont-wrap"
      v-for="classYear in myClazzesYearArr"
      :key="classYear.currentId"
    >
      <div class="thumbnail-box-year">{{ classYearStr(classYear) }}</div>
      <div class="thumbnail-box-list-wrap">
        <MainBodyMypageClazzesItem
          v-for="item in myClazzes[classYear]"
          :key="item.currentId"
          :item="item"
        ></MainBodyMypageClazzesItem>
      </div>
    </div>
  </div>
  <MainBodyMypageClazzesNotFound
    v-else-if="!isExistClazzSubscribes && isLoadComplete"
  ></MainBodyMypageClazzesNotFound>
  <div v-else></div>
</template>

<script>
import MainBodyMypageClazzesItem from './MainBodyMypageClazzesItem.vue'
import MainBodyMypageClazzesNotFound from './MainBodyMypageClazzesNotFound.vue'

export default {
  name: 'mainBodyMypageClazzes',
  components: {
    MainBodyMypageClazzesItem,
    MainBodyMypageClazzesNotFound
  },
  data() {
    return {
      isLoadComplete: false,
      clazzSubscribes: [],
      myClazzesYearArr: [],
      myClazzes: []
    }
  },
  computed: {
    isExistClazzSubscribes() {
      return this.clazzSubscribes.length > 0 ? true : false
    }
  },
  methods: {
    getSubscribeClazzList() {
      const userId = this.$store.state.user.currentId

      this.$hiClass.clazzSubscribeViews
        .search({
          userId,
          memberStatus: 'ACCEPT',
          size: 200,
          // 정렬 우선 순위: 연도 내림차순, 최신 구독순
          sort: ['classYear,desc', 'insertedTimestamp,desc']
        })
        .then(result => {
          this.$log.debug(
            this.$options.name + ' getSubscribeClazzList() result => ',
            result
          )

          if (result.data.page.totalElements === 0) this.isLoadComplete = true
          else {
            let clazzSubscribeViews = result.data._embedded.clazzSubscribeViews

            // 1. 관리자 배열
            let ownerArr = clazzSubscribeViews.filter(item => item.memberRole === 'OWNER' || item.memberRole === 'MANAGER')
            // 2. 멤버 배열
            let memberArr = clazzSubscribeViews.filter(item => item.memberRole === 'MEMBER')

            let sortedSubscribeViews = []
            sortedSubscribeViews.push(...ownerArr)
            sortedSubscribeViews.push(...memberArr)

            for (const clazzSubscribe of sortedSubscribeViews) {
              if (
                ['ACTIVATE', 'DEACTIVATE', 'CLOSING'].includes(
                  clazzSubscribe.classStatus
                )
              ) {
                this.clazzSubscribes.push(clazzSubscribe)
                this.getClassInfo(clazzSubscribe)
              }
            }
          }
        })
        .catch(error => {
          this.$log.debug(
            this.$options.name + ' getSubscribeClazzList() error => ',
            error
          )
          this.isLoadComplete = true
        })
    },
    getClassInfo(clazzSubscribe) {
      let classYear = clazzSubscribe.classYear

      // 연도무관 : 현재 연도 기준 데이터로 표현
      // if (classYear === 'ANY') {
      //   classYear = this.$moment().format('YYYY')
      // }

      if (this.myClazzes[classYear] === undefined) {
        this.myClazzes[classYear] = []
        this.myClazzesYearArr.push(classYear)
      }
      this.myClazzes[classYear].push(clazzSubscribe)

      let myClazzesTotalLength = 0
      for (const year of this.myClazzesYearArr)
        myClazzesTotalLength += this.myClazzes[year].length

      if (this.clazzSubscribes.length === myClazzesTotalLength) {
        this.myClazzesYearArr.sort().reverse()
        this.isLoadComplete = true
      }
    },
    classYearStr(classYear) {
      let str = classYear
      if (classYear === 'ANY') str = '연도무관'
      else str = str + '년'
      return str
    }
  },
  created() {
    this.getSubscribeClazzList()
  }
}
</script>
