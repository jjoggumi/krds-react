<!--
@File(Method): MemberApproval.vue
@Date Created: 2025-02-27
@Description: 클래스 구성원 가입 수락/거절 모달
@Modified: #72513 가입 요청 수락 팝업 > 태그 입력 생성 및 자동 완성 추가
-->
<template>
  <div
      v-show="isLoad"
      class="modal normal-modal hi-modal-common modal-message modal-sm"
      style="display: block"
  >
    <div
        class="modal__layer"
        ref="modal"       
    >
      <div class="modal-title-wrap">
        <div class="title">가입 요청 수락하기</div>
      </div>
      <div class="member-info-popup-wrap">
        <div class="member-info-popup-inner02">
          <div class="profile-detail">
            <ul>
              <li>
                <div class="category-name">신청정보</div>
                <div class="info-wrap">
                  <div class="profile-img profile-img-circle" :style="userPhotoStyleObj"></div>
                  <div class="info-txt">
                    <p class="name">{{ userNameStr }}</p>
                    <p class="phone">{{ member.mobileNumber }}</p>
                  </div>
                </div>
              </li>
              <li>
                <div class="category-name">학반(태그)</div>
                <HiTagSelect
                  :tags="clazzTags"
                  :selectedTags="member.tags"
                  @add:tags="addTag($event)"
                  @remove:tags="removeTag($event)"
                  @create-tag="createTag"
                  @click.stop
                  placeholder="학반(태그)를 선택해주세요. (1-1, 1-2...햇님반)"
                />
              </li>
              <li>
                <div class="category-name">{{ userNameTitleStr }}</div>
                <div class="input-box-wrap">
                  <input
                      type="text"
                      :placeholder="userNameTitleStr"
                      :value="member.studentName"
                      @input="inputStudentName($event)"
                  />
                </div>
                <span class="child-info-msg" v-if="member.userType === 'PARENTS'">
                  * 같은 클래스에 자녀가 여러 명인 경우, 자녀명을 모두 입력해 주세요.
                </span>
              </li>
              <li>
                <div class="category-name">반 번호</div>
                <div class="input-box-wrap">
                  <input
                      type="text"
                      id="studentNo"
                      placeholder="숫자 1~99"
                      :value="member.studentNo"
                      @input="inputStudentNo($event)"
                      @keydown.enter.space.prevent.stop
                  />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="modal__footer">
          <HiButton color="light-primary" outline size="lg" @click="updateMemberStatus('DENIAL')">
            거부
          </HiButton>
          <HiButton color="primary" size="lg" @click="updateMemberStatus('ACCEPT')" :disabled=!isReadyAccept>
            수락
          </HiButton>          
      </div>
      <div v-if="showCloseButton" class="modal-close-btn modal-close-icon" @click="closeMemberApprovalModal"></div>
    </div>
  </div>
</template>

<script>
import { useClassErrorManager } from "@/apps/main/clazzes/utils";
import {mapMutations} from "vuex";
const errorManager = useClassErrorManager();

export default {
  name: 'member-approval-modal',
  props: {
    memberId: {
      type: String
    },
    classId: {
      type: String
    },
    showCloseButton: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      member: {},
      isLoad: false,
      clazzTags: []
    }
  },
  computed: {
    userNameStr() {
      if (this.member.userType === 'STUDENT') return `${this.member.studentName} 학생 (${this.member.profileName})`
      return `${this.member.studentName} 학부모 (${this.member.profileName})`
    },
    userNameTitleStr() {
      if (this.member.userType === 'STUDENT') return '이름'
      return '자녀 이름'
    },
    profilePhotoSrc() {
      if (this.member.profilePhoto) {
        return this.member.profilePhoto
      }
      return '/files/img/profile_default.png'
    },
    userPhotoStyleObj() {
     return `background-image:url('${this.profilePhotoSrc}'); background-size: 66px 66px; background-position: center center;`
    },
    isReadyAccept() {
      if (this.member.userType === 'PARENTS') return (this.member.studentName || '') !== ''
      return (this.member.studentName || '') !== '' && (this.member.studentNo || '').toString() != ''
    }
  },
  methods: {
    ...mapMutations(['setIsDimLoading']),
    closeMemberApprovalModal() {
      this.$emit('closeMemberApprovalModal')
    },
    async getMember() {
      try {
        const res = await this.$axios.get(`/clazzes/${this.classId}/members/${this.memberId}`)
        this.member = res.data
        this.member.studentName = this.member.studentName.substring(0, 20)
      } catch (err) {
        errorManager.showErrorMsg('MEMBER', err)
      }
    },
    async getTags() {
      const res = await this.$axios.get(`/clazzes/${this.classId}/tags`)
      if (res.data._embedded && res.data._embedded.clazzTags.length > 0) {
        this.clazzTags = res.data._embedded.clazzTags
      }
    },
    addTag({tagId, tagName}) {
      if (!tagName) return
      if (this.member.tags.map(tag => tag.tagName).includes(tagName)) return
      if (this.member.tags.length >= 10) {
        this.$toasted.show('학반(태그)은 최대 10개까지 선택 가능합니다.')
        return
      }
      this.member.tags.push({tagId, tagName})
    },
    async removeTag({ tagId }) {
      if (!tagId) return
      const delIdx = this.member.tags.findIndex(tag => tag.tagId === tagId)
      if (delIdx > -1) this.member.tags.splice(delIdx, 1)
    },
    async createTag(tagName) {
      if (this.clazzTags.length >= 200) {
        this.$toasted.show('학반(태그)은 최대 200개까지 추가 가능합니다.')
        return
      }

      try {
        this.setIsDimLoading(true)
        const res = await this.$axios.post(`/clazzes/${this.classId}/tags`, { tagName })
        this.clazzTags.push(res.data)
        await this.addTag({tagId: res.data.tagId, tagName: res.data.tagName})
      } catch (err) {
        errorManager.showErrorMsg('CLASS_TAG', err)
      } finally {
        this.setIsDimLoading(false)
      }
    },
    updateMemberStatus(memberStatus) {
      this.$emit('updateMemberStatus', { memberStatus, member: this.member })
      this.closeMemberApprovalModal()
    },
    inputStudentName(e) {
      this.member.studentName = e.target.value.replaceAll(/[^A-Za-z0-9ㄱ-ㅎㅏ-ㅣ가-힣,]/gi, '').substring(0, 20)
      e.target.value = this.member.studentName
    },
    inputStudentNo(e) {
      this.member.studentNo = e.target.value.replaceAll(/^0/g, '').replaceAll(/[^0-9]/g, '').substring(0, 2)
      e.target.value = this.member.studentNo
    }
  },
  async mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
    await this.getMember()
    await this.getTags()
    this.isLoad = true
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  }
}
</script>
<style lang="scss" scoped>
.modal {
  display: block;
  .modal__footer{margin-top: 0px;}
}
.profile-img-circle {
  position: relative;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,.1);
  background: #fafafa;
}
.hi-tag-select{
  min-height: 44px;width: 100%;  
  &::v-deep {
    .selected-tags{
      min-height: 44px;
      height: auto;
    }
    input{font-size:15px;}
    .tag-item{
      font-size: 15px;
      margin: 0;
      padding: 0 15px !important;
    }
  }
}
</style>