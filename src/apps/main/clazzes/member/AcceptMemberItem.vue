<!--
@File(Method): AcceptMemberItem.vue
@Date Created: 2025-01-09
@Description: 클래스 구성원 관리 > 구성원 목록 > 구성원
@Modified: 2025-03-05 - #72684 프로필 이미지 아바타(HiAvatar) 구축 및 적용
-->
<template>
  <tr>
    <td>
      <input
          type="checkbox"
          :checked="checkedMembers.findIndex(checkedMember => checkedMember.memberId === member.memberId) > -1"
          :id="`member-list-check-${index}`"
          @change="clickMemberCheckbox"
      />
      <label :for="`member-list-check-${index}`"></label>
    </td>
    <td class="txt-left">
      <div class="profile-wrap" >
        <HiAvatar    
          outline
          :img="profilePhotoSrc ? profilePhotoSrc : null"
        >                
          <template v-slot:badge>
            <i class="badge new" v-if="isNewMember"></i>
          </template>   
        </HiAvatar>
        <!-- #72684 프로필 이미지 아바타(HiAvatar) 적용 전
        <div
            class="profile-img-wrap"
            :class="{new: isNewMember}"
            :style="userPhotoStyleObj"
        >
          <p class="profile-img-wrap__img">
            <img :src="profilePhotoSrc" @error="e => e.target.src = '/files/img/profile_default.png'" alt=""/>
          </p>
        </div> 
        -->
        <div class="input-box-wrap" v-if="member.role === 'MEMBER'">
          <input
              class="pr-05 pl-05 txt-center"
              type="text"
              name="반번호"
              placeholder="반번호"
              v-model="member.studentNo"
              @input="replaceStudentNo($event.target.value)"
              @blur="editStudentNo"
          >
        </div>
        <span v-if="member.role === 'OWNER'" class="owner">개설자</span>
        <div class="profile-name-wrap" @click="openMemberDetail">
          <div class="name">            
            {{ curTab === 'TEACHER' ? member.profileName : member.studentName }}
            <span>{{ userTypeName }}</span>
          </div>
        </div>
      </div>
    </td>
    <td>
      <HiTagSelect
          :index="index"
          :tags="clazzTags"
          :activeTags="activeTags"
          :selectedTags="member.tags"
          :placeholder="member.tags.length === 0 ? '학반(태그)를 선택해주세요. (1-1, 1-2...햇님반)' : ''"
          @add:tags="addTag($event)"
          @remove:tags="removeTag($event)"
          @create-tag="createTag"
          @click.stop
      />
    </td>
    <td>
      <div class="btn-wrap n" v-if="user.currentId !== member.userId">
        <HiButton color="default" size="md" outline  @click="openHitalk" :disabled="clazzes.classStatus !== 'ACTIVATE'">
          <HiIcon name="ico-hitalk-thin" size="20"/>
        </HiButton>
      </div>
    </td>
    <td v-if="curTab === 'TEACHER'">      
      <div v-if="isShowKebab">
        <HiTooltip v-if="index === 0" ico="none" position="top"  ani="fade" isActive
          class="hi-tooltip-wrap"
          :title-html="`클래스 탈퇴·위임`"
        />
        <HiKebab>
          <button @click="unsubscribeTeacher">{{ unsubscribeBtn }}</button>
        </HiKebab>
      </div>
    </td>
  </tr>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import { useClassErrorManager } from "@/apps/main/clazzes/utils";
import {openPopup} from "@/plugins/utils";
import CONSTANTS from '@/plugins/constants';
const errorManager = useClassErrorManager();

