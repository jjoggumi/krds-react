<!--
@File(Method): MainBodyClazzesBodyFormApplyList.vue
@Description: 클래스 > 수업관리 > 학교양식 신청서 > 제출내역 탭
@Modified: 2025-07-10 - #80796 학교양식신청서 결재 방식 수정
-->
<template>
  <fragment>
    <div
      class="middle-wrap"
      :style="middleWrapStyle"
    > 
      <div class="inner">
        <hc-select
          :model.sync="query.applyType"
          selectLabel="name"
          selectValue="code"
          defaultLabel="유형 전체"
          :isFocusMode="false"
          :isUseAll="true"
          :item="applyTypes"
          :scrollbarType="1"
          @is-click="removeResource(); searchResource(false)"
        />
        <hc-select
          :model.sync="query.applyStatus"
          selectLabel="name"
          selectValue="code"
          defaultLabel="확인여부"
          :isFocusMode="false"
          :isUseAll="true"
          :item="$constants.CLASS_APPLY.applyStatus"
          :scrollbarType="1"
          @is-click="removeResource(); searchResource(false); option.isApprovalMode = option.isApprovalMode && !(query.applyStatus === 'REJECT' || query.applyStatus === 'COMPLETE')"
        />
        <!-- #80796 학교양식신청서 결재 방식 수정 -->
        <HiButton
          v-if="isManager && !(query.applyStatus === 'REJECT' || query.applyStatus === 'COMPLETE')"
          :key="`option.isApprovalMode-${option.isApprovalMode}`"
          @click="onClickApprovalButton"
          outline color="default" size="md" bitrounded
        >
          {{ !option.isApprovalMode ? '일괄 결재' : (option.checkbox.checkedApplyIds.length > 0 ? '선택 양식 일괄 결재' : '일괄 결재 모드 종료') }}
        </HiButton>
        <HiButton
          :key="`option.isPrintMode-${option.isPrintMode}`"
          @click="onClickPrintButton"
          outline color="default" size="md" bitrounded
        >
          <HiIcon name="ico-printer-thin" size="20" color="primary"/>
          {{ !option.isPrintMode ? '인쇄' : (option.checkbox.checkedApplyIds.length > 0 ? '선택한 신청서 인쇄' : '인쇄 모드 종료') }}
        </HiButton>
        <HiButton
            v-if="isManager"
            :key="`option.isPdfDownloadMode-${option.isPdfDownloadMode}`"
            @click="onClickPdfDownloadButton"
            outline color="default" size="md" bitrounded
        >
          <i class="ico-file-pdf"/>
          {{ !option.isPdfDownloadMode ? '다운로드' : (option.checkbox.checkedApplyIds.length > 0 ? '선택한 신청서 다운로드' : '다운로드 모드 종료') }}
        </HiButton>
      </div>
      <MemberSearch
        :clazzTags="clazzTags"
        :inputPlaceholder="isManager ? '이름, 제목, #태그 검색' : '이름, 제목 검색'"
        :useTag="isManager"
        @search="search" class="type01"
      />
    </div>

    <table class="tbl-col tbl-tr-onclick">
      <colgroup>
        <col style="width: 50px">
        <col style="width: auto;">
        <col style="width: 100px;">
        <col style="width: 180px;">
        <col style="width: 100px;">
        <col style="width: 80px;">
        <col style="width: 50px;">
      </colgroup>
      <thead>
        <tr>
          <template>
            <th v-if="option.isPrintMode || option.isPdfDownloadMode || option.isApprovalMode">
              <div class="checkbox-wrap">
                <input type="checkbox" id="ckAll" @change="handleSelectAllChange($event.target.checked)" :checked="isAllChecked"><label for="ckAll"></label>
              </div>
            </th>
            <th v-else>번호</th>
          </template>
          <th>제목</th>
          <th>신청학생</th>
          <th>제출자</th>
          <th>제출일</th>
          <th>확인상태</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(resource, index) of clazzApplies"
          :key="`${index}-${resource.del}`"
        >
          <td>
            <div
              v-if="option.isPrintMode || option.isPdfDownloadMode || option.isApprovalMode"
              :key="`checkbox-wrap-${option.isPrintMode}-${index}`"
              class="checkbox-wrap"
            >
              <template v-if="getEnabledCheck(resource)">
                <input  type="checkbox" :id="`ck0-${index}`" :value="resource.currentId" v-model="option.checkbox.checkedApplyIds"/>
                <label :for="`ck0-${index}`"></label>
              </template>
              <!--체크 모드이긴 하나 체크를 못해야할 때   -->
              <p v-else>-</p>
            </div>
            <p
              v-else
              :key="`checkbox-wrap-${option.isPrintMode}-${index}-${resources.page.totalElements}`"
              class="skew"
            >
              {{ getElementNumber(index) }}
            </p>
          </td>
          <td
            role="button"
            @click="openDetailPopup(resource)"
          >
            <p class="title">{{ resource.title }}</p>
          </td>
          <td><p class="skew">{{ resource.studentName }}</p></td>
          <td>
            <p class="skew">
            {{ getParentName(resource) }}
            </p>
            <p v-if="isManager && resource.tags" class="desc txt-center">
              {{ resource.tags.map(t => t.tagName).join(', ') }}
            </p>
          </td>
          <td><p class="skew">{{ resource.applyTimestamp ? $moment(resource.applyTimestamp).format('YYYY.MM.DD') : '' }}</p></td>
          <td>
            <p
              class="skew"
              :class="{
                'ft-orange': resource.applyStatus === 'REJECT',
                'ft-blue': resource.applyStatus === 'COMPLETE',
                'ft-lightgray' : resource.applyStatus === 'UNIDENTIFIED' || resource.applyStatus == null
              }"
            >
              {{ getApplyStatusNameByCode({code: resource.applyStatus}) }}
            </p>
          </td>
          <td>
            <main-body-clazzes-body-form-sheet-more
              :isManager="isManager"
              :isApplyMore="true"
              :resource="resource"
              @edit-resource="editResource"
              @delete-resource="deleteResource"
              @hitalk-share="controlHitalkShareModal"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 신청내역 없음 -->
    <main-body-clazzes-body-form-empty-list
      v-if="isEmptyList"
    />

    <!-- 하이톡 공유하기 모달 -->
    <hitalk-share-modal
        v-if="hitalkShareIsOpen"
        :post="post"
        :postType="postType"
        :curClassId="curClassItem.currentId"
        :shareBtnType="shareBtnType"
        @controlHitalkShareModal="controlHitalkShareModal"
    >
    </hitalk-share-modal>

  </fragment>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";
