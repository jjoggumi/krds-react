<template>
<div class='member-picker'>
  <!-- 좌측 영역 -->
  <div class="left-section">
    <!-- 멤버 리스트 -->
    <div class="select-target-wrap box-border" :class="{ borderless }">
      <!-- 검색 영역 -->
      <MemberSearch :clazzTags="clazzTags" @search="search"/>
      <div class="group-checkbox-wrap" :class="{disapeared: !fixCheckerArea && memberSearchItem.searchType !== 'NONE'}">
        <div class="group-checkbox">
          <select-all-checker :disabled='counts.ALL === 0' :isAllSelected="isAllUserSelected" :beforeChange="() => beforeChangeSelectAll('ALL')" @input="({value}) => onChangeAllChecker('ALL', value)"><span>전체</span></select-all-checker>
          <slot name="group-checkbox-prefix" :members="members"></slot>
          <select-all-checker v-for="[type, label] in [['TEACHER', '선생님'], ['PARENTS', '학부모'], ['STUDENT', '학생']].filter(([t]) => selectAllFlags[t])"
            :key="type" :disabled="counts[type] === 0" :isAllSelected="() => isAllUserTypeSelected(type)"
            :beforeChange="() => beforeChangeSelectAll(type)"
            @input="({value}) => onChangeAllChecker(type, value)">
            <span>{{ label }}</span>
          </select-all-checker>
        </div>
        <p v-if='showCounts' class="count"><span class="ft-blue">{{ value.length }}</span> / {{ members.length }} 명 </p>
      </div>
      <infinite-scroll-container v-if="members.length !== 0" class="profile-list" @scroll-bottom="loadMore">
        <selectable-item v-for="u in members"
          :key="u.userId" :user="u"
          v-model="u.selected"
          @input="b => onClickSelectableItem(u, b)"
          :disabled="disableUsers.some(d => d.userId === u.userId)"
          :blocked="blockedIds.includes(u.userId)"
          :class="customMemberClass(u)"
          :showStudentNo="showStudentNo"
          :showStudentProfileName="showStudentProfileName"
          >
          <template v-slot:right>
            <slot name="postItem" :user="u"></slot>
          </template>
        </selectable-item>
      </infinite-scroll-container>
      <div v-else class="hi-nodata" >
        <p>
          검색 결과가 없습니다.
        </p>                
      </div>
    </div>
  </div>

  <!-- 우측 영역 -->
  <div class="right-section" v-if="showSelected">
    <div class="selected-wrap">
      <div class="selected-header">
        <h3>선택 목록 ({{selectedMembers.length}}명)</h3>
        <HiButton color="primary" size="sm" outline @click="clearAllSelected" :disabled="selectedMembers.length === 0">전체 삭제</HiButton>
      </div>
      <div class="selected-list">
        <div v-for="user in selectedMembers" :key="user.userId" class="selected-item">                
          <item :user="user"/>
          <HiButton color="link" @click="removeMember(user)">
            <HiIcon name="ico-close-circle-fill" color="gray" size="24"></HiIcon>
          </HiButton>
        </div>
        <div class="hi-nodata" v-if="selectedMembers.length === 0">
          <p>
            선택된 구성원이 없습니다.<br>읽기 권한을 부여할 구성원을 선택해주세요.
          </p>                
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { SelectableItem, Item, SelectAllChecker } from '@/components/Profile/List';
import { Container as InfiniteScrollContainer } from '@/components/InfiniteScroll';
import MemberSearch from "@/components/Search/MemberSearch";

