<!--
@File(Method): WorksheetShareList.vue
@Description: 우리학교 신청서 양식 팝업
@Modified: #70438 학교양식 신청 공유 후 확인 > HiSelect 박스로 교체
-->

<template>
  <!-- 우리학교 신청서 양식 팝업 -->
  <div class="modal school-form-list-modal" style="display: block">
    <div
      ref="modal"
      class="modal-cont-wrap"
      :style="modalStyleObj"
    >
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">우리학교 신청서 양식</div>
          </div>
          <div class="school-form-list-wrap">
            <div class="left">
              <div class="top-wrap">
                <div class="input-box-wrap round-search-box search-box-wrap">
                  <input
                    type="text"
                    :placeholder="'제목 검색'"
                    v-model="option.keyword"
                    @keyup.enter="searchResource(false)"
                  >
                  <button class="search-btn" @click="searchResource(false)"></button>
                </div>
              </div>

              <div class="list-wrap custom-scr">
                <div class="sort-wrap">
                  <button
                    class="btn-sort"
                    :class="{
                      on: query.sort.includes('insertedTimestamp'),
                      down: query.sort === 'insertedTimestamp,desc'
                    }"
                    @click="toggleSort('insertedTimestamp'); searchResource(false)"
                  >등록일</button>
                  <button
                    class="btn-sort"
                    :class="{
                      on: query.sort.includes('usedCount'),
                      down: query.sort === 'usedCount,desc'
                    }"
                    @click="toggleSort('usedCount'); searchResource(false)"
                  >사용순</button>
                </div>

                <!-- 
                <hc-select
                  :model.sync="query.applyTypes"
                  selectLabel="name"
                  selectValue="code"
                  defaultLabel="전체유형"
                  :isFocusMode="false"
                  :isUseAll="true"
                  :item="applyTypes"
                  :scrollbarType="1"
                  @is-click="searchResource(false)"
                /> 
                -->
                <HiSelectBox
                  class="xs"
                  :value.sync="query.applyTypes"
                  :items="applyTypes.map(d => ({ title: d.name, value: d.code }))"
                  :isUseAll="true"
                  empty-title="전체유형"
                  selectBoxType="default"
                  @update:value="searchResource(false)"
                /> 

                <div class="checkbox-wrap">
                  <input
                    type="checkbox"
                    id="ck-myshareform"
                    v-model="option.checkbox.isMyShareForm"
                  >
                  <label for="ck-myshareform">
                    <span>내가 공유한 양식</span>
                  </label>
                </div>

                <div class="school-form-list">
                  <template v-if="workSheetInfos.length > 0">
                    <worksheet-share-list-item
                      v-for="resource of workSheetInfos"
                      :key="resource.sheetId"
                      :resource="resource"
                      :model="model"
                      @is-click="clickItem"
                      @reset-item="resetItem"
                    />
                  </template>

                  <template v-if="isEmptyList || isEmptyFilteredList">
                    <div class="empty">
                      검색 결과가 없습니다.
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <div class="right">
              <div class="preview-wrap">
                <div class="preview-inner">
                  <iframe
                    v-if="selectItemPath && model.sheetId"
                    :src="selectItemPath"
                  ></iframe>
                  <div
                    v-else
                    class="empty"
                  >
                    우리학교에서 사용할<br>신청서 양식을 선택해주세요.
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="!worksheetShareList.isViewOnly"
              class="bottom"
            >
              <button
                class="btn-bg-c"
                :class="{
                  dis: !model.sheetId
                }"
                :disabled="!model.sheetId"
                @click="selectSheet"
              >
                양식 사용하기
              </button>
            </div>

          </div>
        </div>

        <div
          class="modal-close-btn modal-close-icon"
          @click="close"
        ></div>

      </div>
    </div>
  </div>
</template>

<script>
import '@/assets/css/worksheets.scss';
import {mapFields} from "vuex-map-fields";
import HcSelect from "@/components/Form/HcSelect";
import WorksheetShareListItem from "@/components/Popup/WorksheetShareListItem";
import axios from 'axios';

