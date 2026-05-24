<template>
  <div @mousemove="searchAnchor">
    <slot></slot>
    <div v-if="isPrevueLink" ref="linkPrevueLayer" style="position:absolute; z-index:2147483647">
      <link-prevue :url="prevueLink" :showButton="false">
        <template slot="loading">
          <h1>
            <div class="loading-infinite-scroll-wrap pt-00">
              <div class="icon"></div>
            </div>
          </h1>
        </template>
      </link-prevue>
    </div>
  </div>
</template>

<script>
import LinkPrevue from 'link-prevue'

export default {
  name: 'PrevueLayer',
  components: { 
    LinkPrevue
  },
  props: {},
  data() {
    return {
      prevueLink: '',
      isPrevueLink: false
    }
  },
  computed: {},
  mounted() {},
  watch: {},
  methods: {
    searchAnchor(e) {
      if (e.target.tagName === 'A') {
        let anchor = e.target
        if (anchor.origin !== 'null') {
          this.prevueLink = anchor.href
          this.isPrevueLink = true
          this.$nextTick(() => {
            // TOBE : => 위치, 여러 화면 케이스. 등등 좀 더 생각 해보자.
            this.$refs.linkPrevueLayer.style.top = `${e.pageY}px`
            this.$refs.linkPrevueLayer.style.left = `${e.pageX}px`
          })
          
        }
      } else {
        this.prevueLink = ''
        this.isPrevueLink = false
      }

    }
  }
}
</script>