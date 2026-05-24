<!--
@File(Method): Main.vue
@Date Created: 2025-01-09
@Description: 클래스 구성원 관리
              구성원 관리 기존 컴포넌트(+하위 컴포넌트)는 삭제됨
              관련 커밋: #69560 구성원 관리 태그 추가 - 미사용 컴포넌트, 주석 삭제 (27792ab0)
@Modify: #69560 클래스 구성원 관리 태그 추가 , 구성원관리에 선생님 목록 이동
-->
<template>
  <div
      v-if="clazzes.currentId && isManager"
      class="school-class-cont-left-wrap w100"
  >
    <div class="page-sub-heading">
      <h3 class="heading">{{ title }}</h3>
      <div class="group-btn">
        <HiButton color="link" size="md" @click="isOpenTagEditor = true">
          <HiIcon name="ico-setting" color="default" size="24"/>학반(태그) 관리
        </HiButton>
      </div>
    </div>

    <HiTabs hi-tab size="xl" @setCurTab="setCurTab">
      <HiTab v-for="tab of tabs" :key="`member-tab-${tab.code}`" :label="getTabLabel(tab)" :curTab="tab.code" :onActive="curTab === tab.code">
        <div class="member-management-wrap">
          <teacher-add-info
              v-if="curTab === 'TEACHER' && isClassActivated"
              :classId="clazzes.currentId"
              @reloadMembers="reloadMembers"
          />
          <student-add-info
              v-if="curTab === 'STUDENT' && isClassActivated"
              :clazzes="clazzes"
              :isManager="isManager"
              @reloadMembers="reloadMembers"
          />

          <member-empty
              v-if="clazzMemberCount[tab.code] === 0 && clazzApplyMembers.length === 0 && isLoad"
              :clazzes="clazzes"
              :isManager="isManager"
              :curTab="curTab"
          />

          <div v-if="isLoad" class="member-management-common-cont">
            <!-- 클래스 가입요청 -->
            <apply-member-list
                v-if="clazzApplyMembers.length > 0 && $hiClass.isClassActivated(clazzes)"
                :clazzes="clazzes"
                :clazzApplyMembers="clazzApplyMembers"
                @addClazzMembersByIndex="addClazzMembersByIndex"
                @deleteClazzApplyMemberByIndex="deleteClazzApplyMemberByIndex"
                @reloadMembers="reloadMembers"
            />

            <!-- 구성원 목록 -->
            <accept-member-list
                v-if="clazzMemberCount[tab.code] > 0"
                :clazzes="clazzes"
                :clazzMembers="clazzMembers"
                :clazzMemberCount="clazzMemberCount"
                :curTab="curTab"
                :params="params"
                :selectedSort="selectedSort"
                @openTagEditor="isOpenTagEditor = true"
                @updateClazzMemberByIndex="updateClazzMemberByIndex"
                @deleteClazzMemberByIndex="deleteClazzMemberByIndex"
                @reloadMembers="reloadMembers"
                @sortClazzMembers="sortClazzMembers"
            />
          </div>
        </div>
      </HiTab>
    </HiTabs>

    <class-tag-editor v-if="isOpenTagEditor" :classId="clazzes.currentId" @closeClassTagEditor="closeClassTagEditor"/>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import ApplyMemberList from "@/apps/main/clazzes/member/ApplyMemberList";
import AcceptMemberList from "@/apps/main/clazzes/member/AcceptMemberList";
import MemberEmpty from "@/apps/main/clazzes/member/Empty";
import TeacherAddInfo from "@/apps/main/clazzes/member/TeacherAddInfo";
import StudentAddInfo from "@/apps/main/clazzes/member/StudentAddInfo";
import ClassTagEditor from "@/components/Modal/ClassTagEditor";

