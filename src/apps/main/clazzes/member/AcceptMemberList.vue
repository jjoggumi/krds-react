<!--
@File(Method): AcceptMemberList.vue
@Date Created: 2025-01-09
@Description: 클래스 구성원 관리 > 구성원 목록
@Modified: #69560 클래스 구성원 관리 태그 추가 , 구성원관리에 선생님 목록 이동
-->
<template>
  <div class="member-list-wrap">
    <div class="list-wrap">
      <div class="top-wrap">
        <!-- 태그 선택 -->
        <HiSelectBox class="opt-default" :class="activeTags.length === 0 ? null : 'tag-selected'" :items="tagIdNameList" :value="activeTags" empty-title="학반(태그)">
          <template #btnType>
            학반(태그) <span class="txt-primary">{{ activeTags.length === 0 ? '' : `(${activeTags.length})` }}</span>
          </template>
          <template #custom-option>
            <div class="option-list type02">
              <HiButton color="link" @click="$emit('openTagEditor')">태그선택 <HiIcon name="ico-setting-fill" color="gray" size="18"/></HiButton>
              <ul>
                <li v-for="item in tagIdNameList" :key="item.value">
                  <input type="checkbox" :id="`check-${item.value}`" :value="item.value" v-model="activeTags"/>
                  <label :for="`check-${item.value}`">
                    <span>{{ item.title }}</span>
                  </label>
                </li>
                <li v-if="tagIdNameList.length === 0" class="hi-nodata sm">
                  <p>등록된 태그가 없습니다.</p>
                </li>
              </ul>
            </div>
          </template>
        </HiSelectBox>

        <!-- 이름, 태그 검색 -->
        <div class="search-box-wrap">
          <member-search-input :tags="clazzTags" :isAllowMulti="false" @search="searchMembers"/>
        </div>
      </div>

      <!-- 목록 -->
      <table class="tbl-col">
        <colgroup>
          <col style="width: 50px;">
          <col style="width: 310px;">
          <col style="width: auto;">
          <col style="width: 68px;">
          <col style="width: 50px;" v-if="curTab === 'TEACHER'">
        </colgroup>
        <thead>
        <tr>
          <th colspan="2" class="txt-left">
            <div class="check-all-wrap">
              <input
                  type="checkbox"
                  id="member-list-check-all"
                  class="check-all"
                  data-check-group="member-list-check-group"
                  ref="chkAll"
                  :checked="checkedMembers.length > 0 && isAllChecked"
                  :disabled="filteredClazzMembers.length === 0"
                  @change="clickMemberCheckboxAll"
              />
              <label for="member-list-check-all">
                <span>{{ $t('main.clazzes.member.button.selectAll') }}</span>
              </label>
            </div>
            <HiSelectBox
                v-if="curTab !== 'TEACHER'"
                class="opt-default"
                :value="selectedSort.value"
                :items="sorts"
                :empty-title="selectedSort.title || '번호순'"
                @update:value="selectSort($event)"
            />
          </th>
          <th :colspan="curTab === 'TEACHER'? 3 : 2"  class="txt-right">
            <template v-if="checkedMembers.length > 0">
              <!-- 학반(태그) 일괄 적용 -->
              <HiSelectBox class="tag-apply-bulk opt-default" selectBoxType="dropdown" empty-title="학반(태그) 일괄 적용" @clickOutside="applyBatchTagId = ''" :disableClose="isDimLoading">
                <template #btnType>
                  학반(태그) 일괄 적용
                </template>
                <template #custom-option>
                  <div class="option-list type02">
                    <div class="input-box-wrap">
                      <input type="text" placeholder="학반(태그) 입력" @input="searchTags" :value="applyBatchTagSearch">
                    </div>
                    <ul>
                      <li v-for="item in applyBatchTagList" :key="item.tagId">
                        <input
                            type="radio"
                            :id="`radio-${item.tagId}`"
                            :value="item.tagId"
                            v-model="applyBatchTagId"
                            @change="onTagSelect"
                        />
                        <label :for="`radio-${item.tagId}`">
                          <span>{{ item.tagName }}</span>
                        </label>
                      </li>
                      <li class="new-item" v-if="applyBatchTagList.length === 0 && applyBatchTagSearch">
                        <span v-if="!isValidTagName">등록 불가</span>
                        <HiButton v-else color="link" @click="createTag">'{{ applyBatchTagSearch }}' ( 새로만들기 )</HiButton>
                      </li>
                    </ul>
                    <div class="btns" v-if="applyBatchTagId">
                      <HiButton color="primary" size="sm" outline @click="batchAddMemberTag">추가</HiButton>
                      <HiButton color="primary" size="sm" @click="batchReplaceMemberTag">대체</HiButton>
                    </div>
                  </div>
                </template>
              </HiSelectBox>

              <!-- 탈퇴시키기  -->
              <HiButton
                  v-if="$hiClass.isClassActivated(clazzes)"
                  :disabled="isCheckedOneOwner"
                  color="warning"
                  size="md"
                  outline
                  class="btn-apply-bulk"
                  @click="batchUnsubscribe"
              >
                {{ curTab === 'TEACHER' ? '권한 해제' : $t('main.clazzes.member.button.unsubscribed') }}
              </HiButton>
            </template>
          </th>
        </tr>
        </thead>
        <tbody v-if="filteredClazzMembers.length > 0" class="member-list-check-group n">
          <accept-member-item
            v-for="(member, index) in filteredClazzMembers"
            :key="member.currentId"
            :member="member"
            :index="index"
            :curTab="curTab"
            :activeTags="activeTags"
            :clazzes="clazzes"
            :clazzMemberCount="clazzMembers.length"
            :isCurUserClassOwner="clazzes.classOwner.currentId === user.currentId"
            :checkedMembers="checkedMembers"
            @clickMemberCheckbox="clickMemberCheckbox"
            @deleteClazzMemberByIndex="$emit('deleteClazzMemberByIndex', index)"
            @confirmChangeTeacherRole="confirmChangeTeacherRole"
            @reloadMembers="$emit('reloadMembers')"
            @openMemberDetail="openMemberDetail"
        />
        </tbody>
      </table>
      <div v-if="filteredClazzMembers.length === 0" class="cont-empty-wrap-n">
        <p>태그가 적용된 구성원이 없습니다.</p>
      </div>
    </div>

    <change-teacher-role
        v-if="isShowChangeMemberRole && clazzMembers.length > 0"
        :clazzes="clazzes"
        :ownerMemberId="clazzMembers.find(member => member.role === 'OWNER').memberId || null"
        :teacherList="clazzMembers.filter(teacher => teacher.userId !== user.currentId)"
        @closeChangeMemberRole="isShowChangeMemberRole = false"
    />

    <member-detail-modal
        v-if="isOpenDetailModal"
        :memberId="detailModalMemberId"
        :classId="clazzes.currentId"
        @closeMemberDetail="closeMemberDetail"
        @reloadMembers="$emit('reloadMembers')"
        @updateClazzMember="updateClazzMember"
        @deleteClazzMember="deleteClazzMember"
    />
  </div>
