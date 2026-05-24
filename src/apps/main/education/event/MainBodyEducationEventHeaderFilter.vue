<template>
  <div class="board__filter">
    <div class="group-filter-sub">
      <button
        v-for="(item, i) of categoryList"
        :key="item.currentId"
        :class="{ 'is-active': curCategoryIdx === i }"
        @click="clickToCategory(i)"
      >
        {{ item.name }}
      </button>
    </div>
  </div>

</template>

<script>
import {mapActions} from "vuex";
import {eventBus} from "@/main";

export default {
  name: "main-body-education-event-header-filter",
  data() {
    return {
      curCategoryIdx: 0,
      curCategoryName: '전체',
      curCategoryValue: '',
      categoryList: [],
      infoCategory: [{ name: '전체', status: null }],
      eventCategory: [
        { name: '전체', status: null },
        { name: '진행중', status: 'PROGRESSING,EXPECTED' },
        { name: '종료', status: 'CLOSED' }
      ],
    }
  },
  created() {
    if (this.pageName === 'info') {
      const params = {
        _infoType: 'EDUCATION',
        _infoStatus: 'ACTIVATE',
        sort: 'infoTitle,asc',
        size: 100
      }

      this.$hiClass.informations.search(params).then(returns => {
        for (let category of returns.data._embedded.informations) {
          let param = {
            name: category.infoTitle,
            status: category._links.self.href
          }
          this.infoCategory.push(param)
        }
        this.categoryList = this.infoCategory
      })
    } else {
      this.categoryList = this.eventCategory
    }
  },
  mounted() {},
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    clickToCategory(idx) {
      this.triggerAnalyticsLogEvent({ code: 'analytics.information.education.click.selectCategory' })
      this.curCategoryIdx = idx
      this.curCategoryName = this.categoryList[this.curCategoryIdx].name

      const categoryStatus =
        this.categoryList[this.curCategoryIdx].status || null

      eventBus.$emit('set-event-category-status', categoryStatus)
      this.$nextTick(() => {
        eventBus.$emit('get-event-post-list', true)
      })
    }
  }

}
</script>

<style scoped>

</style>