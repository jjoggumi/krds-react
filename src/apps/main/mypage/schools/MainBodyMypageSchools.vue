<template>
  <div class="thumbnail-box-cont-wrap" v-if="isExistSchoolSubscribes">
    <div class="thumbnail-box-list-wrap">
      <!-- school item  -->
      <MainBodyMypageSchoolsItem
        v-for="item in schoolSubscribes"
        :key="item.currentId"
        :item="item"
        @onUnscribe="unscribe"
      ></MainBodyMypageSchoolsItem>
      <!-- // school item  -->
    </div>
  </div>
  <MainBodyMypageSchoolsNotFound v-else></MainBodyMypageSchoolsNotFound>
</template>

<script>
import MainBodyMypageSchoolsItem from './MainBodyMypageSchoolsItem.vue'
import MainBodyMypageSchoolsNotFound from './MainBodyMypageSchoolsNotFound.vue'

export default {
  name: 'mainBodyMypageSchools',
  components: {
    MainBodyMypageSchoolsItem,
    MainBodyMypageSchoolsNotFound
  },
  data: () => ({
    isExistSchoolSubscribes: true,
    schoolSubscribes: []
  }),
  methods: {
    getSubscribeSchoolList() {
      const userId = this.$store.state.user.currentId

      this.$hiClass.schoolSubscribeViews
        .search({
          userId,
          size: 200,
          sort: 'insertedTimestamp,desc'
        })
        .then(result => {
          this.$log.debug(
            this.$options.name + ' getSubscribeSchoolList() result => ',
            result
          )
          if (result.data.page.totalElements === 0)
            this.isExistSchoolSubscribes = false
          else {
            this.schoolSubscribes.push(
              ...result.data._embedded.schoolSubscribeViews
            )
          }
        })
        .catch(error => {
          this.$log.debug(
            this.$options.name + ' getSubscribeSchoolList() error => ',
            error
          )
        })
    },
    unscribe(subscribeUuid) {
      const newSchoolSubscribes = this.schoolSubscribes
      this.schoolSubscribes = []

      for (const [i, subscribe] of newSchoolSubscribes.entries()) {
        const oldSubscribeUuid = subscribe.currentId
        if (oldSubscribeUuid === subscribeUuid) {
          newSchoolSubscribes.splice(i, 1)
          break
        }
      }
      this.$nextTick().then(() => {
        this.schoolSubscribes = newSchoolSubscribes
      })
    }
  },
  created() {
    this.getSubscribeSchoolList()
  }
}
</script>
