<!--
@File(Method): MainBodyClazzesBodyFormSheetList.vue
@Description: 클래스 > 수업관리 > 학교양식 신청서 > 신청서 관리 탭
@Modified: 2026-01-05 - #82737 검색기능 HiSearchBox 컴포넌트로 변경
-->
<template>
  <div>
    <div
      v-if="isManager"
      class="middle-wrap"
    >
      <div class="inner">
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

        <hc-select
          :model.sync="query.sheetStatus"
          selectLabel="name"
          selectValue="code"
          defaultLabel="전체"
          :isFocusMode="false"
          :isUseAll="true"
          :item="$constants.WORKSHEET_APPLY.sheetStatus"
          :scrollbarType="1"
          @is-click="onClickSelectButton"
        />
      </div>

      <!-- <div class="input-box-wrap round-search-box search-box-wrap">
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
      </div> -->
      <HiSearchBox class="search-box" v-model="query.title" size="sm" placeholder="신청서 제목 검색" @search="onClickSearchButton" rounded/>
    </div>

    <table class="tbl-col tbl-tr-onclick">
      <colgroup>
        <col style="width: 120px;">
        <col style="width: auto;">
        <col style="width: 120px;">
        <col style="width: 150px;">
        <col style="width: 50px;">
        <col style="width: 50px;">
      </colgroup>
      <thead>
      <tr>
        <th>유형</th>
        <th>제목</th>
        <th>등록일</th>
        <th>제출대상</th>
        <th>사용여부</th>
        <th>관리</th>
      </tr>
      </thead>
      <tbody>

        <main-body-clazzes-body-form-sheet-list-table
          :resource-list="filteredHiclassSheetInfos"
          @create-resource="createResource"
        />

        <main-body-clazzes-body-form-sheet-list-table
          :resource-list="workSheetInfos"
          :resources="resources"
          @edit-sheet="editSheet"
          @copy-sheet="copySheet"
          @delete-sheet="deleteSheet"
          @download-sheet="downloadSheet"
          @create-resource="createResource"
          @share-sheet="shareSheet"
          @share-sheet-other-school="shareSheetOtherSchool"
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
import {eventBus} from "@/main";
import MainBodyClazzesBodyFormEmptyList from "@/apps/main/clazzes/form/MainBodyClazzesBodyFormEmptyList";
import HcSelect from "@/components/Form/HcSelect";
import {mapFields} from "vuex-map-fields";
import validate from "uuid-validate";
import MainBodyClazzesBodyFormSheetListTable from '@/apps/main/clazzes/form/MainBodyClazzesBodyFormSheetListTable'

