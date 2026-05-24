<!--
@File(Method): MemberDetail.vue
@Date Created: 2025-01-13
@Description: 클래스 구성원 관리 > 구성원 상세 (조회/수정), 임시학생 상세 (등록/수정/조회) 모달
@Modified: #69560 클래스 구성원 관리 태그 추가 , 구성원관리에 선생님 목록 이동
-->
<template>
  <div
      v-show="isLoad"
      class="modal normal-modal hi-modal-common note-notice-modal note-notice-edit-modal member-info-popup"
      id="modifyParentsAccount"
      style="display: block"
  >
    <div class="modal__layer">
      <div class="modal-title-wrap">
        <div class="title">{{ titleStr }}</div>
      </div>
      <div class="member-info-popup-wrap">
        <div class="member-info-popup-inner02">
          <div class="sr-only">
            <canvas id="profile-canvas" width="1123" height="1123"></canvas>
          </div>
          <HiAvatar    
            v-if="!isCreate"        
            type="profile"
            size="xl" 
            outline
            :img="member.profilePhoto ? member.profilePhoto : null"
          >              
            <template v-slot:badge  v-if="member.userType === 'STUDENT'">
              <HiIcon               
                name="ico-photo" color="white" bgColor="default" outline rounded="rounded"
                class="bottom-right"
                @click.native="isProfileImageEdit = true"
                role="button"
            ></HiIcon>
            </template>
          </HiAvatar>

          <!--  #72684 프로필 이미지 아바타(HiAvatar) 적용 전
          <div class="profile-thumbnail" v-if="!isCreate">
            <div class="profile-img profile-img-circle" :style="userPhotoStyleObj"></div>
            <div class="change-thumbnail-btn-wrap" v-if="member.userType === 'STUDENT'">
              <button class="btn-camera" @click="isProfileImageEdit = true"></button>
            </div>
          </div> 
          -->
          <div class="ft-blue-warning" v-if="isCreate && member.isTempStudent">
            다른 사람이 유추할 수 없는 아이디와 비밀번호를<br/>사용해 주세요.
          </div>

          <div class="profile-detail">
            <ul>
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
                <div class="category-name">{{ nameTitleStr }}</div>
                <div
                    class="input-box-wrap"
                    :class="{ dis: member.userType !== 'STUDENT', error: errorMessage.userName !== '' }"
                >
                  <input
                      :id="member.userType === 'STUDENT' ? 'studentName' : 'profileName'"
                      type="text"
                      maxlength="20"
                      :placeholder="nameTitleStr"
                      :value="member.userType === 'STUDENT' ? member.studentName : member.profileName"
                      @input="onKeyInputValidate($event)"
                      @focus="onKeyInputValidate($event)"
                      @blur="onKeyInputValidate($event)"
                      :disabled="member.userType !== 'STUDENT'"
                  />
                </div>
                <span v-if="errorMessage.userName">{{ errorMessage.userName }}</span>
              </li>
              <template v-if="member.isTempStudent">
                <li>
                  <div class="category-name">아이디</div>
                  <div
                      class="input-box-wrap"
                      :class="{ dis: !isCreate, error: errorMessage.loginId !== '' }"
                  >
                    <input
                        type="text"
                        id="loginId"
                        ref="loginId"
                        maxlength="12"
                        :placeholder="'영문 소문자, 숫자로 생성'"
                        v-model="member.loginId"
                        @input="onKeyInputValidate($event)"
                        @focus="isFocus.loginId = true; onKeyInputValidate($event)"
                        @blur="isFocus.loginId = false; existCheckLoginId(); onKeyInputValidate($event)"
                        @keydown.enter.prevent.stop="existCheckLoginId"
                        @keydown.space.prevent.stop
                        :readonly="!isCreate"
                        autocomplete="new-password"
                    />
                  </div>
                  <span v-if="isOnCapsLock && isFocus.loginId">Caps Lock key 켜져 있음</span>
                  <span v-else-if="isWrongId">이미 사용 중인 아이디입니다.</span>
                  <span v-else-if="errorMessage.loginId">{{ errorMessage.loginId }}</span>
                </li>
                <li>
                  <div class="category-name">비밀번호</div>
                  <div
                      class="input-box-wrap"
                      :class="{ error: !isFocus.loginPassword && (isWrongFormatPassword) && loginPassword !== '' }"
                  >
                    <input
                        type="password"
                        id="loginPassword"
                        ref="loginPassword"
                        maxlength="12"
                        :placeholder="'숫자로 생성'"
                        v-model="loginPassword"
                        @click="loginPassword = ''"
                        @focus="isFocus.loginPassword = true"
                        @blur="isFocus.loginPassword = false"
                        @keydown.enter.space.prevent.stop
                        autocomplete="new-password"
                    />
                  </div>
                </li>
                <li>
                  <div class="category-name">비밀번호 확인</div>
                  <div
                      class="input-box-wrap"
                      :class="{ error: !isFocus.loginPasswordConfirm && (!isSamePassword || isWrongFormatPassword) && loginPasswordConfirm !== '' }"
                  >
                    <input
                        type="password"
                        id="loginPasswordConfirm"
                        ref="loginPasswordConfirm"
                        maxlength="12"
                        :placeholder="'비밀번호 재입력'"
                        v-model="loginPasswordConfirm"
                        @click="loginPasswordConfirm = ''"
                        @focus="isFocus.loginPasswordConfirm = true"
                        @blur="isFocus.loginPasswordConfirm = false"
                        @keydown.enter.space.prevent.stop
                        autocomplete="new-password"
                    />
                  </div>
                  <template v-if="isReadyPassword">
                    <span v-if="!isSamePassword">{{ $t('main.clazzes.member.student.password.notSame') }}</span>
                    <span v-else-if="isWrongFormatPassword">{{ $t('main.clazzes.member.student.validation.password') }}</span>
                  </template>
                </li>
              </template>
              <li v-if="!member.isTempStudent">
                <div class="category-name">휴대폰 번호</div>
                <div class="input-box-wrap dis">
                  <input type="text" :value="$stringUtil.phoneFormatter(member.mobileNumber, null)" disabled/>
                </div>
              </li>
              <li v-if="member.role === 'MEMBER' && member.userType !== 'STUDENT'">
                <div class="category-name">자녀 이름</div>
                <div class="input-box-wrap" :class="{ error: errorMessage.studentName !== '' }">
                  <input
                      type="text"
                      id="studentName"
                      maxlength="20"
                      placeholder="한글, 영문, 숫자"
                      :value="member.studentName"
                      @input="onKeyInputValidate($event)"
                      @focus="onKeyInputValidate($event)"
                      @blur="onKeyInputValidate($event)"
                      @keydown.enter.space.prevent.stop
                  />
                </div>
                <span v-if="errorMessage.studentName">{{ errorMessage.studentName }}</span>
                <span class="child-info-msg">* 같은 클래스에 자녀가 여러 명인 경우, 자녀명을 모두 입력해 주세요.</span>
              </li>
              <li v-if="member.role === 'MEMBER'">
                <div class="category-name">{{ studentNoTitleStr }}</div>
                <div class="input-box-wrap" :class="{ error: errorMessage.studentNo !== '' }">
                  <input
                      type="text"
                      id="studentNo"
                      placeholder="숫자 1~99"
                      :value="member.studentNo"
                      @input="onKeyInputValidate($event)"
                      @focus="onKeyInputValidate($event)"
                      @blur="onKeyInputValidate($event)"
                      @keydown.enter.space.prevent.stop
                  />
                </div>
                <span v-if="errorMessage.studentNo">{{ errorMessage.studentNo }}</span>
              </li>
            </ul>
            <div v-if="member.userType === 'STUDENT' && member.isTempStudent" class="consent-box">
              <input type="checkbox" id="checked-sq" class="sq-type" v-model="isConsentChecked">
              <label for="checked-sq">
                <span class="consent-text">
                  <strong>[필수]</strong> 임시 학생 계정 생성을 위해 본인 또는 학부모(법정대리인)의 개인정보 처리 동의를 받았음을 확인합니다.
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="btn-wrap n">
        <div class="btn-group">
          <HiButton color="line-light-primary" @click="closeMemberDetail">
            취소
          </HiButton>
          <HiButton
              color="primary"
              :disabled="!isReadySubmit"
              @click="doSave"
          >
            {{ isCreate ? '등록' : '저장' }}
          </HiButton>
        </div>
        <div v-if="!isCreate && member.isTempStudent" class="confirm-btn-wrap mt-10">
          <HiButton color="warning" @click="deleteTempStudent">
            계정 삭제
          </HiButton>
        </div>
      </div>
      <div class="modal-close-btn modal-close-icon" @click="closeMemberDetail"></div>
    </div>

    <profile-image-edit
        v-if="isProfileImageEdit === true"
        :profileImage="profileImage"
        :profileType="'STUDENT'"
        :emptyImage="'/files/img/profile_default.png'"
        @close="isProfileImageEdit = false"
        @updateProfileImage="setStudentProfileImage"
    />
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import ProfileImageEdit from "@/components/Modal/ProfileImageEdit";
import { useClassErrorManager } from "@/apps/main/clazzes/utils";
import {mapFields} from "vuex-map-fields";
const errorManager = useClassErrorManager();