export default {
  name: 'clazzes-member',
  props: {
    clazzes: {
      type: Object,
      required: true
    },
    isManager: {
      type: Boolean
    },
    isClassActivated: {
      type: Boolean
    }
  },
  data() {
    return {
      isLoad: false,
      curTab: '',
      title: '구성원 관리',
      tabs: [
        { code: 'TEACHER', name: '선생님' },
        { code: 'PARENTS', name: '학부모' },
        { code: 'STUDENT', name: '학생' },
      ],
      isOpenTagEditor: false,
      clazzMemberCount: {
        PARENTS: 0,
        TEACHER: 0,
        STUDENT: 0
      },
      clazzMembers: [],
      clazzApplyMembers: [],
      params: {
        size: 1000,
        keyword: '',
        tagId: ''
      },
      selectedSort: { value: 'studentNo', title: '번호순' }
    }
  },
  components: {
    ApplyMemberList,
    AcceptMemberList,
    MemberEmpty,
    TeacherAddInfo,
    StudentAddInfo,
    ClassTagEditor
  },
  computed: {
    ...mapState('storeClazzTag', [
      'clazzTags'
    ])
  },
  watch: {
    isManager(val) {
      if (val === false) {
        this.$router.push('/main')
      }
    },
    '$route.query' : function(v) {
      if (v.classUserType === "PARENTS") {
        this.curTab = 'PARENTS'
      } else {
        this.curTab = 'STUDENT'
      }
    }
  },
  beforeMount() {
    this.checkClassMenuEntryPermission({
      isManager: this.isManager
    })
  },
  async mounted() {
    if (this.$route.query.classUserType) {
      await this.setCurTab({ curTabName: this.$route.query.classUserType })
    } else {
      await this.setCurTab({ curTabName: 'TEACHER' })
    }
    await this.fetchTags(this.clazzes.currentId)
  },
  methods: {
    ...mapActions('storeBoard', ['checkClassMenuEntryPermission']),
    ...mapActions('storeClazzTag', ['fetchTags']),
    async setCurTab({ curTabName }) {
      this.isLoad = false
      this.curTab = curTabName

      this.params = {
        size: 1000,
        keyword: '',
        tagId: ''
      }

      try {
        this.selectedSort = { value: 'studentNo', title: '번호순' }
        await this.getClazzMemberCount()
        const callCount = await this.getApiCallCount()
        this.clazzMembers = await this.getClazzMembers(false, callCount)
        this.clazzApplyMembers = await this.getClazzMembers(true, 1)
        this.isLoad = true
      } catch (err) {
        errorManager.showErrorMsg('MEMBER', err)
      }
    },
    async getApiCallCount() {
      let allMemberCount = this.clazzMemberCount[this.curTab]
      return Math.ceil(allMemberCount / this.params.size)
    },
    async getClazzMemberCount() {
      const res = await this.$axios.get(`/clazzes/${this.clazzes.currentId}/members/count`)
      let count = {}
      res.data._embedded.counts.forEach(c => {
        count[c.userType] = c.count
      })
      for (let userType of Object.keys(this.clazzMemberCount)) {
        this.clazzMemberCount[userType] = count[userType] ? count[userType] : 0
      }
    },
    async getClazzMembers(isApply, apiCallCount) {
      let members = []
      let params = {
        size: this.params.size
      }

      if (isApply) params.status = 'apply'

      if (this.params.keyword.trim() !== '') {
        params.keyword = this.params.keyword
      } else if (this.params.tagId !== '') {
        params.tagId = this.params.tagId
      }

      for (let page = 0; page < apiCallCount; page++) {
        params.page = page
        const res = await this.$axios.get(`/clazzes/${this.clazzes.currentId}/members/${this.curTab.toLowerCase()}`, { params })
        if (res.data._embedded && res.data._embedded.clazzMembers.length > 0) {
          members.push(...res.data._embedded.clazzMembers)
        }
      }

      return this.curTab === 'TEACHER' ? members : this.doSort(members)
    },
    addClazzMembersByIndex(member) {
      this.clazzMembers.push(member)
      this.clazzMemberCount[this.curTab]++
    },
    updateClazzMemberByIndex({member, index}) {
      if (index < 0) return
      this.clazzMembers.splice(index, 1, member)
    },
    deleteClazzMemberByIndex(index) {
      if (index < 0) return
      this.clazzMembers.splice(index, 1)
      const count = this.clazzMemberCount[this.curTab]
      this.clazzMemberCount[this.curTab] = count - 1 > -1 ? count - 1 : 0
    },
    deleteClazzApplyMemberByIndex(index) {
      if (index < 0) return
      this.clazzApplyMembers.splice(index, 1)
    },
    getTabLabel(tab) {
      const count = this.clazzMemberCount[tab.code].toString()
      return `${tab.name} (${count})`
    },
    closeClassTagEditor(oldTagNames) {
      this.isOpenTagEditor = false
      const newTagNames = this.clazzTags.map(t => t.tagName).join('')
      if (oldTagNames !== newTagNames) {
        this.reloadMembers()
      }
    },
    async reloadMembers() {
      try {
        await this.getClazzMemberCount()
        const callCount = await this.getApiCallCount()
        this.clazzMembers = await this.getClazzMembers(false, callCount)
      } catch (err) {
        errorManager.showErrorMsg('MEMBER', err)
      }
    },
    sortClazzMembers(sort) {
      this.selectedSort = sort
      this.clazzMembers = this.doSort(this.clazzMembers)
    },
    doSort(members) {
      if (this.selectedSort.value === 'studentNo') {
        return _.orderBy(members, ['studentNo', 'studentName'], ['asc', 'asc'])
      } else {
        return _.orderBy(members, ['studentName'], ['asc'])
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.group-btn button{
  font-size:16px;
  font-weight:500 !important;
  color: #616161;
  padding-right:0 !important;
}
</style>