export default {
  name: "main-body-clazzes-body-form-sheet-list",
  components: {
    MainBodyClazzesBodyFormSheetListTable,
    HcSelect, MainBodyClazzesBodyFormEmptyList},
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
        message: {
          shareSheet: {
            confirmShareReady: `우리 학교 클래스에 양식을 공유하시겠습니까?`,
            confirmShareComplete: `우리 학교에 양식이 공유 되었습니다.<br>확인 하시겠습니까?`,
            existsShare: `우리 학교에 이미 공유된 양식입니다.<br>그래도 다시 공유하시겠습니까?`,
            errorShare: `양식 공유가 정상적으로 처리되지 않았습니다.<br>잠시후 다시 시도해 주세요.`
          },
          shareSheetOtherSchool: {
            confirmShareReady: `로 양식을 공유하시겠습니까?`,
            confirmShareComplete: `로 양식이 공유 되었습니다.<br>확인 하시겠습니까?`,
            existsShare: `로 이미 공유된 양식입니다.<br>다시 한번 확인해 주세요.`,
            errorShare: `양식 공유가 정상적으로 처리되지 않았습니다.<br>잠시후 다시 시도해 주세요.`,
            promptSchool: '공유할 학교 UUID를 정확하게 입력해주세요.'
          }
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
    ...mapFields({
      infiniteScroll: 'infiniteScroll'
    }),
    ...mapFields('storeWorksheet', {
      curClazzApply: 'curClazzApply',
      curWorksheetCreate: 'curWorksheetCreate',
      worksheetShareList: 'worksheetShareList',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      getSheetApplyTypeNameByCode: "getSheetApplyTypeNameByCode",
      getApplyStatusNameByCode: "getApplyStatusNameByCode",
      getUserTypeNameByCode: "getUserTypeNameByCode",
      getSheetStatusNameByCode: "getSheetStatusNameByCode",
      getSheetStatusClassByCode: "getSheetStatusClassByCode",
      getCurClassMySubscribeView: 'getCurClassMySubscribeView',
    }),
    middleWrapStyle() {
      let style = {}
      if (!this.isManager) {
        style['padding-top'] = 0
        style['border-top'] = 0
      }
      return style
    },
    isEmptyResource() {
      return this.resources === null || this.resources.page && this.resources.page.totalElements === 0
    },
    workSheetInfos() {
      return !this.isEmptyResource
        ? this.resources._embedded.sheetInfos.filter(d => d.sheetType === 'W' && !d.del)
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
    }
  },
  created() {
    if (!this.isManager)
      this.$router.replace(`/main/clazzes/${this.clazz.currentId}/form/sheetListMember`, () => {})

    this.searchResource()
    this.searchHiclassSheetInfos()
  },
  mounted() {
    eventBus.$on('clazz-apply-search-resource', flag => {
      this.removeResource()
      this.searchResource(flag)
    })
    eventBus.$on('do-search-resource', flag => this.searchResource(flag))
  },
  destroyed() {
    eventBus.$off('clazz-apply-search-resource')
    eventBus.$off('do-search-resource')
  },
  methods: {
    ...mapActions({
      initInfiniteScroll: 'initInfiniteScroll'
    }),
    ...mapActions('storeWorksheet', {
    }),
    resetQuery(flag) {
      if (flag === undefined || flag === true) {
        // 무한 스크롤 store 초기화
        this.initInfiniteScroll()

        this.query = {
          size: this.infiniteScroll.size,
          page: this.infiniteScroll.page,
          sort: ['sheetStatus,desc', 'insertedTimestamp,desc'],
          classId: this.clazz.currentId,
          sheetType: 'W',
          title: null
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

    removeResource() {
      // 무한 스크롤 store 초기화
      this.initInfiniteScroll()
      if (this.resources !== null)
        this.resources = null
    },

    searchResource(flag) {
      if (!this.infiniteScroll.isBusy) {
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
            // setTimeout(() => {
            // }, 500)
          })
      }
    },

    searchHiclassSheetInfos() {
      const query = {
        size: 20,
        page: 0,
        sort: ['sheetStatus,desc', 'applyType,asc'],
        classId: this.clazz.currentId,
        sheetType: 'H'
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
    },

    async readResource(resource) {
      if (!this.option.isBusy) {
        this.option.isBusy = true

        await this.$hiClass.clazzApplies
          .read(resource)
          .then(res => {
            this.resource = res.data
          })
          .catch(err => {
            this.$hiClass.alertError(err);
            this.resource = null
          })
          .finally(() => {
            this.option.isBusy = false
          })
      }
    },

    async openDetailPopup(resource) {

      await this.readResource(resource)

      const clazzApplicationForm = {
        isOpen: true,
        isManager: this.isManager,
        clazz: this.clazz,
        formName: this.resource.applyType,
        mode: 'view',
        clazzApply: this.resource
      }
      this.$store.commit('setClazzApplicationForm', clazzApplicationForm)
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



    copySheet(resource) {
      const copiedResource = Object.assign({}, resource)
      this.curWorksheetCreate.copiedSheetModel = copiedResource

      const parentId = copiedResource.parentId
      this.$router.push(`/worksheetCreate/${parentId}`, () => {})
    },

    deleteSheet(resource) {
      this.$hiClass.confirm('신청서 양식을 삭제하시겠습니까?', 'warning')
        .then(() => {
          const url = `/sheetInfos/${resource.parentId}/${resource.sheetId}`
          this.$hiClass.sheetInfos.delete(url)
            .then(() => {
              resource.del = true
              this.resources.page.totalElements--
              this.$hiClass.alertDelete()
            })
            .catch(err => {
              this.$log.warn(err)
              this.$hiClass.alertError()
            })
        })
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

    shareSheet(resource) {
      this.shareSheetProc(resource)
    },

    shareSheetOtherSchool(resource) {
      const messageType = 'shareSheetOtherSchool'

      if (resource.share) {
        this.$hiClass.alert('다른 학교' + this.option.message[messageType].existsShare, 'warning')
        return false
      }

      const schoolId = window.prompt(this.option.message[messageType].promptSchool, '');
      const requestBody = {}

      if (schoolId)
        requestBody.schoolId = schoolId

      if (!requestBody.schoolId) {
        return false
      }

      if (!validate(requestBody.schoolId)) {
        this.$hiClass.alert(this.option.message[messageType].promptSchool, 'warning')
        return false
      }

      const url = this.$apiUrl + `/schools/${schoolId}`
      this.$hiClass.schools.read(url)
        .then(res => {
          this.shareSheetProc(resource, requestBody, res.data)
        })
        .catch(() => {
          this.$hiClass.alert(this.option.message[messageType].errorShare)
        })
    },

    shareSheetProc(resource, requestBody, schoolResource) {
      const messageType = requestBody && requestBody.schoolId ? 'shareSheetOtherSchool' : 'shareSheet'
      const errorShare = this.option.message[messageType].errorShare
      let confirmShareReady = this.option.message[messageType].confirmShareReady
      let confirmShareComplete = this.option.message[messageType].confirmShareComplete
      let existsShare = this.option.message[messageType].existsShare

      if (schoolResource && schoolResource.schoolName) {
        confirmShareReady = `[${schoolResource.schoolName}]` + confirmShareReady
        confirmShareComplete = `[${schoolResource.schoolName}]` + confirmShareComplete
        existsShare = `[${schoolResource.schoolName}]` + existsShare
      }

      if (resource.share && !requestBody) {
        confirmShareReady = existsShare
      }

      this.$hiClass.confirm(confirmShareReady)
        .then(() => {

          const url = `/sheetInfos/${resource.parentId}/${resource.sheetId}`
          this.$hiClass.sheetInfos.updateShare(requestBody, url)
            .then(res => {
              // 공유 완료 후 공유 상태 수정
              resource.share = true

              this.$log.debug(`this.$hiClass.sheetInfos.updateShare(url) res => `, res)

              this.$hiClass.confirm(confirmShareComplete)
                .then(() => {
                  this.worksheetShareList.schoolId = res.data.schoolId
                  this.worksheetShareList.schoolResource = schoolResource
                  this.worksheetShareList.isViewOnly = true
                  this.worksheetShareList.isOpen = true
                })
            })
            .catch(err => {
              this.$log.warn(`this.$hiClass.sheetInfos.updateShare(url) err, err.response.status => `, err, err.response.status)

              const errMessage = err.response.status === 409 ? existsShare : errorShare
              this.$hiClass.alert(errMessage, 'error')
              this.searchResource(false)
            })

        })
    },

    editSheet(resource) {
      const parentId = resource.parentId
      const sheetId = resource.sheetId
      if (parentId && sheetId)
        this.$router.push(`/worksheetCreate/${parentId}/${sheetId}`, () => {})
      else
        this.$hiClass.alert('정상적으로 등록된 양식이 아닙니다.')
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
    }

  }
}
</script>

<style lang="scss" scoped>
.hi-search-box{
  width: 290px;
  &::v-deep{
    .hi-input{
      width: 100%;        
      input{
        &[type='text'],
        &[type='number'] {
          font-size: 15px;
        }
      }
    }
  }
}
</style>