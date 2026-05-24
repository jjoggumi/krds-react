<!--
@File(Method): ClassApplyList.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 학교양식 신청서 > 학생별 현황 탭 > 제출내역
@Modified: 2025-02-20 - #71977 학교양식 신청서 > 제출내역 팝업 건수별 공통 높이값으로 노출되도록 수정(#73128) - himodal 적용
-->

<template>
  <div>
    <HiModal type="type01" size="xl" @close="setClose" class="submit-list-modal">
      <template v-slot:heading>제출내역</template>
      <template v-slot:content>
        <div class="middle-wrap">
          <div class="count txt-left mb-10">
            총 <span class="ft-blue">{{ totalElements }}</span>건
          </div>
        </div>

        <div class="tbl-fixed-row">
          <table class="hi-tbl type01">
            <colgroup>
              <col style="width: 50px">
              <col style="width: 240px;">
              <col style="width: 100px;">
              <col style="width: 200px;">
              <col style="width: 100px;">
              <col style="width: 88px;">
            </colgroup>
            <thead class="fixed-area">
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>신청학생</th>
              <th>제출자</th>
              <th>제출일</th>
              <th>확인상태</th>
            </tr>
            </thead>
            <tbody>
            <template v-if="!isEmptyList">
              <tr
                v-for="(resource, index) of clazzApplies"
                :key="index"
              >
                <td><p class="skew">{{ index + 1 }}</p></td>
                <td><p class="skew">{{ resource.title }}</p></td>
                <td><p class="skew">{{ resource.studentName }}</p></td>
                <td>
                  <p class="skew">{{ getParentName(resource) }}</p>
                  <p v-if="resource.tags" class="desc txt-center">{{ resource.tags.map(t => t.tagName).join(', ') }}</p>
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
              </tr>
            </template>
            </tbody>
          </table>
          <main-body-clazzes-body-form-empty-list
            v-if="isEmptyList"
          >
            <template v-slot:message>
              제출내역이 없습니다.
            </template>
          </main-body-clazzes-body-form-empty-list>
        </div>
      </template>      
    </HiModal>

    <!-- <div class="modal common-modal submit-list-modal">
      <div
        ref="modal"
        class="modal-cont-wrap"
        :style="modalStyleObj"
        v-click-outside="setClose"
      >
        <div class="modal-cont boundary-box">
          <div class="modal-cont-inner">
            <div class="modal-title-wrap">
              <div class="title">제출내역</div>
            </div>

            <div class="middle-wrap">
              <div class="count">
                총 <span class="ft-blue">{{ totalElements }}</span>건
              </div>
            </div>

            <div class="table-wrap">
              <table class="tbl-col">
                <colgroup>
                  <col style="width: 50px">
                  <col style="width: 240px;">
                  <col style="width: 100px;">
                  <col style="width: 200px;">
                  <col style="width: 100px;">
                  <col style="width: 88px;">
                </colgroup>
                <thead>
                <tr>
                  <th>번호</th>
                  <th>제목</th>
                  <th>신청학생</th>
                  <th>제출자</th>
                  <th>제출일</th>
                  <th>확인상태</th>
                </tr>
                </thead>
                <tbody>
                <template v-if="!isEmptyList">
                  <tr
                    v-for="(resource, index) of clazzApplies"
                    :key="index"
                  >
                    <td><p class="skew">{{ index + 1 }}</p></td>
                    <td><p class="skew">{{ resource.title }}</p></td>
                    <td><p class="skew">{{ resource.studentName }}</p></td>
                    <td>
                      <p class="skew">{{ getParentName(resource) }}</p>
                      <p v-if="resource.tags" class="desc txt-center">{{ resource.tags.map(t => t.tagName).join(', ') }}</p>
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
                  </tr>
                </template>
                </tbody>
              </table>
              <main-body-clazzes-body-form-empty-list
                v-if="isEmptyList"
              >
                <template v-slot:message>
                  제출내역이 없습니다.
                </template>
              </main-body-clazzes-body-form-empty-list>
            </div>
          </div>
          <div
            class="modal-close-btn modal-close-icon"
            @click="setClose"
          ></div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import {mapFields} from "vuex-map-fields";
import MainBodyClazzesBodyFormEmptyList from '@/apps/main/clazzes/form/MainBodyClazzesBodyFormEmptyList'

export default {
  name: "clazz-apply-list",
  components: {MainBodyClazzesBodyFormEmptyList},
  props: {
    classId: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    applyType: {
      type: String
    },
    totalElements: {
      type: Number,
      default() {
        return 0
      }
    }
  },
  data() {
    return {
      option: {
        isBusy: false,
      },

      m_height: 0,
      m_width: 0,

      query: null,
      resources: null,

    }
  },
  computed: {
    ...mapFields({
      clazzApplyList: 'clazzApplyList'
    }),
    ...mapGetters({
      getApplyTypeNameByCode: "getApplyTypeNameByCode",
      getApplyStatusNameByCode: "getApplyStatusNameByCode",
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
    clazzApplies() {
      return !this.isEmptyList
        ? this.resources._embedded['clazzApplies']
        : []
    },
  },
  created() {
    this.searchResource()
  },
  mounted() {
    const positionObj = this.$comn.getModalPosition(this.$refs.modal);
    this.m_height = 244 // positionObj.m_height;
    this.m_width = positionObj.m_width;

    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    setClose() {
      this.clazzApplyList.isOpen = false
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

    resetQuery(flag) {
      if (flag === undefined || flag === true) {
        // TODO: 페이징 처리 필요!
        this.query = {
          size: 1000,
          page: 0,
          sort: "applyTimestamp,desc",
          classId: this.classId,
          userId: this.userId,
          applyTypes: null
        };

        if (this.applyType)
          this.query.applyTypes = [ this.applyType ]

      }
    },

    resetTable(response) {
      this.resources = response.data;
    },

    searchResource(flag) {
      if (!this.option.isBusy) {
        this.option.isBusy = true

        this.resetQuery(flag)

        this.$hiClass.clazzApplies
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
      }
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

    onClickExcelDownload() {
      this.$hiClass.alert('TBD: 엑셀 다운로드')
    }

  },
}
</script>

<style scoped lang="scss">
.submit-list-modal {
  display: block;
 }
 .tbl-fixed-row{
  height: 401px;
 }

</style>