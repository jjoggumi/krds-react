<!--
@File(Method): MainBodyClazzesBodyFormApplyStudentList.vue
@Description: 클래스 > 수업관리 > 학교양식 신청서 > 학생별 현황 탭
@Modified: 2025-03-19 - #73113 [학교양식태그] 학교양식신청서 화면별 검색 아이콘 및 검색바 너비 수정
-->
<template>
  <fragment>
    <!-- #71977 학교양식신청서 및 설문 > 학반(태그) 추가 - 위치 이동 -->
    <p class="text w100 mb-10"><span class="ft-blue">유형별 신청건수</span>를 클릭하시면 상세 제출내역을 확인하실 수 있습니다.</p>
    <div class="middle-wrap">
      <div class="checkbox-wrap">
        <template
          v-for="(item, index) of option.checkbox.userTypes"
        >
          <input
            type="checkbox"
            :key="`ck-input-${item.code}-${index}`"
            :id="`ck-${item.code}-${index}`"
            v-model="option.checkbox.userTypes[index].value"
            @change="onChangeCheckbox('userTypes')"
          />
          <label
            :for="`ck-${item.code}-${index}`"
            :key="`ck-label-${item.code}-${index}`"
          >
            <span>{{ item.name }}</span>
          </label>
        </template>
      </div>
      <!-- #71977 학교양식신청서 및 설문 > 학반(태그) 추가 -->
      <MemberSearch :clazzTags="clazzTags" @search="search" class="type01"/>
    </div>
      <table
          class="tbl-col"
          id="tableSort"
          v-infinite-scroll="searchResource"
          :infinite-scroll-disabled="isAllLoad"
          :infinite-scroll-distance="400"
      >
      <colgroup>
        <col style="width: 50px">
        <col style="width: 200px;">
        <col style="width: auto;">
        <col style="width: 100px;">
        <col style="width: 100px;">
        <col style="width: 100px;">
        <col style="width: 100px;">
      </colgroup>
      <thead>
      <tr>
        <th>번호</th>
        <th>신청학생</th>
        <th>제출자</th>
        <th>결석사유서</th>
        <th>체험활동신청서</th>
        <th>투약의뢰서</th>
        <th>동의서</th>
        <th>기타</th>
      </tr>
      </thead>
      <tbody>
        <tr
          v-for="(resource, index) of clazzApplyStudents"
          :key="`${resource.userId}-${index}`"
      >
        <td><p class="skew">{{ index + 1 }}</p></td>
        <td><p class="skew">{{ resource.memberChildName ? resource.memberChildName : '-' }}</p></td>
        <td>
          <p class="skew">{{ getParentName(resource) }}</p>
          <p v-if="resource.tags" class="desc txt-center">{{ resource.tags.map(t => t.tagName).join(', ') }}</p> <!-- #71977 학교양식신청서 및 설문 > 학반(태그) 추가 -->
        </td>
        <td
            v-for="applyCountType of option.applyCountTypes"
            :key="applyCountType.code"
        >
          <button
              class="btn-num"
              @click="openClazzApplyListModal(resource, applyCountType.code, (resource[applyCountType.countFieldName] || 0))"
          >
            {{ resource[applyCountType.countFieldName] || 0 }}건
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- 신청내역 없음 -->
    <main-body-clazzes-body-form-empty-list
      v-if="isEmptyList"
    />

  </fragment>
</template>

<script>
import MainBodyClazzesBodyFormEmptyList from "@/apps/main/clazzes/form/MainBodyClazzesBodyFormEmptyList";
import {mapFields} from "vuex-map-fields";
import {mapGetters, mapState} from "vuex";
import MemberSearch from "@/components/Search/MemberSearch";

