<!--
@File(Method): MainBodyMypageInfoBodyProfile.vue
@Description: 마이페이지 > 내 정보 관리 > 기본 프로필 정보 영역
@Modified: 2025-03-05 - #72684 프로필 이미지 아바타(HiAvatar) 구축 및 적용
-->
<template>
  <div class="privacy-info-box boundary-box profile-info">
    <div class="left-wrap">
      <div class="box-title">기본 프로필 정보</div>
      <div class="profile-thumbnail">
        <HiAvatar        
          size="xl" 
          outline
          :img="user.userPhoto ? user.userPhoto : null"
        >              
          <template v-slot:badge>
            <HiIcon
              name="ico-photo" color="white" outline bgColor="default" rounded="rounded"
              class="bottom-right"
              @click.native="isProfileImageMore = !isProfileImageMore"
              v-click-outside="closeProfileImageMore"         
              role="button"
          ></HiIcon>
          </template>
        </HiAvatar>
        <span class="sr-only" ref="userPhoto"></span>
        <input
          type="file"
          id="upload-profile-thumb"
          ref="UserProfileImageFile"
          @change="addFile"
          accept="image/*"
        />
        <!-- #72684 프로필 이미지 아바타(HiAvatar) 구축 및 적용        
        <div class="upload-circle img-in">
          <template v-if="isExist(user.userPhoto)">
            <img
              ref="userPhoto"
              :src="user.userPhoto"
              @error="userPhotoReplace"
              alt=""
              style="width:120px; height: 120px;"
            />
          </template>
          <template v-else>
            <img
              ref="userPhoto"
              src="/files/img/profile_default.png"
              alt=""
              style="width:120px; height: 120px;"
            />
          </template>
        </div>
        -->
        <div class="change-thumbnail-btn-wrap">
          <!--  #72684 프로필 이미지 아바타(HiAvatar) 구축 및 적용 
          <button
            v-click-outside="closeProfileImageMore"
            class="btn-camera"
            @click="isProfileImageMore = !isProfileImageMore"
          ></button>
          -->
          <div
            class="more-popup-wrap"
            :class="{
              on: isProfileImageMore
            }"
          >
            <button @click="changeUserProfileImage(true)">
              <span class="text">사진 변경</span>
            </button>
            <button @click="removeUserProfileImage">
              <span class="text">프로필 이미지 삭제</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="right-wrap">
      <div class="info-category">
        <div class="category-title">이름<span>* 본인 확인에 필요한 정보이므로, 실명(본명)을 입력해주세요.</span></div>
        <div class="info-cont">
          <div
            class="input-box-wrap"
            :class="{
              focus: isUserNameFocus
            }"
          >
            <input
              type="text"
              v-model="user.userName"
              id="userName"
              maxlength="20"
              :placeholder="$t('main.text.name')" 
              @input="[eventUserName($event), inputName($event)]"
            />
          </div>
          <div class="btn-wrap">
            <HiButton
              color="primary"
              bitrounded
              :disabled="isUserNameError || !userNameChange"
              @click="updateUser"
            >
              {{ userMobileBtnStr }}
            </HiButton>
          </div>
          <span class="input-error" v-if="isUserNameError">이름은 완성형 한글, 영문, 숫자로 2자 이상 입력해주세요.</span>
        </div>
      </div>
      <div class="info-category">
        <div class="category-title">역할</div>
        <div class="info-cont">
          <div class="input-box-wrap readonly">
            <input
              type="text"
              placeholder="역할"
              :value="userTypeStr"
              readonly
            />
          </div>
        </div>
      </div>
      <div class="info-category" v-if="!isTempStudent">
        <div class="category-title">휴대폰</div>
        <div class="info-cont">
          <div class="input-box-wrap readonly">
            <input
              type="text"
              :placeholder="userMobilePlaceholderStr"
              :value="$stringUtil.phoneFormatter(user.userMobile)"
              readonly
            />
          </div>
          <div class="btn-wrap">
            <button class="btn-bg-c" @click="changeMobilePhone">
              {{ userMobileBtnStr }}
            </button>
          </div>
        </div>
      </div>

      <!-- <div class="info-category">
        <div class="category-title">전자서명</div>
        <div class="info-cont">
          <div class="esign-box-wrap">
            <img
              v-if="userSign.userSignImagePath"
              :src="userSign.userSignImagePath"
              width="320"
              alt=""
              @dragstart="preventDrag"
            />
          </div>
          <div class="btn-wrap">
            <button class="btn-bg-c" @click="$hiClass.changeUserSign()">{{ userSignatureBtnStr }}</button>
          </div>
        </div>
      </div> -->

      <!-- 결재서명 -->
      <!-- <main-body-mypage-info-body-profile-esign
        v-if="$store.state.user.userType === CONSTANTS.USER_TYPE.TEACHER"
      /> -->

    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import {eventBus} from "@/main";