import MainBodyClazzesBodyFormEmptyList from "@/apps/main/clazzes/form/MainBodyClazzesBodyFormEmptyList";
import HcSelect from "@/components/Form/HcSelect";
import {mapFields} from 'vuex-map-fields'
import MainBodyClazzesBodyFormSheetMore from '@/apps/main/clazzes/form/MainBodyClazzesBodyFormSheetMore'
import HitalkShareModal from "@/components/HitalkShare/HitalkShareModal";
import MemberSearch from "@/components/Search/MemberSearch";
import {updateClazzAppliesStatus} from "@hiclass/core";

export default {
  name: "main-body-clazzes-body-form-apply-list",
  components: {MainBodyClazzesBodyFormSheetMore, HcSelect, MainBodyClazzesBodyFormEmptyList, HitalkShareModal, MemberSearch},
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
        isApprovalMode: false,  // #80796 학교양식신청서 결재 방식 수정 - 임의 데이터 추가
        isPrintMode: false,
        isPdfDownloadMode: false,
        checkbox: {
          applyTypes: [
            {
              code: 'ABSENT',
              name: '결석사유서',
              value: true
            },
            {
              code: 'FIELD_STUDY',
              name: '체험활동 신청서',
              value: true
            }
          ],
          applyStatuses: [
            {
              code: 'UNIDENTIFIED',
              name: '미확인만 보기',
              value: false
            }
          ],
          checkedApplyIds: []
        },
      },

      query: null,

      resource: null,
      resources: null,

      shareBtnType: 'table',
      hitalkShareIsOpen: false,
      postType: 'CLASS_APPLY',
      post: {},

      memberSearchItem: {
        searchType: 'NONE',
        searchValue: ''
      }
    }
  },
  computed: {
    ...mapGetters(['CONSTANTS', "getApplyTypeNameByCode", "getApplyStatusNameByCode", "getCurClassMySubscribeView"]),
    ...mapGetters('storeWorksheet', ['clazzApplyComponentsByCode']),
    ...mapFields(['isDimLoading', 'infiniteScroll', 'notSupportedBrowser']),
    ...mapFields('storeWorksheet', ['curClazzApply', 'worksheetPrint']),
    ...mapState(['curClassItem', 'user']),
    ...mapState('storeClazzTag', ['clazzTags']),
    middleWrapStyle() {
      let style = {}
      if (!this.isManager) {
        style['padding-top'] = 0
        style['border-top'] = 0
      }
      return style
    },
    isEmptyList() {
      return this.resources === null || this.resources.page && this.resources.page.totalElements === 0
    },
    clazzApplies() {
      return !this.isEmptyList
        ? this.resources._embedded.clazzApplies.filter(d => !d.del)
        : []
    },
    isAllChecked() {
      return this.option.checkbox.checkedApplyIds.length === this.clazzApplies.filter(this.getEnabledCheck).length
    }
  },
  created() {
    this.searchResource()
  },
  mounted() {
    eventBus.$on('clazz-apply-search-resource', flag => {
      this.removeResource()
      this.searchResource(flag)
    })
    eventBus.$on('do-search-resource', flag => this.searchResource(flag))
    eventBus.$on('clazz-apply-close-export-mode', () => this.closeExportMode())
  },
  destroyed() {
    eventBus.$off('clazz-apply-search-resource')
    eventBus.$off('do-search-resource')
    eventBus.$off('clazz-apply-close-export-mode')
  },
  methods: {
    ...mapMutations({
      setInfiniteScrollIsBusy: 'setInfiniteScrollIsBusy',
    }),
    ...mapActions({
      initInfiniteScroll: 'initInfiniteScroll',
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent'
    }),
    ...mapActions('storeWorksheet', {
      setCurClazzModel: 'setCurClazzModel',
      setCurClazzSheetInfo: 'setCurClazzSheetInfo',
    }),
    ...mapActions('storeHitalk', {
      connectStompClient:'connectStompClient',
      disconnectStompClient: 'disconnectStompClient',
      callChatUserList: 'callChatUserList',
      callChatRooms: 'callChatRooms'
    }),
    resetQuery(flag) {
      if (flag === undefined || flag === true) {
        // 무한 스크롤 store 초기화
        this.initInfiniteScroll()

        this.query = {
          size: this.infiniteScroll.size,
          page: this.infiniteScroll.page,
          sort: ['applyTimestamp,desc', 'insertedTimestamp,desc'],
          classId: this.clazz.currentId,
          applyType: null,
          applyStatus: null
        };

        if (!this.isManager) {
          this.query.userId = this.$store.state.user.currentId
        }

      } else {
        this.query.size = this.infiniteScroll.size
        this.query.page = this.infiniteScroll.page
      }

      if (this.memberSearchItem.searchType === 'KEYWORD') {
        this.query.keyword = this.memberSearchItem.searchValue
      } else if (['TAG', 'TAG_MULTI'].includes(this.memberSearchItem.searchType)) {
        this.query.tagId = this.memberSearchItem.searchValue
      } else {
        this.query.tagId = []
        this.query.keyword = null
      }
    },

    resetTable(response) {
      if (this.resources === null) {
        this.resources = response.data
      } else {
        this.resources.page.totalElements = response.data.page.totalElements
        this.resources._embedded.clazzApplies.push(...response.data._embedded.clazzApplies)
      }

      const existsNext = response.data.page.number + 1 < response.data.page.totalPages
      if (existsNext) {
        this.infiniteScroll.page++
        this.infiniteScroll.isListEnd = false
      } else {
        this.infiniteScroll.page = 0
        this.infiniteScroll.isListEnd = true
      }

      eventBus.$emit('clazzes-set-initScroll', false)

      this.checkRouteQuery()
    },

    getEnabledCheck(clazzApply) {
      return this.option.isPrintMode || this.option.isPdfDownloadMode || (this.option.isApprovalMode && clazzApply.applyStatus === 'UNIDENTIFIED')
    },

    removeResource() {
      // 무한 스크롤 store 초기화
      this.initInfiniteScroll()
      if (this.resources !== null)
        this.resources = null

      // 인쇄 모드에서 선택한 아이템 초기화
      this.option.checkbox.checkedApplyIds.splice(0)
    },

    search({ searchType, searchValue }) {
      this.memberSearchItem = { searchType, searchValue }
      this.removeResource()
      this.searchResource(true)
    },

    async searchResource(flag) {
      this.setInfiniteScrollIsBusy(true)
      this.resetQuery(flag)

      try {
        const res = await this.$hiClass.clazzApplies.search(this.query)
        this.resetTable(res)
      } catch (err) {
        this.$hiClass.alertError(err)
      } finally {
        this.setInfiniteScrollIsBusy(false)
      }
    },

    async readResource(resource) {
      if (!this.option.isBusy) {
        this.option.isBusy = true

        return await this.$hiClass.clazzApplies
          .read(resource)
          .then(res => {
            if (res.data.del) {
              this.$hiClass.alert('삭제된 신청서입니다.', 'warning')
                .then(() => {
                  this.removeResource()
                  this.searchResource(true)
                })

              this.resource = null
              return new Promise(reject => reject(false))
            }
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

    async openDetailPopup(resource, isEdit = false) {
      const sheetType = resource.sheetType ? resource.sheetType : 'H'

      switch (sheetType) {
        case 'W': {
          this.$log.warn(`openDetailPopup => `, resource)

          this.isDimLoading = true

          const sheetId = resource.sheetId
          const classId = resource.classId
          const applyId = resource.currentId

          this.curClazzApply.classInfo = this.clazz
          await this.setCurClazzModel({ applyId: applyId })
          await this.setCurClazzSheetInfo({ sheetId: resource.sheetId })

          // 현재 클래스의 내 구독정보 찾기
          this.curClazzApply.clazzSubscribeView = this.getCurClassMySubscribeView({
            classId: this.clazz.currentId
          })

          this.$router.push(`/worksheetApply/${classId}/${sheetId}/${applyId}?isEdit=${isEdit}`, () => {})
          break
        }
        case 'H': {
          try {
            await this.readResource(resource)
            await this.openHiclassApplyPopup(this.resource, isEdit)
          } catch (e) {
            this.$log.warn(e)
          }
          break
        }
      }

    },

    async openHiclassApplyPopup(resource, isEdit) {
      if (resource) {
        if (isEdit && !this.isManager && resource.applyStatus === 'REJECT') {
          resource.applyStatus = 'UNIDENTIFIED'
        }

        if (this.isManager && resource.applyType === 'MEDICATION_ORDER' && resource.applyStatus !== 'COMPLETE') {
          resource.medicationReport = {
            reportUserName: this.user.userName,
            dosageTimestamp: this.$moment().startOf('day').valueOf(),
            memo: ''
          }
        }

        const clazzApplicationForm = {
          isOpen: true,
          isManager: this.isManager,
          clazz: this.clazz,
          formName: this.resource.applyType,
          mode: isEdit ? 'update' : 'view',
          clazzApply: resource
        }
        this.$store.commit('setClazzApplicationForm', clazzApplicationForm)
      }
    },

    editResource(resource) {
      this.openDetailPopup(resource, true)
    },

    deleteResource(resource) {
      this.$hiClass.confirm('신청서를 삭제하시겠습니까?', 'warning')
        .then(() => {
          const url = `/clazzApplies/${resource.currentId}`
          this.$hiClass.clazzApplies.delete(url)
            .then(() => {
              resource.del = true
              this.resources.page.totalElements--
              this.$hiClass.alertDelete()
            })
            .catch(err => {
              if(err.response.status === 409) {
                this.$hiClass.alert(
                  "선생님 결재가 완료되어 삭제할 수 없습니다.",
                  "error"
                );
                this.removeResource()
                this.searchResource(true)
              } else {
                this.$log.warn(err)
                this.$hiClass.alertError()
              }
            })
        })
    },

    getElementNumber(curIndex) {
      return this.resources.page.totalElements - curIndex
    },

    getStudentNameSuffix(resource) {
      let studentNameSuffix = ''
      let applyUserType = 'PARENTS'

      if (resource.applyUser && resource.applyUser.applyUserType)
        applyUserType = resource.applyUser.applyUserType
      else if (resource.applyUserType)
        applyUserType = resource.applyUserType

      switch (applyUserType) {
        case 'TEACHER':
          studentNameSuffix = '선생님'
          break
        case 'PARENTS':
          studentNameSuffix = '학부모'
          break
        case 'STUDENT':
          studentNameSuffix = '학생'
          break
      }

      return studentNameSuffix
    },

    getParentName(resource) {
      let parentName = ''
      let applyUserType = 'PARENTS'

      if (resource.applyUser && resource.applyUser.applyUserType)
        applyUserType = resource.applyUser.applyUserType
      else if (resource.applyUserType)
        applyUserType = resource.applyUserType

      switch (applyUserType) {
        case 'TEACHER':
        case 'STUDENT':
          parentName = `${resource.parentName} ${this.getStudentNameSuffix(resource)}`
          break
        default:
          parentName = `${resource.parentName} (${resource.studentName} ${this.getStudentNameSuffix(resource)})`
      }

      return parentName;
    },
    // #80796 학교양식신청서 결재 방식 수정 - 클릭 이벤트 추가
    onClickApprovalButton() {
      if (this.option.isPdfDownloadMode) {
        this.$hiClass.alert('다운로드 모드 종료 후 이용해주세요')
        return
      }else if (this.option.isPrintMode) {
        this.$hiClass.alert('인쇄 모드 종료 후 이용해주세요')
        return
      }

      if (this.option.isApprovalMode) {
        this.option.checkbox.checkedApplyIds.length > 0 ?
            this.validateSelectedSheetsCount('approval') :
            this.option.isApprovalMode = false
      } else {
        this.option.isApprovalMode = true
      }
    },
    onClickPrintButton() {
      if (this.option.isPdfDownloadMode) {
        this.$hiClass.alert('다운로드 모드 종료 후 이용해주세요')
        return
      }else if (this.option.isApprovalMode) {
        this.$hiClass.alert('결재 모드 종료 후 이용해주세요')
        return
      }

      if (this.option.isPrintMode) {
        this.option.checkbox.checkedApplyIds.length > 0 ?
            this.validateSelectedSheetsCount('print') :
            this.option.isPrintMode = false
      } else {
        this.option.isPrintMode = true
      }
    },

    onClickPdfDownloadButton() {
      if (this.option.isPrintMode) {
        this.$hiClass.alert('인쇄 모드 종료 후 이용해주세요')
        return
      }else if (this.option.isApprovalMode) {
        this.$hiClass.alert('결재 모드 종료 후 이용해주세요')
        return
      }

      if (this.option.isPdfDownloadMode) {
        this.option.checkbox.checkedApplyIds.length > 0 ?
            this.validateSelectedSheetsCount('pdfDownload') :
            this.option.isPdfDownloadMode = false
      } else {
        this.option.isPdfDownloadMode = true
      }
    },

    handleSelectAllChange (checked) {
      this.option.checkbox.checkedApplyIds = checked ? this.clazzApplies.filter(this.getEnabledCheck).map(item => item.currentId) : []
    },

    togglePrintSelectButton() {
      if (this.option.checkbox.checkedApplyIds.length > 0)
        this.option.checkbox.checkedApplyIds.splice(0)
      else
        this.option.checkbox.checkedApplyIds = this.clazzApplies.filter(item => item.sheetType === 'W').map(item => item.currentId)
    },

    closeExportMode() {
      this.option.checkbox.checkedApplyIds.splice(0)
      this.option.isPrintMode = false
      this.option.isPdfDownloadMode = false
    },

     // #80796 학교양식신청서 결재 방식 수정 - approval 모드 추가
    validateSelectedSheetsCount(mode) {
      const selectedItemApplyIds = this.option.checkbox.checkedApplyIds
      const limit = {
        'print': [100, '인쇄'],
        'pdfDownload': [50, '다운로드'],
        'approval': [50, '결재'],
      }

      if (selectedItemApplyIds.length > limit[mode][0]) {
        this.$hiClass.alert(`선택한 신청서가 한 번에 ${limit[mode][1]} 가능한<br>최대 개수(${limit[mode][0]}건)를 초과했습니다.<br><br>다시 확인해 주세요.`, 'error')
        return false
      }    

      if (mode === 'approval') {
        this.$hiClass.confirm(
          `<strong class="txt-primary">${selectedItemApplyIds.length}</strong>건의 미확인 신청서를<br><strong class="txt-primary">결재 완료</strong>로 변경하시겠습니까?`,null, 
          { customClass:{popup:'hc-confirm'}, 
            title:'학교 양식 신청서 일괄 결재하기'
          }).then(() => this.doApprovalWorksheetsProc(selectedItemApplyIds)).catch(() => {this.option.checkbox.checkedApplyIds = []})
      } else {
        if (selectedItemApplyIds.length >= 20) {
          this.$hiClass.confirm(`선택한 신청서 개수는 <span style="color: #2c79ec">${selectedItemApplyIds.length}</span>개 이며<br>${limit[mode][1]} 준비에 1~10분 정도 소요됩니다.<br><br>계속 진행하시겠습니까?`, 'warning', {customClass:{popup:'hc-confirm only-text'}})
            .then(() => this.doExportWorksheetsProc(mode))
        } else {
          this.doExportWorksheetsProc(mode)
        }
      }
    },

    async doApprovalWorksheetsProc(ids) {
      this.isDimLoading = true

      try {
        const response = await updateClazzAppliesStatus(ids, 'COMPLETE')
        const errorApplies = response._embedded.updateResults.filter(({result}) => !result)

        if (errorApplies.length > 0) {
          this.$hiClass.alert(`${response._embedded.updateResults.length} 건 중에 ${errorApplies.length}건의 결재가 실패하였습니다.`, "error")
        } else {
          this.$toasted.clear()
          this.$toasted.show(`${response._embedded.updateResults.length} 건 결재 완료 되었습니다.`)
        }
      } catch (e) {
        this.$hiClass.alert(`알 수 없는 오류가 발생했습니다. 다시 시도해 주세요 <br> ${e.message || e.toString()}`, "error")
      } finally {
        this.isDimLoading = false
      }

      this.removeResource();
      await this.searchResource(false)
    },

    doExportWorksheetsProc(mode) {
      // worksheet iframe open
      if (mode === 'print') {
        this.triggerAnalyticsLogEvent({code: 'analytics.class.clazzApplies.print'})
      }
      this.worksheetPrint.selectedItemApplyIds = this.option.checkbox.checkedApplyIds
      this.worksheetPrint.isOpen = true
      this.worksheetPrint.mode = mode

      this.isDimLoading = true
    },

    checkRouteQuery() {
      if (this.$route.query.applyId) {
        const applyId = this.$route.query.applyId
        const resource = this.clazzApplies.find(r => r.currentId === applyId)
        resource
          ? this.openDetailPopup(resource)
          : this.$hiClass.alert('제출한 신청서가 없거나 읽기 권한이 없습니다.', 'info')

        this.$router.replace(this.$route.path, () => {})
      }
    },

    async controlHitalkShareModal(flag, resource) {
      this.post = resource

      if (flag) {
        await this.connectStompClient()
        await this.callChatUserList()
        await this.callChatRooms({ force: true })

        this.hitalkShareIsOpen = flag

      } else {
        await this.disconnectStompClient()
        this.hitalkShareIsOpen = flag
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .member-search.type01{
    width:250px;
  }
  .border-selectbox-wrap.custom-select-box-wrap{
    width: 110px;
  }
</style>