export default {
  name: "main-body-clazzes-body-form-apply-student-list",
  components: {MainBodyClazzesBodyFormEmptyList,MemberSearch},
  props: {
    clazz: {
      type: Object,
      require: true
    },
  },
  data() {
    return {
      option: {
        isBusy: false,
        applyCountTypes: [
          {
            code: 'ABSENT',
            countFieldName: 'applyCountAbsent',
          },
          {
            code: 'FIELD_STUDY',
            countFieldName: 'applyCountFieldStudy',
          },
          {
            code: 'MEDICATION_ORDER',
            countFieldName: 'applyCountMedicationOrder',
          },
          {
            code: 'CONSENT',
            countFieldName: 'applyCountConsent',
          },
          {
            code: 'ETC',
            countFieldName: 'applyCountEtc',
          },
        ],
        checkbox: {
          userTypes: [
            {
              code: 'PARENTS',
              name: '학부모',
              value: true
            },
            {
              code: 'STUDENT',
              name: '학생',
              value: true
            },
            {
              code: 'TEACHER',
              name: '선생님',
              value: true
            },
          ],
        },
      },
      query: null,
      clazzApplyStudents: [],
      memberSearchItem: {
        searchType: 'NONE',
        searchValue: ''
      },
      isAllLoad: false
    }
  },
  computed: {
    ...mapFields(['clazzApplyList']),
    ...mapGetters(['getUserTypeNameByCode']),
    ...mapState('storeClazzTag', ['clazzTags']),
    isEmptyList() {
      return this.clazzApplyStudents.length === 0
    }
  },
  watch: {
    'option.isBusy'(val) {
      this.$store.commit('setIsLoading', val)
    }
  },
  created() {
    this.resetQuery(true)
  },
  methods: {
    resetQuery(flag) {
      if (flag === undefined || flag === true) {
        this.query = {
          size: 20,
          page: 0,
          sort: 'memberChildName,asc',
          classId: this.clazz.currentId,
        };
      }

      this.query.userTypes = []
      for (const item of this.option.checkbox.userTypes) {
        item.value ? this.query.userTypes.push(item.code) : false
      }

      if (this.memberSearchItem.searchType === 'KEYWORD') {
        this.query.name = this.memberSearchItem.searchValue
      } else if (['TAG', 'TAG_MULTI'].includes(this.memberSearchItem.searchType)) {
        this.query.tagId = this.memberSearchItem.searchValue
      } else {
        this.query.tagId = []
        this.query.name = null
      }

      this.isAllLoad = false
    },

    search({ searchType, searchValue }) {
      this.memberSearchItem = { searchType, searchValue }
      this.clazzApplyStudents = []
      this.resetQuery(true)
      this.searchResource()
    },

    async searchResource() {
      if (this.isAllLoad) return
      if (this.option.isBusy) return

      try {
        this.option.isBusy = true
        const res = await this.$hiClass.clazzApplyStudents.search(this.query)
        this.query.page = this.query.page + 1
        if (res.data._embedded && res.data._embedded.clazzApplyStudents.length > 0) {
          this.clazzApplyStudents.push(...res.data._embedded.clazzApplyStudents)
        }
        if (this.query.page >= res.data.page.totalPages) {
          this.isAllLoad = true
        }
      } catch (e) {
        this.$hiClass.alertError(e)
      } finally {
        this.option.isBusy = false
      }
    },

    openClazzApplyListModal(resource, applyType, totalElements) {
      this.clazzApplyList.classId = resource.classId
      this.clazzApplyList.userId = resource.userId
      this.clazzApplyList.applyType = applyType
      this.clazzApplyList.totalElements = totalElements || 0
      this.clazzApplyList.isOpen = true
    },

    onChangeCheckbox(elName) {
      this.clazzApplyStudents = []
      if (this.option.checkbox.userTypes.every(item => !item.value)) return
      this.resetQuery(true)
      this.searchResource()
    },

    getParentName(resource) {
      let parentName = resource.parentName

      try {
        const parentNameSuffix = this.getUserTypeNameByCode({ code: resource.userType })
        if (!parentName) {
          parentName = `${resource.userName} ${parentNameSuffix}`
        }

      } catch (e) {
        this.$log.error(e)
      }

      return parentName
    }
  }
}
</script>

<style scoped>
.member-search{width:290px;}
</style>