export default {
  components: {MemberSearch, SelectableItem, Item, SelectAllChecker, InfiniteScrollContainer },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    classId: {
      type: String,
      default: ''
    },
    excludeMe: {
      type: Boolean,
      default: false
    },
    showSelected: {
      type: Boolean,
      default: true
    },
    borderless: {
      type: Boolean,
      default: false
    },
    selectAllFlags: {
      type: Object,
      default: () => ({
        TEACHER: true,
        PARENTS: true,
        STUDENT: true
      })
    },
    typeOrder: {
      type: String,
      default: 'TEACHER,STUDENT,PARENTS'
    },
    showCounts: {
      type: Boolean,
      default: false
    },
    disableUsers: {
      type: Array,
      default: () => []
    },
    blockedIds: {
      type: Array,
      default: () => []
    },
    customMemberClass: {
      type: Function,
      default: () => ({})
    },
    fixCheckerArea: {
      type: Boolean,
      default: false
    },
    sortBy: {
      type: String,
      default: 'studentNo'
    },
    showStudentNo: {
      type: Boolean,
      default: true
    },
    showStudentProfileName: {
      type: Boolean,
      default: true
    },
    onBeforeCheckEach: {
      type: Function,
      default: () => () => true
    },
    onBeforeCheckAll: {
      type: Function,
      default: () => () => true
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.syncModelValues()
      }
    }
  },
  data: () => ({
    members: [],
    fullMembers: [],
    selectedMembers: [],
    page: 0,
    counts: {
      TEACHER: 0,
      STUDENT: 0,
      PARENTS: 0,
      ALL: 0
    },
    isAllLoad: false,
    memberSearchItem: {
      searchType: 'NONE',
      searchValue: ''
    },
    ready: false
  }),
  computed: {
    ...mapState('storeClazzes', ['clazzes']),
    ...mapState('storeClazzTag', ['clazzTags']),
    teachers: {
      get() { return this.typedMembers('TEACHER') },
      set(v) { this.setSelectedForAllTypedMembers('TEACHER', (v[0] || {}).selected) }
    },
    students: {
      get() { return this.typedMembers('STUDENT') },
      set(v) { this.setSelectedForAllTypedMembers('STUDENT', (v[0] || {}).selected) }
    },
    parents: {
      get() { return this.typedMembers('PARENTS') },
      set(v) { this.setSelectedForAllTypedMembers('PARENTS', (v[0] || {}).selected) }
    },
    currentClassId() {
      return this.classId || this.clazzes.currentId
    },
    selectedMembersAmongFiltered() {
      return this.members.filter(u => u.selected === true)
    },
    isFiltered() {
      return this.fullMembers.length !== this.members.length
    },
    isEmpty() {
      return this.members.length === 0
    },
    isDisabled() {
      return (type) => {
        return this.isEmpty || this.counts[type] === 0 ||
          (this.isFiltered && this.typedMembers(type, this.members).length === 0)
      }
    }
  },
  mounted () {
    this.initialize(false)
  },
  methods: {
    ...mapActions(['existsClassManagerByClassId']),
    ...mapActions('storeClazzTag', ['fetchTags', 'resetClazzTagState']),
    async initialize(flagInitSelectedMember = true) {
      this.members = []
      if (flagInitSelectedMember) this.selectedMembers = []
      this.page = 0
      this.isAllLoad = false
      this.memberSearchItem = { searchType: 'NONE', searchValue: '' }

      await this.loadClazzMembers()
      this.fullMembers = [...this.members]
      await this.loadMembersCount()
      this.resetClazzTagState()
      this.fetchTags(this.currentClassId)
      this.ready = true
    },
    async loadClazzMembers(page = 0) {
      if (page === 0) this.isAllLoad = false
      const params = this.getSearchParams(page)
      const { data: {_embedded: { clazzMembers }, page: { totalElements }}} =
          await this.$axios.get(`/clazzes/${this.currentClassId}/members`, { params })
      this.members = this.sortMembers(this.members
          .concat(clazzMembers.filter(u => !this.members.some(v => v.userId === u.userId) && (!this.excludeMe || u.userId !== localStorage.uuid)).map(u => ({...u, selected: false})))
          .map(u => {
            u.selected = this.selectedMembers.some(s => s.userId === u.userId)
            return u
          }))
      this.isAllLoad = this.members.length >= (totalElements || 0)
      return clazzMembers.length
    },
    async loadAllTypedMembers(type) {
      const pages = []
      while (pages.reduce((s, p) => s + p.length, 0) < this.counts[type]) {
        const page = pages.length
        const { data: {_embedded: { clazzMembers }}} =
            await this.$axios.get(`/clazzes/${this.currentClassId}/members${type === 'ALL' ? '' : `/${type.toLowerCase()}`}`, { params: { page } })
        pages.push(clazzMembers)
      }
      return pages.flat()
    },
    async loadMembersCount() {
      Object.keys(this.counts).forEach(k => this.counts[k] = 0)
      const { data: {_embedded: { counts} } } = await this.$axios.get(`/clazzes/${this.currentClassId}/members/count`)
      counts.forEach(c => {
        this.counts[c.userType] = c.count - this.disableUsers.filter(d => (this.fullMembers.find(m => m.userId === d.userId) || {}).userType === c.userType).length;
        this.counts.ALL += this.counts[c.userType]
      })
      if (this.excludeMe) {
        this.counts.ALL -= 1
        this.counts.TEACHER -= 1
      }
      return this.counts
    },
    syncModelValues() {
      this.selectedMembers = [...this.value]
    },
    clearAllSelected() {
      this.members.forEach(u => u.selected = false)
      this.selectedMembers = []
      this.emitInput();
    },
    typedMembers(type, members = this.selectedMembers) {
      return members.filter(u => type === 'ALL' || u.userType === type)
    },
    async onClickSelectableItem(user, selected) {
      if (selected && (await this.onBeforeCheckEach(user))) {
        this.addMember(user)
      } else {
        this.removeMember(user)
      }
    },
    updateSelected(user, flag) {
      const found = this.members.find(u => u.userId === user.userId)
      if (found) {
        found.selected = flag
      }
    },
    sortMembers(members = this.selectedMembers) {
      const sortStudent = (a, b) => {
        return {
          studentNo: (a, b) => (a.studentNo || 0) === (b.studentNo || 0)
            ? sortByStudentNames(a, b) : (a.studentNo || 0) - (b.studentNo || 0),
          studentName: sortByStudentNames,
          profileName: sortByProfileNames
        }[this.sortBy](a, b)
      }
      const getSortByNameFunc = getName => (a, b) => {
        const getType = name =>
           ([/[0-9]/, /[a-zA-Z]/, /[\u3131-\uD79D]/].map((re, i) => [re, i]).find(([re]) => re.test((name || '')[0])) || [null, 3])[1];
        const [ nameA, nameB ] = [a, b].map(getName);
        if (!nameA || !nameB) return 0;
        const [ typeA, typeB ] = [nameA, nameB].map(getType);
        return typeA != typeB ? typeA - typeB : nameA.localeCompare(nameB, 'ko');
      };
      const sortByStudentNames = getSortByNameFunc(u => u.studentName)
      const sortByProfileNames = getSortByNameFunc(u => u.profileName)

      const typedMembersMap = {
        TEACHER: this.typedMembers('TEACHER', members).sort(sortByProfileNames),
        STUDENT: this.typedMembers('STUDENT', members).sort(sortStudent),
        PARENTS: this.typedMembers('PARENTS', members).sort(sortStudent)
      }
      return this.typeOrder.split(',').reduce((sorted, type) => {
        if (typedMembersMap[type]) {
          sorted.push(...typedMembersMap[type])
        }
        return sorted
      }, [])
    },
    addMember(user, emit = true) {
      if (this.selectedMembers.some(u => u.userId === user.userId)) return
      this.selectedMembers.push(user)
      this.sortMembers()
      this.updateSelected(user, true)
      if (emit) this.emitInput()
    },
    removeMember(user, emit = true) {
      this.selectedMembers = this.selectedMembers.filter(u => u.userId !== user.userId)
      this.updateSelected(user, false)
      if (emit) this.emitInput()
    },
    setSelectedForAllTypedMembers(type, value) {
      this.typedMembers(type).forEach(u => value ? this.addMember(u, false) : this.removeMember(u, false))
      this.emitInput()
    },
    async getFilteredTypedMembers(type) {
        return (await this.loadAllTypedMembers(type))
          .filter(u => !this.excludeMe || u.userId !== localStorage.uuid)
          .filter(u => !this.disableUsers.some(d => d.userId === u.userId))
    },
    async beforeChangeSelectAll(type) {
      return await this.onBeforeCheckAll(await this.getFilteredTypedMembers(type))
    },
    async onChangeAllChecker(type, value) {
      if (value) {
        await this.addAllTypedMembersByFilter(type)
      } else {
        this.typedMembers(type, this.members).forEach(u => this.removeMember(u, false))
      }
      this.emitInput()
    },
    async getAllTypedMembers(type) {
      return this.isFiltered ? this.typedMembers(type, this.members) : await this.loadAllTypedMembers(type)
    },
    async addAllTypedMembersByFilter(type, filter = null) {
      (await this.getAllTypedMembers(type)).filter(u => !this.excludeMe || u.userId !== localStorage.uuid)
        .filter(u => !this.disableUsers.some(d => d.userId === u.userId))
        .filter(filter || (() => true))
        .forEach(u => this.addMember(u, filter != null))
    },
    async removeAllTypedMembersByFilter(type, filter = null) {
      (await this.getAllTypedMembers(type)).filter(u => !this.excludeMe || u.userId !== localStorage.uuid)
        .filter(u => !this.disableUsers.some(d => d.userId === u.userId))
        .filter(filter || (() => true))
        .forEach(u => this.removeMember(u, filter != null))
    },
    async search({ searchType, searchValue }) {
      this.memberSearchItem = { searchType, searchValue }
      this.page = 0
      this.members = []
      await this.loadClazzMembers()
    },
    getSearchParams(page) {
      const params = { page }
      if (['TAG', 'TAG_MULTI'].includes(this.memberSearchItem.searchType)) {
        params.tagId = this.memberSearchItem.searchValue
      } else if (this.memberSearchItem.searchType === 'KEYWORD') {
        params.keyword = this.memberSearchItem.searchValue
      }
      return params
    },
    emitInput() {
      this.$emit('input', this.selectedMembers)
    },
    async loadMore () {
      if (this.isAllLoad) return
      if (this.page < 0) return
      this.page++
      const count = await this.loadClazzMembers(this.page)
      if (count === 0) {
        this.page = -1
      }
    },
    isAllUserSelected() {
      return this.members.length > 0 && 
        ((!this.isFiltered && this.selectedMembers.length === this.counts.ALL)
        || (this.isFiltered && this.selectedMembersAmongFiltered.length === this.members.length))
    },
    isAllUserTypeSelected(type) {
      return this.members.length > 0 && 
        ((!this.isFiltered && this.typedMembers(type).length === this.counts[type])
          || (this.isFiltered && this.typedMembers(type, this.members).length > 0 &&
                this.typedMembers(type, this.members).filter(u => !(u.selected || false)).length === 0))
    }
  }
}
</script>

<style lang="scss" scoped>
.member-picker {
  display: flex;
  gap: 20px;
  height: 476px;
  margin-top: 6px;

  .left-section, .right-section {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .left-section{
    min-width:380px;
    .select-target-wrap{
      height: 100%;
      .group-checkbox-wrap {
        position: relative;
        height: 51px;
        min-height: 51px;
        overflow: hidden;
        transition: 0.5s ease-in-out;

        &.disapeared {
          height: 0px;
          min-height: 0px;
          transition:0.5s ease-in-out;
        }
      }
      p.count {
        position: absolute;
        right: 0;
        bottom: 0;
        margin: 15px;
        font-size: 14px;
        line-height: 1.5;
        color: #999999;
      }
      .profile-list{
        overflow: auto;
        height: 100%;
        flex-grow: 1;
      }
    }
  }
  .right-section{    
    min-width:320px;
    .profile-list-item{
      width: calc(100% - 35px);
    }
  }
  .hi-nodata{
    padding: 100px 0;
  }

  .box-border.borderless {
    border: none !important
  }
}
</style>