<template>
  <div class="lnb-cont-wrap">
    <div class="lnb-wrap edu-info">
      <div class="lnb-inner">
        <div class="total-lnb-wrap">
          <div class="lnb-school-title">{{ $t('help.title') }}</div>
          <ul class="lnb-list">
            <li
              v-for="(item, i) in lnbListHelp"
              :class="{ on: i === mypageCurrentTab }"
              :key="item.currentId"
              @click="goPage(item.url, i)"
            >
              <span>{{ item.title }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: 'MainBodyHelpLnb',
  props: {
    mypageCurrentTab: Number,
    isLogin: Boolean
  },
  data: () => ({}),
  components: {},
  computed: {
    lnbListHelp() {
      let index = 0
      let lnbListHelp = []

      if (this.isLogin) {
        lnbListHelp.push({
          url: '/help/notice',
          title: this.$t('help.lnb.notice'),
          index: index++
        })
        lnbListHelp.push({
          url: '/help/faq',
          title: this.$t('help.lnb.faq'),
          index: index++
        })
        lnbListHelp.push({
          url: '/help/question',
          title: this.$t('help.lnb.question'),
          index: index++
        })
        lnbListHelp.push({
          url: '/help/suggestion',
          title: this.$t('help.lnb.suggestion'),
          index: index++
        })
      }
      lnbListHelp.push({
        url: '/help/contactus',
        title: this.$t('help.lnb.contactus'),
        index: index++
      })

      return lnbListHelp
    }
  },
  watch: {
    $route() {
      this.init()
    }
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    goPage(link, i) {
      let surfix = this.$comn.split(link, '/')
      this.triggerAnalyticsLogEvent({ code: `analytics.help.click.lnb.${surfix.toLowerCase()}` })

      if (i === this.mypageCurrentTab) {
        this.$router.go()
      } else {
        this.onClickTab(i)
        this.$router.push(link, () => {})
      }
    },
    onClickTab(i) {
      const param = {
        index: i
      }
      this.$emit('onChangeTab', param)
    },
    init() {
      const path = this.$route.path
      let existPath = false
      for (const item of this.lnbListHelp) {
        if (item.url.includes(path)) {
          const param = {
            index: item.index
          }
          existPath = true
          this.$emit('onChangeTab', param)
        }
      }
      if (!existPath) {
        this.$emit('onChangeTab', { index: 0 })
      }
    }
  },
  created() {
    this.init()
  }
}
</script>