export default {
  name: 'member-detail-modal',
  components: {ProfileImageEdit},
  props: {
    memberId: {
      type: String,
      default: ''
    },
    classId: {
      type: String
    },
  },
  data() {
    return {
      member: {
        studentName: '',
        studentNo: '',
        mobileNumber: '',
        profileName: '',
        profilePhoto: '',
        userType: 'STUDENT',
        role: 'MEMBER',
        isTempStudent: true,
        loginId: '',
        tags: []
      },
      loginPassword: '',
      loginPasswordConfirm: '',
      isLoad: false,
      isBusy: false,
      isFocus: {
        memberChildName: false,
        memberClassNumber: false
      },
      isWrongId: false,
      errorMessage: {
        studentName: '',
        studentNo: '',
        userName: '',
        loginId: ''
      },
      isConsentChecked: false,

      // 임시학생 프로필 이미지 생성/수정
      profileBgColorCode: '#70CAFF',
      profileImage: {},
      isProfileImageEdit: false,
      isChangeProfileImage: false,
    }
  },
  computed: {
    ...mapState([
      'isOnCapsLock',
      'profileImageBgColor'
    ]),
    ...mapState('storeClazzTag', [
      'clazzTags'
    ]),
    ...mapFields([
      'isDimLoading'
    ]),
    isCreate() {
      return this.memberId === ''
    },
    titleStr() {
      if (['OWNER', 'MANAGER'].includes(this.member.role)) return '선생님 계정 정보'
      if (this.member.userType === 'STUDENT')  {
        if (this.member.isTempStudent) {
          return this.isCreate ? '임시 학생 계정 만들기' : '임시 학생 계정 정보'
        }
        return '학생 계정 정보'
      }
      return '학부모 계정 정보'
    },
    nameTitleStr() {
      if (['OWNER', 'MANAGER'].includes(this.member.role)) return '선생님명'
      if (this.member.userType === 'STUDENT') return '이름'
      return '학부모 성함'
    },
    studentNoTitleStr() {
      if (this.member.userType === 'STUDENT') return '반 번호'
      return '자녀 반 번호'
    },
    isReadySubmit() {
      if (Object.values(this.errorMessage).some(msg => msg !== '')) return false
      if (['OWNER', 'MANAGER'].includes(this.member.role)) return true
      if (this.member.userType === 'STUDENT') {
        if (this.member.isTempStudent) {
          return this.member.studentName !== '' && this.member.loginId !== '' && this.isCorrectPassword && this.member.studentNo !== '' && this.isConsentChecked
        }
        return this.member.studentName !== '' && this.member.studentNo !== ''
      } else {
        return this.member.studentName !== ''
      }
    },
    profilePhotoSrc() {
      if (this.member.profilePhoto) {
        return this.member.profilePhoto
      }
      return '/files/img/profile_default_v2.png'
    },
    userPhotoStyleObj() {
      let bgImageSrc = `background-image:url('${this.profilePhotoSrc}'); background-size: 120px 120px; background-position: center center;`
      if (this.isCreate) bgImageSrc += `cursor: pointer;`
      return bgImageSrc
    },
    isWrongFormatPassword() {
      if (this.isCreate) {
        return !this.isCorrectPassword
      } else {
        return this.loginPassword !== '********' && !this.isCorrectPassword
      }
    },
    isCorrectPassword() {
      if (!this.isReadyPassword) return false
      if (!this.isSamePassword) return false
      if (this.loginPassword.length < 8) return false
      return this.loginPassword !== '********' ?
          this.$validation.isRegNumber(this.loginPassword) : true
    },
    isSamePassword() {
      return this.loginPassword === this.loginPasswordConfirm
    },
    isReadyPassword() {
      return this.loginPassword !== '' && this.loginPassword.trim() !== '' &&
          this.loginPasswordConfirm !== '' && this.loginPasswordConfirm.trim() !== ''
    }
  },
  methods: {
    ...mapActions('storeClazzes', ['generateProfileImage']),
    ...mapMutations('storeClazzTag', ['addClazzTags']),
    ...mapMutations(['setIsDimLoading']),
    closeMemberDetail() {
      this.$emit('closeMemberDetail')
    },
    async getMember() {
      const res = await this.$axios.get(`/clazzes/${this.classId}/members/${this.memberId}`)
      this.member = {...res.data, studentName: res.data.studentName || ''}
      this.isConsentChecked = (res.data || {}).isConsentVerified || false;
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
        this.addClazzTags(res.data)
        await this.addTag(res.data)
      } catch (err) {
        errorManager.showErrorMsg('CLASS_TAG', err)
      } finally {
        this.setIsDimLoading(false)
      }
    },
    async existCheckLoginId() {
      this.isFocus.loginId = false
      if (!this.isCreate || this.errorMessage.loginId !== '') return

      if (this.member.loginId === '') {
        this.isWrongId = false
        return false
      }

      try {
        const res = await this.$hiClass.users.search({ _loginId: this.member.loginId, _userSns: 'hiClass' })
        this.isWrongId = res.data.page.totalElements > 0
      } catch(err) {
        this.isWrongId = true
      }
    },

    // ======= 상세 수정 =======
    async doSave() {
      if (this.isCreate) {
        await this.checkCreateTempStudent()
      } else {
        this.member.userType === 'STUDENT' ? await this.updateStudent() : await this.updateMember()
      }
    },
    async updateMember() {
      const member = {
        tagIds: this.member.tags.map(tag => tag.tagId),
      }
      if (this.member.role === 'MEMBER') {
        member.memberClassNumber = this.member.studentNo !== '' ? this.member.studentNo : -1
        member.memberChildName = this.member.studentName
      }

      try {
        await this.$hiClass.clazzSubscribes.update(member, `/clazzSubscribes/${this.member.memberId}`)
        this.$emit('updateClazzMember', this.member)
        this.closeMemberDetail()
      } catch (err) {
        errorManager.showErrorMsg('MEMBER', err)
      }
    },
    async updateStudent() {
      try {
        if (this.isChangeProfileImage) {
          await this.updateStudentProfileImage()
        }

        let student = {
          memberChildName: this.member.studentName,
          memberClassNumber: this.member.studentNo,
          userPhoto: this.member.profilePhoto,
          user: `${process.env.VUE_APP_BASE_API_URI}/users/${this.member.userId}`,
          clazz: `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.classId}`,
          tagIds: this.member.tags.map(tag => tag.tagId),
          isChecked: this.member.isTempStudent ? this.isConsentChecked : null
        }
        if (this.member.isTempStudent) {
          if (this.loginPassword !== '********') {
            student.loginPassword = this.loginPassword
          }
        }

        await this.$axios.patch(`/students`, student)
        this.$emit('updateClazzMember', this.member)
      } catch (err) {
        this.$hiClass.alert(`학생 계정 수정 실패`)
      } finally {
        this.closeMemberDetail()
      }
    },

    // ======== 학생 ========
    async checkCreateTempStudent() {
      this.isDimLoading = true
      await this.existCheckLoginId()
      if (this.isWrongId) return
      const fileOriginalPath = await this.generateProfileImage(
          { profileText: this.member.studentName.substring(0, 3), profileBgColor: this.profileBgColorCode, profileBgImage: null })
      await this.createTempStudent(fileOriginalPath)
      this.isDimLoading = false
    },
    async createTempStudent(fileOriginalPath) {
      if (this.member.studentNo.length > 1 && this.member.studentNo.startsWith('0'))
        this.member.studentNo = this.member.studentNo.substring(1)

      try {
        const student = {
          userType: 'STUDENT',
          userName: this.member.studentName,
          userNumber: this.member.studentNo,
          userPhoto: fileOriginalPath,
          loginId: this.member.loginId,
          loginPassword: this.loginPassword,
          clazz: `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.classId}`,
          profileImageInfo : {
            imageBgColor: this.profileBgColorCode,
            imagePath: fileOriginalPath,
            imageTitle: this.member.studentName.substring(0,3)
          },
          tagIds: this.member.tags.map(tag => tag.tagId),
          isChecked: this.member.isTempStudent ? this.isConsentChecked : null
        }
        await this.$axios.post('/v2/students', student)
        this.$emit('reloadMembers')
      } catch (err) {
        this.$hiClass.alert(`학생 계정 생성 실패`)
      } finally {
        this.closeMemberDetail()
      }
    },
    async getStudentProfileImage() {
      const res = await this.$axios.get(`/clazzes/${this.classId}/members/${this.member.memberId}/photoinfo`)
      this.profileImage = {
        imageTitle: res.data.imageTitle,
        imagePath: res.data.imagePath,
        imageBackgroundPath: !res.data.imageBgColor && !res.data.imageBgPath ? res.data.imagePath : res.data.imageBgPath,
        imageBackgroundColor: res.data.imageBgColor
      }
    },
    setStudentProfileImage(profileIImagePath) {
      this.member.profilePhoto = profileIImagePath
      this.profileImage.imagePath = profileIImagePath
      this.isChangeProfileImage = true
    },
    async updateStudentProfileImage() {
      const profileImage = {
        imageTitle: this.profileImage.imageTitle,
        imagePath: this.profileImage.imagePath,
        imageBgPath: this.profileImage.imageBackgroundPath,
        imageBgColor: this.profileImage.imageBackgroundColor
      }
      await this.$axios.patch(`/clazzes/${this.classId}/members/${this.member.memberId}/photoinfo`, profileImage)
    },
    async deleteTempStudent() {
      try {
        await this.$hiClass.confirm('더 이상 해당 계정으로 로그인할 수 없습니다.<br>계정을 삭제하시겠습니까?', 'warning')
      } catch (e) { return false }

      try {
        await this.$hiClass.userDeactivates.create({
          reason: '학생 계정 삭제',
          user: `${process.env.VUE_APP_BASE_API_URI}/users/${this.member.userId}`
        })
        this.$emit('deleteClazzMember')
        this.closeMemberDetail()
      } catch (err) {
        this.$hiClass.alert(`학생 계정 삭제 실패`)
      }
    },

    onKeyInputValidate(e) {
      const value = e.target.value
      const elementId = e.target.id

      this.member[elementId] = value

      if (!value) {
        this.errorMessage[elementId] = ''
        return false
      }

      switch (elementId) {
        case 'profileName':
        case 'studentName': {
          const regex = this.member.isTempStudent ? /[^A-Za-z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/gi : /[^A-Za-z0-9ㄱ-ㅎㅏ-ㅣ가-힣,]/gi
          this.member[elementId] = value.replaceAll(regex, '').substring(0, 20)
          this.errorMessage[elementId] = !regex.test(this.member[elementId]) ? '' : '한글, 영문, 숫자만 입력 가능합니다.'
          break
        }
        case 'studentNo': {
          this.member[elementId] = value.replaceAll(/^0/g, '').replaceAll(/[^0-9]/gi, '').substring(0, 2)
          this.errorMessage.studentNo = this.$validation.isRegNumber(this.member[elementId]) ? '' : '숫자만 입력 가능'
          break
        }
        case 'loginId': {
          this.errorMessage.loginId = ''
          if (value.length < 4) {
            this.errorMessage.loginId = '사용할 수 없는 아이디 입니다.'
          } else if (!this.$validation.isRegNumberAlphaByLowerCase(value)) {
            this.errorMessage.loginId = '영문 소문자와 숫자만 입력 가능'
          }
          break
        }
      }
    },
  },
  async mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    try {
      if (!this.isCreate) {
        await this.getMember()
        if (this.member.userType === 'STUDENT') {
          await this.getStudentProfileImage()
        }
      }

      if (this.member.isTempStudent && !this.isCreate) {
        this.loginPassword = '********'
        this.loginPasswordConfirm = '********'
      }

      this.isLoad = true

      const randomIdx = Math.floor(Math.random() * 14)
      this.profileBgColorCode = this.profileImageBgColor[randomIdx] || this.profileImageBgColor[0]
    } catch (err) {
      errorManager.showErrorMsg('MEMBER', err)
    }
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  }
}
</script>
<style lang="scss" scoped>
.modal {
  display: block;
  .member-info-popup-wrap {
    max-height: 560px;
    overflow-y: auto;
    .ft-blue-warning {
      margin-top: 0;
    }
  }
}
.profile-img-circle {
  position: relative;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,.1);
  background: #fafafa;
}

// #69560 구성원 관리 태그 추가 : css 추가
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
.profile-detail {
  .consent-box {
    margin-top: 20px;
    label {
      text-align: left;
      display: flex;
    }
    .consent-text {
      display: block;
      color: var(--gray-10);
      font-size: 14px;
      line-height: 122%;
      font-weight: 400;
      strong {
        font-weight: 600;
      }
    }
  } 
}
</style>