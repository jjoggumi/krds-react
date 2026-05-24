<!--
@File(Method): MainBodyClazzesBodyFormSheetListMember.vue
@Description: 클래스 > 수업관리 > 학교양식 신청서 > 사용중인 양식 탭
@Modified: 2025-03-19 - #73113 [학교양식태그] 학교양식신청서 화면별 검색 아이콘 및 검색바 너비 수정
-->
<template>
  <div>
    <div class="middle-wrap">
      <hc-select
        :model.sync="query.applyTypes"
        selectLabel="name"
        selectValue="code"
        defaultLabel="유형 전체"
        :isFocusMode="false"
        :isUseAll="true"
        :item="applyTypes"
        :scrollbarType="1"
        @is-click="onClickSelectButton"
      />

      <div class="input-box-wrap round-search-box search-box-wrap">
        <input
          type="text"
          placeholder="신청서 제목 검색"
          v-model="query.title"
          @keyup.enter="onClickSearchButton"
        >        
        <HiButton color="link" size="md" class="btn-search" @click="onClickSearchButton">
          <HiIcon name="ico-search-thin" size="24" color="default"/>
        </HiButton>
        <HiButton v-if="query.title" color="link" size="md" class="btn-delete" @click="query.title = null">
          <HiIcon name="ico-close3" size="14"  color="white" bgColor="gray" rounded="rounded"/>
        </HiButton>
        <!-- <button class="search-btn" @click="onClickSearchButton"></button>
        <button
          v-if="query.title"
          class="input-text-delete-btn"
          style="display: block"
          @click="query.title = null"
        ></button> -->
      </div>
    </div>

    <table class="tbl-col tbl-tr-onclick">
      <colgroup>
        <col style="width: auto">
        <col style="width: 120px;">
        <col style="width: 120px;">
        <col style="width: 120px;">
        <col style="width: 120px;">
      </colgroup>
      <thead>
      <tr>
        <th>[유형] 제목</th><!-- #71977 학교양식신청서 및 설문 > 학반(태그) 추가 - 유형 제목 통합 -->
        <th>대상</th>
        <th colspan="3">관리</th>
      </tr>
      </thead>
      <tbody>

        <main-body-clazzes-body-form-sheet-list-member-table
          v-if="filteredHiclassSheetInfos.length > 0"
          :isManager="isManager"
          :resource-list="filteredHiclassSheetInfos"
          @create-resource="createResource"
        />

        <main-body-clazzes-body-form-sheet-list-member-table
          :isManager="isManager"
          :resource-list="workSheetInfos"
          :resources="resources"
          @download-sheet="downloadSheet"
          @create-resource="createResource"
        />

      </tbody>
    </table>

    <main-body-clazzes-body-form-empty-list
      v-if="isEmptyResource && filteredHiclassSheetInfos.length === 0"
    >
      <template v-if="isTitleSearch" v-slot:message>
        검색된 신청서 양식이 없습니다.
      </template>
      <template v-else v-slot:message>
        신청서 양식이 등록되지 않았습니다.
      </template>
    </main-body-clazzes-body-form-empty-list>
  </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import MainBodyClazzesBodyFormEmptyList from "@/apps/main/clazzes/form/MainBodyClazzesBodyFormEmptyList";
import {mapFields} from 'vuex-map-fields'
import {eventBus} from '@/main'
import HcSelect from "@/components/Form/HcSelect";
import MainBodyClazzesBodyFormSheetListMemberTable
  from "@/apps/main/clazzes/form/MainBodyClazzesBodyFormSheetListMemberTable";