export default {
  name: 'accept-member-item',
  props: {
    member: { type: Object },
    index: { type: Number },
    curTab: { type: String },
    activeTags: { type: Array },
    clazzes: { type: Object },
    clazzMemberCount: { type: Number },
    isCurUserClassOwner: { type: Boolean },
    checkedMembers: { type: Array }
  },
  data() {
    return {
      selectedTags: [],
      originalStudentNo: null
    }
  },
  mounted() {
    this.originalStudentNo = this.member.studentNo
  },
  computed: {
    ...mapState([
      'user'
    ]),
    ...mapState('storeClazzTag', [
      'clazzTags'
    ]),
    classId() {
      return this.clazzes.currentId
    },
    profilePhotoSrc() {
      if (this.member.profilePhoto) {
        return this.member.profilePhoto
      }
      return '/files/img/profile_default.png'
    },
    userPhotoStyleObj() {
      return `background-image:url('${this.profilePhotoSrc}'); background-size: 66px 66px;`
    },
    userTypeName() {
      if (['OWNER', 'MANAGER'].includes(this.member.role)) return '선생님'
      if (this.member.userType === 'STUDENT') return '학생'
      return '학부모'
    },
    isShowKebab() {
      if (this.member.role === 'MEMBER') return false
      return this.isCurUserClassOwner ? true : this.member.role !== 'OWNER'
    },
    isNewMember() {
      return !this.member.isTempStudent &&
          this.member.insertedTimestamp > new Date().getTime() - 86400000
    },
    unsubscribeBtn() {
      if (this.isCurUserClassOwner) {
        return this.member.role === 'OWNER' ? '클래스 탈퇴·위임' : '권한 해제'
      } else {
        return '권한 해제'
      }
    }
  },
  methods: {
    ...mapActions({
      openHitalkPopup: 'openHitalkPopup',
      initChatUncheckedMessage: 'initChatUncheckedMessage'
    }),
    ...mapMutations('storeClazzTag', [
      'addClazzTags'
    ]),
    ...mapMutations(['setIsDimLoading']),
    clickMemberCheckbox(event) {
      this.$emit('clickMemberCheckbox', {
        member: this.member,
        isChecked: event.target.checked
      })
    },
    openMemberDetail() {
      this.$emit('openMemberDetail', this.member.memberId)
    },

    openHitalk() {
      // this.openHitalkPopup({
      //   params: {
      //     chatUserClassId: this.classId,
      //     chatUserId: this.member.userId,
      //     chatUserType: this.member.userType,
      //     chatUserMemberRole: this.member.role
      //   }
      // }) openPopup 으로 교체
      this.initChatUncheckedMessage()
      openPopup(CONSTANTS.POPUP.HI_TALK, {
        chatUserClassId: this.classId,
        chatUserId: this.member.userId,
        chatUserType: this.member.userType,
        chatUserMemberRole: this.member.role
      })
    },

    async addTag({ tagName }) {
      if (!tagName) return
      if (this.member.tags.map(tag => tag.tagName).includes(tagName)) return
      if (this.member.tags.length >= 10) {
        this.$toasted.show('학반(태그)은 최대 10개까지 선택 가능합니다.')
        return
      }

      try {
        this.setIsDimLoading(true)
        const res = await this.$axios.post(`/clazzes/${this.classId}/members/${this.member.memberId}/tag`, { tagName })
        this.member.tags.push(res.data)
      } catch (err) {
        errorManager.showErrorMsg('MEMBER_TAG', err)
      } finally {
        this.setIsDimLoading(false)
      }
    },
    async removeTag({ tagId }) {
      if (!tagId) return
      try {
        this.setIsDimLoading(true)
        await this.$axios.delete(`/clazzes/${this.classId}/members/${this.member.memberId}/tag`, { data: { tagId } })
        const delIdx = this.member.tags.findIndex(tag => tag.tagId === tagId)
        if (delIdx > -1) this.member.tags.splice(delIdx, 1)
      } catch (err) {
        const isRefresh = errorManager.showErrorMsg('MEMBER_TAG', err)
        if (isRefresh) {
          const delIdx = this.member.tags.findIndex(tag => tag.tagId === tagId)
          if (delIdx > -1) this.member.tags.splice(delIdx, 1)
        }
      } finally {
        this.setIsDimLoading(false)
      }
    },
    async createTag(tagName) {
      if (this.clazzTags.length >= 200) {
        this.$toasted.show('학반(태그)은 최대 200개까지 추가 가능합니다.')
        return
      }

      try {
        this.setIsDimLoading(true)
        const res = await this.$axios.post(`/clazzes/${this.classId}/tags`, { tagName })
        this.addClazzTags(res.data)
        await this.addTag({tagName})
      } catch (err) {
        errorManager.showErrorMsg('CLASS_TAG', err)
      } finally {
        this.setIsDimLoading(false)
      }
    },

    replaceStudentNo(studentNo) {
      this.member.studentNo = studentNo.replaceAll(/^0/g, '').replaceAll(/[^0-9]/g, '').substring(0, 2)
    },
    async editStudentNo() {
      if (this.member.userType === 'STUDENT' && !this.member.studentNo) {
        this.member.studentNo = this.originalStudentNo
        return
      }
      try {
        const res = await this.$axios.patch(`/clazzes/${this.classId}/members/${this.member.memberId}/number`, {
          memberClassNumber: this.member.studentNo
        })
        this.originalStudentNo = res.data.memberClassNumber
      } catch (err) {
        errorManager.showErrorMsg('MEMBER', err)
      }
    },

    unsubscribeTeacher() {
      if (this.clazzMemberCount < 2) {
        let msg = '클래스 탈퇴시 위임받으실 선생님을 먼저 추가해주세요.'
        this.$hiClass.alert(msg, 'warning', false)
        return
      }

      if (this.isCurUserClassOwner) {
        this.member.role === 'OWNER' ? this.$emit('confirmChangeTeacherRole') : this.unsubscribeManager()
      } else {
        this.unsubscribeManager()
      }
    },
    async unsubscribeManager() {
      let msg = '권한을 해제할 경우, 더 이상 클래스에 진입할 수 없습니다.<br>관리자 권한을 해제하시겠습니까?'

      try {
        await this.$hiClass.confirm(msg, 'warning', {
          confirmButtonText: '해제',
          reverseButtons: false
        })
      } catch (err) {
        return
      }
      await this.$hiClass.clazzSubscribes.delete(`/clazzSubscribes/${this.member.memberId}`)

      // 내 구독정보를 삭제할 경우 메인화면으로 이동
      if (this.user.currentId === this.member.userId) {
        await this.$router.push('/main', () => {})
      }
      this.$emit('deleteClazzMemberByIndex', this.index)
    }
  }
}
</script>
<style lang="scss" scoped>
.owner{
  border: 1px solid #ff6a6a;
  color: #ff6a6a;
  padding: 3px 4px;
  font-size: 10px;
  border-radius: 8px;
}
.hi-kebabmenu {
  top: calc(50% - 13px);
  left: calc(50% - 13px);
}
</style>
