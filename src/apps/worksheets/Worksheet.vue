<template>
  <div class="worksheet-wrap">

    <worksheet-header
      v-if="isVisibleHeader"
      :mode="viewType"
      :sheetStatus="model.sheetStatus"
    />

<!--    <Portal v-if="true" to="common-modal">
      <not-supported-browser />
    </Portal>-->

    <div
      class="worksheet-container"
      :style="worksheetContainerStyle"
    >
      <!-- worksheet edit / detail / preview iframe -->
      <component
        v-if="!notSupportedBrowser.isOpen"
        :is="worksheetComponent"
        :parentId="parentId"
        :worksheetId="worksheetId"
        :isVisibleHeader="isVisibleHeader"
      />

    </div>

    <!-- 전제화면 클릭 불가 로딩 처리 -->
    <loading-overlay
      key="loading-overlay"
      :active.sync="$store.state.storeWorksheet.isInvisibleLoading"
      :can-cancel="false"
      :is-full-page="true"
      :color="'#4275df'"
      :backgroundColor="'rgba(90,90,90,0)'"
      :blur="'0px'"
      :opacity="0"
      :width="0"
      :height="0"
      :z-index="99999"
    />

  </div>
</template>

<script>
import {mapActions} from "vuex";

import '@/assets/css/worksheets.scss';

import WorksheetHeader from "@/apps/worksheets/WorksheetHeader";

import WorksheetEdit from "@/apps/worksheets/WorksheetEdit";
import WorksheetPreview from "@/apps/worksheets/WorksheetPreview";
import NotSupportedBrowser from "@/components/Popup/NotSupportedBrowser";
import {mapFields} from "vuex-map-fields";

export default {
  name: 'Worksheet',
  data() {
    return {
      model: {
        sheetStatus: ''
      }
    }
  },
  components: {
    NotSupportedBrowser,
    WorksheetPreview,
    WorksheetHeader,
    WorksheetEdit,
    LoadingOverlay: () => import('vue-loading-overlay')
  },
  computed: {
    ...mapFields({
      notSupportedBrowser: 'notSupportedBrowser'
    }),
    isVisibleHeader() {
      return !(this.viewType === 'preview' || this.viewType === 'submit')
    },
    parentId() {
      return this.$route.params.parentId || 0
    },
    worksheetId() {
      return this.$route.params.sheetId || 0
    },
    viewType() {
      return this.$route.params.viewType || 'preview'
    },
    worksheetComponent() {
      return `worksheet-${this.viewType}`
    },
    worksheetContainerStyle() {
      const style = {}

      if (!this.isVisibleHeader) {
        style['padding-top'] = 0
      }

      return style
    }
  },
  methods: {
    ...mapActions({
      // openTermsView: "openTermsView"
    }),
    getSheet(sheetId) {
      const url = `/sheets/${sheetId}`
      return this.$hiClass.sheets.read(url)
        .then(res => {
          this.$set(this, 'model', res.data)
        })
        .catch(err => {
          this.$hiClass.alert(err)
        })
    },
  },
  created() {
    // if (this.$store.state.user.userType !== 'TEACHER')
    //   this.$router.push('/main')

    if (this.$comn.isIE()) {
      this.notSupportedBrowser.isOpen = true
      this.notSupportedBrowser.pageName = `worksheets-${this.viewType}`

    } else {
      this.getSheet(this.worksheetId)

    }
  },
  mounted() {
    // this.$hiClass.alert(`this.viewType => ` + this.viewType)
    this.$hiClass.toggleBodyClass('add', 'worksheet')
  },
  beforeDestroy() {
    this.$hiClass.toggleBodyClass('remove', 'worksheet')
  },
  destroyed() {
  }
}
</script>

<style scoped></style>