export default {
  name: "main-body-clazzes-body-form-sheet-list-member",
  components: {MainBodyClazzesBodyFormSheetListMemberTable, HcSelect, MainBodyClazzesBodyFormEmptyList },
  props: {
    isManager: Boolean,
    clazz: Object,
    applyTypes: {
      type: Array
    }
  },
  data() {
    return {
      option: {
        isBusy: false,
        isChanged: {
          title: false
        },
      },

      query: null,
      // urlQuery: null,

      // resource: null,
      resources: null,

      hiclassSheetInfos: [],

      isTitleSearch: false
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      getSheetApplyTypeNameByCode: "getSheetApplyTypeNameByCode",
      getApplyStatusNameByCode: "getApplyStatusNameByCode",
      getUserTypeNameByCode: "getUserTypeNameByCode",
      getSheetStatusNameByCode: "getSheetStatusNameByCode",
      getSheetStatusClassByCode: "getSheetStatusClassByCode",
      getCurClassMySubscribeView: "getCurClassMySubscribeView",
    }),
    ...mapFields({
      infiniteScroll: 'infiniteScroll'
    }),
    ...mapFields('storeWorksheet', {
      curClazzApply: 'curClazzApply'
    }),
    isEmptyResource() {
      return this.resources === null || this.resources.page && this.resources.page.totalElements === 0
    },
    workSheetInfos() {
      return !this.isEmptyResource
        ? this.resources._embedded.sheetInfos.filter(d => d.sheetType === 'W')
        : []
    },
    filteredHiclassSheetInfos() {
      if (this.hiclassSheetInfos.length > 0) {
        return this.hiclassSheetInfos
          .filter(sheetInfo => !this.query.applyTypes || sheetInfo.applyType === this.query.applyTypes)
          .filter(sheetInfo => !this.query.sheetStatus || sheetInfo.sheetStatus === this.query.sheetStatus)
      } else {
        return []
      }
    }
  },
  watch: {
    'query.title'() {
      this.option.isChanged.title = true
    },
  },
  created() {
    this.searchResource()
    this.searchHiclassSheetInfos()
  },
  mounted() {
    eventBus.$on('do-search-resource', flag => this.searchResource(flag))
  },
  destroyed() {
    eventBus.$off('do-search-resource')
  },
  methods: {
    ...mapActions({
      initInfiniteScroll: 'initInfiniteScroll'
    }),
    resetQuery(flag) {
      if (flag === undefined || flag === true) {
        // 무한 스크롤 store 초기화
        this.initInfiniteScroll()
        if (this.resources !== null)
          this.resources = null

        this.query = {
          size: this.infiniteScroll.size,
          page: this.infiniteScroll.page,
          sort: 'insertedTimestamp,desc',
          classId: this.clazz.currentId,
          applyTypes: null,
          sheetStatus: 'USED',
          title: null,
          sheetType: 'W'
        }

        if (!this.isManager) {
          this.query.userId = this.$store.state.user.currentId
        }

      } else {
        this.query.size = this.infiniteScroll.size
        this.query.page = this.infiniteScroll.page
      }

    },

    resetTable(response) {
      if (this.resources === null)
        this.resources = response.data
      else
        this.resources._embedded.sheetInfos.push(...response.data._embedded.sheetInfos)

      const existsNext = response.data.page.number + 1 < response.data.page.totalPages

      if (existsNext) {
        this.infiniteScroll.page++
        this.infiniteScroll.isListEnd = false
      } else {
        this.infiniteScroll.page = 0
        this.infiniteScroll.isListEnd = true
      }

      eventBus.$emit('clazzes-set-initScroll', false)
    },

    searchResource(flag) {
      this.$store.commit('setInfiniteScrollIsBusy', true)

      this.resetQuery(flag)

      this.$hiClass.sheetInfos
        .search(this.query)
        .then(res => {
          this.isTitleSearch = this.query.title !== null
          this.resetTable(res);
        })
        .catch(err => {
          this.$hiClass.alertError(err);
        })
        .finally(() => {
          this.$store.commit('setInfiniteScrollIsBusy', false)
        })
    },

    searchHiclassSheetInfos() {
      const query = {
        size: 20,
        page: 0,
        sort: 'applyType,asc',
        classId: this.clazz.currentId,
        sheetType: 'H',
        sheetStatus: 'USED',
      }

      // 하이클래스 신청서 배열 초기화
      this.hiclassSheetInfos.splice(0)

      // 제목 검색
      if (this.query.title)
        query.title = this.query.title

      this.$hiClass.sheetInfos
        .search(query)
        .then(res => {
          const hiclassSheetInfos = res.data._embedded.sheetInfos.filter(d => !d.del)
          this.hiclassSheetInfos.push(...hiclassSheetInfos)

          this.option.isChanged.title = false
        })
        .catch(err => {
          this.$hiClass.alertError(err);
        })
        .finally(() => {
          this.checkRouteQuery()
        })
    },

    onClickPreview(resource) {
      switch (resource.sheetType) {
        case 'W': {
          const sheetId = resource.sheetId
          const parentId = resource.parentId
          window.open(
            `/worksheets/${parentId}/${sheetId}/preview`,
            'worksheetPreview',
            `height=${screen.availHeight -
            this.$store.state
              .TASKBAR_HEIGHT},width=${screen.availWidth -
            this.$store.state
              .NOTEBOARD_MARGIN_WIDTH},top=0,left=0,resizable,scrollbars=1`
          )
          break
        }
      }
    },

    onClickApply(resource) {
      this.$log.debug(resource)

      switch (resource.sheetType) {
        case 'W': {
          const sheetId = resource.sheetId
          const parentId = resource.parentId

          this.curClazzApply.classInfo = this.clazz
          this.curClazzApply.sheetInfo = resource

          // 현재 클래스의 내 구독정보 찾기
          this.curClazzApply.clazzSubscribeView = this.getCurClassMySubscribeView({
            classId: this.clazz.currentId
          })

          this.$router.push(`/worksheetApply/${parentId}/${sheetId}`, () => {})
          break
        }
        case 'H': {
          const payload = {
            formName: resource.applyType,
            mode: 'create',
            sheetId: resource.sheetId
          }
          this.$emit('on-click-create-form', payload)
          break
        }
      }
    },

    onClickSelectButton() {
      this.removeResource();
      this.searchResource(false)
    },

    onClickSearchButton() {
      // if (this.option.isChanged.title) {}  // 검색어가 변경되었을 경우에만 검색 요청
      this.removeResource()
      this.searchResource(false)
      this.searchHiclassSheetInfos()
    },

    downloadSheet(resource) {
      const url = `/sheets/${resource.sheetId}`
      this.$hiClass.sheets.read(url)
        .then(res => {
          let originalFileData = res.data.sheetMedias[0]
          if (!originalFileData)
            originalFileData = res.data.sheetMedias.find(item => item.mediaCd === this.CONSTANTS.WORKSHEET_MEDIA.MEDIA_CD.UPFILE)

          this.$comn.download(originalFileData.filePath, originalFileData.realFileName);
        })
        .catch(err => {
          this.$log.warn(err)
        })
    },

    createResource(resource) {
      this.onClickApply(resource)
    },

    removeResource() {
      // 무한 스크롤 store 초기화
      this.initInfiniteScroll()
      if (this.resources !== null)
        this.resources = null
    },

    checkRouteQuery() {
      if (this.$route.query.sheetId) {
        const sheetId = this.$route.query.sheetId
        const resource = this.filteredHiclassSheetInfos.find(r => r.sheetId === sheetId)
        resource
          ? this.createResource(resource)
          : this.$hiClass.alert('작성할 신청서 양식이 없습니다.', 'info')

        this.$router.replace(this.$route.path, () => {})
      }
    },

  }
}
</script>

<style lang="scss"></style>