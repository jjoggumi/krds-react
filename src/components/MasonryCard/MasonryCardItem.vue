<template>
  <div
    v-if="item !== undefined && item !== ''"
    class="grid-box-wrap"
    :class="{ read: chkRead() }"
    @click="setIsShow(true)"
  >
    <div class="grid-box-inner">
      <div class="grid-box-top-wrap">
        <item-header
          :key="`item-header-${item.currentId}`"
          :item="item"
          :list="list"
          :pagePerSize="pagePerSize"
          :parentUriList="parentUriList"
          :pateType="pateType"
          :isClickPost="isClickPost"
        />

        <item-body
          :key="`item-body-${item.currentId}`"
          :item="item"
          :list="list"
          :pagePerSize="pagePerSize"
          :parentUriList="parentUriList"
          :pateType="pateType"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent.vue";
import {mapActions, mapMutations, mapState} from "vuex";

const ItemHeader = () => ({
  component: import('@/components/MasonryCard/MasonryCardItemHeader.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const ItemBody = () => ({
  component: import('@/components/MasonryCard/MasonryCardItemBody.vue'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: 'masonry-card-item',
  props: {
    item: Object,
    list: Array,
    pagePerSize: String,
    parentUriList: Array,
    pateType: String
  },
  data() {
    return {
      isShow: false,
      isClickPost: false
    }
  },
  components: {
    ItemHeader,
    ItemBody
  },
  mounted() {},
  computed: {
    ...mapState({
      clazzSubscribeViews: 'clazzSubscribeViews',
      user: 'user',
    }),
    isReadPost() {
      return this.item.isRead
    },
    isLocatedEducation() {
      return !!this.$route.path.includes('/main/education')
    },
    isAlarm() {
      return this.item.postType === 'ALARM' ||
          this.item.postType === 'ALARM_PLUS'
    }
  },
  methods: {
    ...mapMutations({
      setAlarmPlusDetail: 'setAlarmPlusDetail',
      setIsShowDetailPostLayer: 'setIsShowDetailPostLayer',
      setItemDetailObj: 'setItemDetailObj',
    }),
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    setIsShow(val) {
      if (val && this.item.postType === 'ALARM_PLUS') {
        this.openDetailPop(this.item)

        this.checkPostReadUser()
      } else if (val) {
        if (this.item.postType === 'EDUCATION'
            || this.item.postType === 'EVENT'
            || this.item.postType === 'HINOTICE'        
        ) {
          this.triggerAnalyticsLogEvent({ code: `analytics.information.${this.item.postType.toLowerCase()}.click.contentDetail` })
        }

        this.$axios({
          method: 'get',
          url: `/posts/${this.item.currentId}`
        }).then(res => {
          const post = res.data

          this.isClickPost = true
          let obj = {
            item: post,
            list: this.list,
            // totalElements: this.totalElements,
            parentUriList: this.parentUriList,
            pagePerSize: this.pagePerSize
          }
          this.setItemDetailObj(obj)
          this.setIsShowDetailPostLayer(true)
        })

        // this.checkPostReadUser()
      }
      this.isShow = val
    },
    isManagedPostByNote() {
      let flag = false
      // 클래스 관리자인 경우 and 알림장 읽음 확인 처리 X
      if (this.item.postType === 'NOTE') {
        const parentUri = this.item.parentUri
        let managedClassList = this.clazzSubscribeViews.filter(
          d => {
            return (
              parentUri.includes(d.classId) &&
              (d.memberRole === 'OWNER' || d.memberRole === 'MANAGER')
            )
          }
        )
        if (managedClassList.length > 0) flag = true
      }
      return flag
    },
    checkPostReadUser() {
      if (this.item.postType === 'ALARM_PLUS') {
        // item 읽음 처리
        this.item.isRead = true
      } else if (!this.isReadPost && !this.isMyPost) {
        if (this.isManagedPostByNote()) return false

        // item 읽음 처리
        this.item.isRead = true
      }
    },
    chkRead() {
      let flag = false

      if (this.isLocatedEducation) {
        flag = true
        return flag
      }

      if (
        this.item.postType === 'EVENT' ||
        this.item.postType === 'EDUCATION' ||
        this.item.postType === 'MEAL' ||
        this.item.postType === 'NOTICE' ||
        this.isAlarm
      ) {
        if (this.item.isRead) flag = true
        else {
          flag = this.isClickPost;
        }
      } else {
        if (this.item.insertedUserId === this.user.currentId) {
          flag = true
        } else if (this.isManagedPostByNote()) {
          flag = true
        } else {
          if (this.item.isRead) flag = true
          else {
            flag = this.isClickPost;
          }
        }
      }
      return flag
    },
    openDetailPop(post) {
      const alarmPlusDetail = {
        eLetterId: post.alarmPlusId,
        userId: this.user.currentId,
        post: post
      }
      this.setAlarmPlusDetail(alarmPlusDetail)
    }
  }
}
</script>

<style scoped></style>
