<template>
  <div>
    <form
      name="openPopupForm"
      ref="openPopupForm"
      :action="openPopupUri"
      target="_blank"
      :method="method"
      @submit.prevent
    >
      <input
        v-for="key of Object.keys(params)"
        :key="key"
        type="hidden"
        :id="key"
        :name="key"
        :value="params[key]"
      />
    </form>
  </div>
</template>

<script>
export default {
  name: 'open-popup',
  // 함수형 컴포넌트
  fuctional: true,
  components: {},
  props: {
    windowId: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: false
    },
    method: {
      type: String,
      required: false,
      default: 'GET'
    },
    size: {
      type: Object,
      required: true
    },
    params: {
      type: Object,
      required: true
    }
  },

  computed: {
    openPopupUri() {
      return this.path + '?' + this.$qs.stringify(this.params)
    }
  },
  created() {},
  mounted() {
    this.openWindow()
  },
  methods: {
    openWindow() {
      console.log("this.openPopupUri => ", this.openPopupUri)
      try {
        let popupSize = {
          width: this.size.width || screen.availWidth - screen.availWidth / 5,
          height:
            this.size.height || screen.availHeight - screen.availHeight / 5
        }
        let popupform = document.openPopupForm
        popupform.target = this.windowId

        // 듀얼모니터 고려 팝업 정중앙 띄우기
        let curX = window.screenLeft
        let curY = window.screenTop
        let curWidth = document.body.clientWidth
        let curHeight = document.body.clientHeight

        let nLeft = curX + curWidth / 2 - popupSize.width / 2
        let nTop = curY + curHeight / 2 - popupSize.height / 2

        let options = `left=${nLeft}, top=${nTop}, width=${popupSize.width}, height=${popupSize.height}, toolbar=no, menubar=no, location=no, status=no`

        if ((this.$comn.isIE() && this.method === 'GET') || this.openPopupUri.indexOf('/hitalk') > -1 || this.openPopupUri.indexOf('/behavior-records') > -1) {
          // GET 방식만 가능
          window.open(this.openPopupUri.split('?')[0], 'openPopup', options)
        } else {
          // window.open('', this.windowId, options)
          // popupform.submit()
          window.open(this.openPopupUri, this.windowId, options)
        }
      } catch (err) {
        this.$log.warn(this.$options.name + ' openWindow() err => ', err)

        this.closeComponents()
      }

      // window 팝업 open 후 호출 함수 컴포넌트 제거
      this.closeComponents()
    },
    closeComponents() {
      this.$store.commit('setOpenPopup', {})
    }
  }
}
</script>

<style></style>