</template>

<script>
import AcceptMemberItem from './AcceptMemberItem'
import ChangeTeacherRole from "@/apps/main/clazzes/member/modal/ChangeTeacherRole"
import {mapMutations, mapState} from "vuex";
import MemberDetailModal from "@/apps/main/clazzes/member/modal/MemberDetail";
import MemberSearchInput from "@/components/Search/MemberSearchInput";
import { useClassErrorManager } from "@/apps/main/clazzes/utils";
const errorManager = useClassErrorManager();

export default {
  name: 'accept-member-list',
  components: {
    MemberSearchInput,
    MemberDetailModal,
    AcceptMemberItem,
    ChangeTeacherRole
  },
  props: {
    clazzes: Object,
    clazzMembers: {
      type: Array
    },
    clazzMemberCount: {
      type: Object
    },
    curTab: {
      type: String
    },
    params: {
      type: Object
    },
    selectedSort: {
      type: Object
    }
  },
  data() {
    return {
      parentSortParamName: 'memberClassNumber',
      sorts: [
        { value: 'studentNo', title: '번호순' },
        { value: 'profileName', title: '이름순' },
      ],
      nameSearch: '',

      checkedMembers: [],

      // 태그 필터링
      activeTags: [],
      
      // 일괄 적용
      applyBatchTagId: '',
      applyBatchTagSearch: '',
      applyBatchTagList: [],

      // 선생님 권한 해제/변경
      isShowChangeMemberRole: false,

      detailModalMemberId: '',
      isOpenDetailModal: false,

      isValidTagName: true
    }
  },
  mounted() {
    this.applyBatchTagList = [...this.clazzTags]
  },
  computed: {
    ...mapState(['user', 'isDimLoading']),
    ...mapState('storeClazzTag', ['clazzTags']),
    clazzUrl() {
      return `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.clazzes.currentId}`
    },
    tagIdNameList() {
      return this.clazzTags.map(tag => ({ value: tag.tagId, title: tag.tagName }))
    },
    isAllChecked() {
      return this.filteredClazzMembers
          .map(m => m.memberId)
          .every(memberId => this.checkedMembers.map(m => m.memberId).includes(memberId))
    },
    filteredClazzMembers() {
      return this.clazzMembers.filter(member => {
        if (this.activeTags.length === 0) return true
        return member.tags.some(tag => this.activeTags.includes(tag.tagId))
      })
    },
    // 나는 개설자가 아니고 하나만 체크했는데 해당 멤버가 개설자일 경우
    isCheckedOneOwner() {
      return this.checkedMembers.length === 1 && this.checkedMembers[0].role === 'OWNER' && this.checkedMembers[0].userId !== this.user.currentId
    }
  },
  methods: {
    ...mapMutations('storeClazzTag', ['addClazzTags']),
    ...mapMutations(['setIsDimLoading']),
    clickMemberCheckboxAll(event) {
      if (event.target.checked) {
        const checkedMemberArr = [...this.checkedMembers, ...this.filteredClazzMembers]
        const checkedMemberSet = new Set(checkedMemberArr)
        this.checkedMembers = [...checkedMemberSet]
      } else {
        this.checkedMembers = this.checkedMembers.filter(member =>
            !this.filteredClazzMembers.map(m => m.memberId).includes(member.memberId)
        )
      }
    },
    clickMemberCheckbox({ member, isChecked }) {
      if (isChecked) {
        this.checkedMembers.push(member)
      } else {
        const idx = this.checkedMembers.findIndex(unCheckedMember => unCheckedMember.memberId === member.memberId)
        this.checkedMembers.splice(idx, 1)
      }
    },
    searchMembers({ searchType, searchValue }) {
      if (searchType === 'TAG') {
        this.params.tagId = searchValue
        this.params.keyword = ''
      } else {
        this.params.tagId = ''
        this.params.keyword = searchValue
      }
      this.$emit('reloadMembers')
    },
    searchTags(event) {
      this.applyBatchTagSearch = event.target.value.replaceAll(/[^0-9a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣\-_/&,.()]/g, '').substring(0, 10)
      this.applyBatchTagList = this.applyBatchTagSearch ?
          [...this.clazzTags.filter((item) => item.tagName.includes(this.applyBatchTagSearch))] :
          [...this.clazzTags]
      const regEx = /[ㄱ-ㅎㅏ-ㅣ]/g
      this.isValidTagName = !regEx.test(this.applyBatchTagSearch)
    },
    onTagSelect() {
      this.applyBatchTagSearch = ''
      this.applyBatchTagList = [...this.clazzTags]
    },
    openChangeMemberRoleModal() {
      this.isShowChangeMemberRole = true
    },
    openMemberDetail(memberId) {
      if (!memberId) return
      this.detailModalMemberId = memberId
      this.isOpenDetailModal = true
    },
    closeMemberDetail() {
      this.detailModalMemberId = ''
      this.isOpenDetailModal = false
    },
    selectSort(sortValue) {
      this.$emit('sortClazzMembers', this.sorts.find(sort => sort.value === sortValue))
    },
    async createTag() {
      try {
        this.setIsDimLoading(true)
        const res = await this.$axios.post(`/clazzes/${this.clazzes.currentId}/tags`, { tagName: this.applyBatchTagSearch })
        this.addClazzTags(res.data)
        this.applyBatchTagList =[...this.clazzTags]
        this.applyBatchTagId = res.data.tagId
        this.applyBatchTagSearch = ''
      } catch (err) {
        errorManager.showErrorMsg('CLASS_TAG', err)
      } finally {
        this.setIsDimLoading(false)
      }
    },
    async batchUnsubscribe() {
      this.curTab === 'TEACHER' ?
          await this.teacherUnsubscribe() :
          await this.memberUnsubscribe()
    },
    async teacherUnsubscribe() {
      let confirmMsg = '권한을 해제할 경우, 더 이상 클래스에 진입할 수 없습니다.<br>관리자 권한을 해제하시겠습니까?'
      const classOwner = this.checkedMembers.find(member => member.role === 'OWNER')

      if (classOwner && this.checkedMembers.length === 1) {
        await this.confirmChangeTeacherRole()
        return
      }

      if (classOwner) {
        confirmMsg += `<br>클래스 개설자를 제외한 관리자의 권한이 해제됩니다.`
      }

      try {
        await this.$hiClass.confirm(confirmMsg, 'warning', {
          confirmButtonText: '해제',
          reverseButtons: false
        })
      } catch (err) { return }

      try {
        if (classOwner) {
          this.checkedMembers = this.checkedMembers.filter(member => member.memberId !== classOwner.memberId)
        }

        await this.$axios.post(`/clazzes/${this.clazzes.currentId}/members/remove`, {
          memberIds: this.checkedMembers.map(member => member.memberId)
        })

        const memberUserIds = this.checkedMembers.map(member => member.userId)
        this.checkedMembers = []
        this.$emit('reloadMembers')

        // 내 구독정보를 삭제할 경우 메인화면으로 이동
        if (memberUserIds.includes(this.user.currentId)) {
          console.log(memberUserIds)
          await this.$router.push('/main', () => {})
        }
      } catch (err) {
        errorManager.showErrorMsg('MEMBER', err)
      }
    },
    async memberUnsubscribe() {
      const confirmMsg1 = '클래스에서 탈퇴하여도 활동 이력(게시글, 댓글) 은 삭제되지 않습니다.'
      const confirmMsg2 = '클래스에서 탈퇴시키겠습니까?'
      const studentConfirmMsg = '*임시학생계정은 계정이 삭제됩니다.'
      const targetName = this.checkedMembers[0].profileName
      const target = this.checkedMembers.length > 1 ?
          `${targetName} 외 ${this.checkedMembers.length - 1}명을 ` :
          `${targetName}님을 `

      let confirmMsg = `${confirmMsg1}<br>${target}${confirmMsg2}`
      if (this.curTab === 'STUDENT') confirmMsg += `<br>${studentConfirmMsg}`

      try {
        await this.$hiClass.confirm(confirmMsg, 'warning', {
          confirmButtonText: '확인',
          reverseButtons: false
        })
      } catch (err) { return }

      try {
        await this.$axios.post(`/clazzes/${this.clazzes.currentId}/members/remove`, {
          memberIds: this.checkedMembers.map(member => member.memberId)
        })
        this.checkedMembers = []
        this.$emit('reloadMembers')
      } catch (err) {
        errorManager.showErrorMsg('MEMBER', err)
      }
    },
    async confirmChangeTeacherRole() {
      let msg = '<strong>[위임 후 탈퇴 안내]</strong><br>'
          + '[탈퇴] 버튼을 누른 뒤,<br>위임 받을 관리자를 선택해야 탈퇴가 진행됩니다.'
          + '<br>탈퇴 후에는 내 클래스 목록에서 삭제되며, <br><strong>탈퇴한 클래스의 게시글과 하이톡 내역은 확인할 수 없습니다.</strong>'
          + '<br>위임 후에 탈퇴하시겠습니까?'

      try {
        await this.$hiClass.confirm(msg, 'warning', {
          confirmButtonText: '탈퇴',
          reverseButtons: false
        })
      } catch (err) { return }

      const teacherCount = await this.getClazzMemberCount()
      if (teacherCount > 1) {
        this.openChangeMemberRoleModal()
      } else {
        await this.$hiClass.alert('위임 가능한 클래스 관리자가 없습니다.<br>다시 확인해주세요.', 'warning')
        this.$emit('reloadMembers')
      }
    },
    async getClazzMemberCount() {
      try {
        let teacherCount = 0
        const res = await this.$axios.get(`/clazzes/${this.clazzes.currentId}/members/count`)
        if (res.data._embedded && res.data._embedded.counts.length > 0) {
          teacherCount = res.data._embedded.counts.find(count => count.userType === 'TEACHER').count
        }
        return teacherCount
      } catch (err) {
        errorManager.showErrorMsg('MEMBER', err)
        return 0
      }
    },
    async batchAddMemberTag() {
      const maxTagCountMembers = this.checkedMembers.filter(member => member.tags.length >= 10)
      if (maxTagCountMembers.length > 0) {
        try {
          await this.$hiClass.confirm('10개의 학반(태그)이 추가된 구성원이 있습니다.<br>해당 구성원을 제외 후 나머지 구성원에게 일괄 추가하시겠습니까?', null, {
            confirmButtonText: '확인',
            reverseButtons: false
          })
          this.checkedMembers = this.checkedMembers.filter(member => member.tags.length < 10)
        } catch (err) { return }
      }

      if (this.checkedMembers.length === 0) {
        this.checkedMembers = []
        this.applyBatchTagId = ''
        this.$hiClass.alert('학반(태그)은 최대 10개까지 선택 가능합니다.')
        return
      }

      try {
        this.setIsDimLoading(true)
        await this.$axios.post(`/clazzes/${this.clazzes.currentId}/members/tag/add`, {
          tagId: this.applyBatchTagId,
          memberIds: this.checkedMembers
              .filter(member => !member.tags.map(tag => tag.tagId).includes(this.applyBatchTagId))
              .map(member => member.memberId)
        })
        this.$emit('reloadMembers')
        this.checkedMembers = []
        this.applyBatchTagId = ''
      } catch (err) {
        const isRefresh = errorManager.showErrorMsg('CLASS_TAG', err)
        if (isRefresh) {
          this.$emit('reloadMembers')
          this.checkedMembers = []
          this.applyBatchTagId = ''
        }
      } finally {
        this.setIsDimLoading(false)
      }
    },
    async batchReplaceMemberTag() {
      try {
        this.setIsDimLoading(true)
        await this.$axios.post(`/clazzes/${this.clazzes.currentId}/members/tag/replace`, {
          tagId: this.applyBatchTagId,
          memberIds: this.checkedMembers.map(member => member.memberId)
        })
        this.$emit('reloadMembers')
        this.checkedMembers = []
        this.applyBatchTagId = ''
      } catch (err) {
        const isRefresh = errorManager.showErrorMsg('CLASS_TAG', err)
        if (isRefresh) {
          this.$emit('reloadMembers')
          this.checkedMembers = []
          this.applyBatchTagId = ''
        }
      } finally {
        this.setIsDimLoading(false)
      }
    },
    updateClazzMember(member) {
      const updateIdx = this.clazzMembers.findIndex(member => member.memberId === this.detailModalMemberId)
      this.$emit('updateClazzMemberByIndex', {member, index: updateIdx})
    },
    deleteClazzMember() {
      const deleteIdx = this.clazzMembers.findIndex(member => member.memberId === this.detailModalMemberId)
      this.$emit('deleteClazzMemberByIndex', deleteIdx)
    }
  },
  watch: {
    clazzTags: {
      handler() {
        this.applyBatchTagList = [...this.clazzTags]
      },
      deep: true
    }
  }
}
</script>
<style lang="scss" scoped>
.tag-selected{
  ::v-deep{
    .selected{
      border-color: #4267B2;
    }
  }
}
.search-box-wrap{
  padding-right:0 !important;
}

/* 학반(태그)일괄 적용 */
.tag-apply-bulk.hi-selectbox{
  display: inline-block;
  margin-right:10px;
  ::v-deep{
    .selected{
      border-radius: 50px;
      color: #fff;
      background: var(--primary);
      border: 1px solid var(--primary);
      font-size: 14px;
      min-height: 40px;
      &:hover{
        background: #265ed3;
        border-color: #265ed3;
        -webkit-transition: all 0.3s ease;
        transition: all 0.3s ease;
      }
    }
    .option__layer{
      width: 250px;
      max-height: none;
      left: auto;
      right: -8px;
      .option-list {
        .input-box-wrap{
          margin:12px 10px 6px;
        }
        ul{
          max-height: 200px;
          overflow-y: auto;
          li.new-item{
              padding:10px;
          }
          li .input-box-wrap input,
          li input[type=radio] + label span{font-size: 14px;font-weight: 400;}
        }
        .btns{
          padding: 6px 6px 16px 6px;
          text-align: center;
          display: flex;
          justify-content: center;
          gap: 8px;
          button{ width:70px;}
        }
      }
    }
  }
}
</style>