export default {
  name: "worksheet-share-list",
  components: {WorksheetShareListItem, HcSelect},
  data() {
    return {
      option: {
        isBusy: false,
        keyword: null,
        checkbox: {
          isMyShareForm: false
        }
      },

      m_height: 0,
      m_width: 0,

      query: null,
      resources: null,

      selectItemPath: null,

      model: {
        sheetId: null,
        parentId: null
      },

      schoolResource: {
        schoolId: null,
        schoolName: null
      },

      applyTypes: []

    }
  },
  computed: {
    ...mapFields('storeWorksheet', {
      worksheetShareList: 'worksheetShareList'
    }),
    modalStyleObj() {
      return {
        "margin-top": -this.m_height + "px",
        "margin-left": -this.m_width + "px"
      };
    },
    isEmptyList() {
      return this.resources === null || this.resources.page && this.resources.page.totalElements === 0
    },
    isEmptyFilteredList() {
      return this.option.checkbox.isMyShareForm && this.workSheetInfos.length === 0
    },
    workSheetInfos() {
      try {
        if (this.isEmptyList) {
          return []

        } else {
          const isMyShareForm = this.option.checkbox.isMyShareForm
          const loginUserId = this.$store.state.user.currentId || localStorage.uuid
          return this.resources._embedded.sheetInfos
            .filter(d => d.sheetType === 'W' && !d.del)
            .filter(d => isMyShareForm ? (d.insertedUser || {}).currentId === loginUserId : d)
        }

      } catch (err) {
        this.$log.warn(err)
        return []

      }
    },
  },
  created() {
    // todo: 우리학교 양식 등록하기 > 불러오기 버튼 클릭시에는 제외하도록 한다.
    if (!this.worksheetShareList.schoolResource)
      this.getSchool(this.worksheetShareList.schoolId)

    this.searchResource()
  },
  mounted() {
    const positionObj = this.$comn.getModalPosition(this.$refs.modal);
    this.m_height = positionObj.m_height;
    this.m_width = positionObj.m_width;

    this.$hiClass.toggleBodyClass('add', 'hidden')

    this.getApplyTypes()
  },
  beforeDestroy() {
    this.worksheetShareList.isViewOnly = false
    // this.worksheetShareList.schoolId = false
    this.worksheetShareList.schoolResource = null
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    close() {
      this.worksheetShareList.isOpen = false
    },

    setQuery(query) {
      try {
        for (const [key, value] of Object.entries(query)) {
          this.query[key] = value
        }
      } catch (e) {
        this.$log.warn(e)
      }
    },

    toggleSort(selectSortKey) {
      const currentSorts = this.query.sort.split(',')
      const currentSortKey = currentSorts[0]
      const currentSortValue = currentSorts[1]
      const nextSortValue = ['asc', 'desc'].filter(v => v !== currentSortValue)[0]
      let sort = null

      if (currentSortKey === selectSortKey) {
        sort = `${currentSortKey},${nextSortValue}`
      } else {
        sort = `${selectSortKey},desc`
      }
      this.setQuery({ sort })
    },

    async resetQuery(flag) {
      if (flag === undefined || flag === true) {
        // TODO: 페이징 처리 필요!
        this.query = {
          size: 1000,
          page: 0,
          sort: "insertedTimestamp,desc",
          schoolId: this.worksheetShareList.schoolId,
          applyTypes: null,
          sheetStatus: null,
          title: null
        }
      }

      this.selectItemPath = null
      this.model = {
        sheetId: null,
        parentId: null
      }

      // 저장된 유형 초기값으로 검색
      if (this.worksheetShareList.applyType) {
        this.query.applyTypes = this.worksheetShareList.applyType
        this.worksheetShareList.applyType = null  // 검색 후 저장된 유형 초기값 삭제
      }

      this.query.parentId = this.worksheetShareList.schoolId
      this.query.title = this.option.keyword
    },

    resetTable(response) {
      this.resources = response.data;
    },

    async searchResource(flag) {
      if (!this.option.isBusy) {
        this.option.isBusy = true

        try {
          await this.resetQuery(flag)

          this.$hiClass.sheetInfos
            .search(this.query)
            .then(res => {
              this.resetTable(res);
            })
            .catch(err => {
              this.$hiClass.alertError(err);
            })
            .finally(() => {
              this.option.isBusy = false
            })

        } catch (e) {
          alert(e)
        }

      }
    },

    clickItem(resource) {
      const parentId = resource.parentId
      const sheetId = resource.sheetId
      this.selectItemPath = `/worksheets/${parentId}/${sheetId}/preview/true`

      this.model = resource
    },

    resetItem() {
      this.selectItemPath = null
      this.model = {
        sheetId: null,
        parentId: null
      }
    },

    selectSheet() {
      this.$hiClass.confirm('신청서 양식을 사용하시겠습니까?')
        .then(() => {
          if (!this.option.isBusy) {
            this.option.isBusy = true

            const url = `/sheetInfos/${this.model.parentId}/${this.model.sheetId}`
            this.$hiClass.sheetInfos.updateUsedCount(url)
              .then(() => {
                this.$emit('is-select', this.model)
                this.close()
              })
              .catch(err => {
                this.$log.warn(err)
                this.$hiClass.alertError(err);
              })
              .finally(() => {
                this.option.isBusy = false
              })
          }
        })
    },

    /**
     * 학교 검색
     * 404 에러 발생시 페이지 이동 없음. alert 노출
     * @param schoolId
     * @return {Promise<unknown>}
     */
    getSchool(schoolId) {
      const url = this.$apiUrl + `/schools/${schoolId}`

      return new Promise((resolve, reject) => {
        axios({
          method: 'GET',
          url: url,
          headers: {
            Authorization: `Bearer ${localStorage.idToken}`
          }
        })
          .then(res => {
            this.$set(this, 'schoolResource', res.data)
            resolve(res.data)
          })
          .catch(err => {
            this.$set(this, 'schoolResource', {})
            reject(err)
          })
      })
    },

    async getApplyTypes() {
      try {
        const res = await this.$hiClass.sheetInfos.readApplyTypes()
        this.applyTypes = Object.entries(res.data.applyTypes).map(([key, value]) => ({ code: key, name: value }))
      } catch (e) {
        this.applyTypes = this.$constants.CLASS_APPLY.applyType
        this.$log.warn(e)
      }
    }
  }
}
</script>

<style scoped></style>