import {checkAndConvertHEIC} from "@/plugins/utils";
// import MainBodyMypageInfoBodyProfileEsign from '@/apps/main/mypage/info/MainBodyMypageInfoBodyProfileEsign'
import {mapActions, mapGetters} from 'vuex'

export default {
  name: 'MainBodyMypageInfoBodyProfile',
  components: {},
  props: {
    user: Object,
    isTempStudent: Boolean
  },
  data() {
    return {
      isUserNameFocus: false,
      isProfileImageMore: false,
      tmpUserPhoto: '',
      oldValue: {
        user: ''
      },
      userData: {},
      userSign: {
        userId: '',
        userSignImagePath: '',
        userSignTimestamp: ''
      },
      userNameChange: false,
      isUserNameError: false
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    userTypeStr() {
      let userType = this.user.userType
      let userSns = this.user.userSns
      if (this.user.userSns !== undefined) userSns = userSns.toUpperCase()

      if (userType === 'TEACHER') userType = '선생님'
      else if (userType === 'PARENTS') userType = '학부모'
      else if (userType === 'STUDENT' && userSns === 'HICLASS')
        userType = '임시 학생'
      else if (userType === 'STUDENT') userType = '학생'

      return userType
    },
    isExistUserMobile() {
      return this.user.userMobile !== undefined &&
        this.user.userMobile !== null &&
        this.user.userMobile !== '';
    },
    isUserTypeStudent() {
      return this.user.userType === 'STUDENT'
    },
    userMobilePlaceholderStr() {
      if (this.isExistUserMobile) return '휴대폰'
      else return '등록된 휴대폰번호가 없습니다'
    },
    userMobileBtnStr() {
      if (this.isExistUserMobile) return '변경'
      else return '등록'
    },
    userSignatureBtnStr() {
      if (this.userSign.userSignImagePath) return '변경'
      else return '등록'
    },
    // isUserNameError() {
    //   return this.$validation.isRegNamePattern5(this.user.userName)
    // }
    // imagePathStyleObj() {
    //   let rtnValue = "";
    //   let classImagePath = this.classImagePath;
    //   const size = "240";
    //   if (
    //     classImagePath !== undefined &&
    //     classImagePath !== null &&
    //     classImagePath !== ""
    //   ) {
    //     classImagePath = classImagePath + `?width=${size}&height=${size}`;
    //     rtnValue =
    //       `background-image: url('${classImagePath}');` +
    //       `background-size: ${size}px ${size}px;`;
    //   }
    //   return rtnValue;
    // }
  },
  watch: {
    'user.userName': function(val, oldVal) {
      // if (!this.$validation.isRegNamePattern5(this.user.userName)) {
      //   this.userNameChange = false
      //   return
      // }

      if(val !== this.oldValue.user) {
        this.userNameChange = true
        return
      }
      
      this.userNameChange = false
    }
  },
  created() {
    this.userData = this.user
    this.oldValue.user = this.user.userName
    // this.initUserSign()

    eventBus.$on('mypage-info-update-user-error', this.rollbackUserData)
  },
  mounted() {
    // window.addEventListener('message', this.handlePopupTask)
    eventBus.$on(`imageEditor-${this.$vnode.key}`,async uploadFileList => {
      this.upload(uploadFileList[0].file)
    })
  },
  beforeDestroy() {
    eventBus.$off('mypage-info-update-user-error')
    eventBus.$off(`imageEditor-${this.$vnode.key}`)
  },
  destroyed() {
    // window.removeEventListener('message', this.handlePopupTask)
  },
  methods: {
    ...mapActions('storeImageEditor', {
      openImageEditor: 'openImageEditor'
    }),
    isExist(param) {
      return param !== undefined && param !== null && param !== '';
    },
    closeProfileImageMore() {
      this.isProfileImageMore = false
    },
    changeUserProfileImage(flag) {
      if (flag !== true && this.isExist(this.user.userPhoto)) return false
      this.$refs.UserProfileImageFile.click()
    },
    removeUserProfileImage() {
      this.$hiClass.confirm('프로필 이미지를 삭제하시겠습니까?')
        .then(() => {
          // 프로필 이미지 삭제
          this.updateUserPhoto(null)
          this.$refs.UserProfileImageFile.value = ''
        })
    },
    changeMobilePhone() {
      this.$emit('openAuthMobilePhone')
    },
    updateUser() {
      const params = []
      // 이름 변경
      if (this.user.userName.trim() !== '')
        params.push({ userName: this.user.userName })
      // 프로필 사진
      this.$emit('setUserDataByParams', params)
      this.oldValue.user = this.user.userName
      this.userNameChange = false
    },
    // 신규 API 로 변경 (2022-02-24)
    updateUserPhoto(imgSrc) {
      const url = `/users/${this.user.currentId}/photo`
      const requestBody = { userPhoto: imgSrc }
      this.$hiClass.userPhoto.update(requestBody, url)
        .then(() => {
          // 변경된 회원정보 store 저장
          this.userData.userPhoto = imgSrc
          this.$store.commit('setUser', Object.assign({}, this.userData))
        })
    },
    rollbackUserData() {
      this.restoreOldValueUser()
    },
    async addFile(e) {
      if (e === null) {
        this.$refs.UserProfileImageFile.value = ''
        this.$refs.UserProfileImageFile.click()
      } else {
        this.isImage = false

        const files = []

        this.isDimLoading = true
        for (const file of Array.from(e.target.files)) {
          files.push(await checkAndConvertHEIC(file))
        }
        this.isDimLoading = false

        if (files[0] !== undefined) {
          this.$log.debug(this.$options.name, 'addFile', e)
          const isNotAllowExtensions = this.$store.state.isNotAllowExtensions
          if(isNotAllowExtensions.includes(files[0].name.substring(files[0].name.lastIndexOf('.') + 1, files[0].name.length).toLowerCase())) {
            this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
            this.$refs.UserProfileImageFile.value = ''
            return;
          }

          await this.openImageEditor({
            uploadedFiles: null,
            inputFiles: files,
            imageLimitCount: 1,
            componentKey: this.$vnode.key,
            targetIdx: 0,
            parentComponent: 'myPageProfileImage'
          })

          this.$refs.UserProfileImageFile.value = ''
        }
      }
    },
    upload(file) {
      this.tmpUserPhoto = ''
      this.$hiClass.multipart.upload(file)
        .then(async response => {
          this.$log.debug(this.$options.name, 'upload', response)
          let fileInfo = {
            fileName: response.data.filename.replace(/^.*[\\/]/, ''),
            // TODO: convert 즉시 반영시 error 경향 있음
            // fileOriginalPath: response.data._links.convert.href,
            fileOriginalPath: response.data._links.original.href,
            fileSize: response.data.size
          }
          let tmpUserPhoto = fileInfo.fileOriginalPath
          this.tmpUserPhoto = tmpUserPhoto
          this.$log.debug(
            this.$options.name + ' uploadedUserPhoto => ',
            tmpUserPhoto
          )
          this.$refs.userPhoto.src = tmpUserPhoto
          // 프로필 이미지 수정
          if (this.isExist(tmpUserPhoto)) {
            if (this.userData.userPhoto && !this.userData.userPhoto.includes('https://download.hiclass.net/static')) {
              await this.$hiClass.multipart.delete({fileOriginalPath: this.userData.userPhoto})
            }
            this.updateUserPhoto(tmpUserPhoto)
          }
        })
        .catch(error => {
          this.$log.debug(this.$options.name, 'upload', error)
        })
    },
    saveOldValueUser() {
      this.oldValue.user = this.user.userName
    },
    restoreOldValueUser() {
      this.user.userName = this.oldValue.user
      this.$refs.userName = this.oldValue.user
    },
    preventDrag(e) {
      e.preventDefault()
      return false
    },

    initUserSign() {
      try {
        this.$hiClass.userSign.read(`/userSign/${this.user.currentId}`)
          .then(res => {
            for (const [item, value] of Object.entries(res.data)) {
              this.userSign[item] = value
            }
          })
      } catch (e) {
        this.$log.warn(e)
      }
    },

    handlePopupTask(e) {
      if (e.data !== undefined && e.data !== null && e.data !== '' && typeof e.data === 'string') {
        if (e.data.includes('changeUserSign|')) {
          this.userSign.userSignImagePath = this.$comn.split(e.data, '|') || null
        } else if (event.data.includes('changeUserApprovalSign|')) {
          this.userSign.userApprovalSignImagePath = this.$comn.split(e.data, '|') || null
        }

      }
    },

    userPhotoReplace(e) {
      e.target.src = "/files/img/profile_default.png"
    },
    eventUserName : function(e) {
      this.user.userName = e.target.value.replace(/[^A-Za-z0-9ㄱ-힣\s]/gi, '').trim()
    },
    inputName: debounce(function(e) {
      const userName = e.target.value

      if(userName.length < 2) {
        this.isUserNameError = true
        return
      }

      const regexp = new RegExp(/[^A-Za-z0-9가-힣\s]/gi)
      if(regexp.test(userName)) {
        this.isUserNameError = true
      } else {
        this.isUserNameError = false
      }
    }, 200)
  },
}
</script>
