<!--
@File(Method): ProfileAddModal.vue
@Description: 클래스 설정 > 내 프로필 관리 >  내 프로필 > 수정 클릭 >  프로필 설정 모달 > 수정 클릭 > 프로필 수정 모달
@Description: 마이페이지 > 내 정보관리  >  내 멀티프로필 > 수정 클릭 > 프로필 수정 모달
@Modified: 2025-03-05 - #72684 프로필 이미지 아바타(HiAvatar) 구축 및 적용
-->
<template>
  <div
      class="modal normal-modal slick-modal view-main-detail-modal ofy"
      id="profileAddModal"
      style="display: block"
  >
    <div class="modal-cont-wrap" ref="scrollArea">
      <div class="modal-cont">
          <div class="modal-cont-inner">
            <div class="profile-modal-setting add"
              :class="{
                'edit': mode === 'update'
              }"  
            >
              <div class="title-wrap">
                  <h2>프로필 {{ modeStr }}</h2>
              </div>

              <div class="content-wrap">
                  <div class="content-wrap__photo">
                      <div class="photo-wrap">
                          <!-- #72684 프로필 이미지 아바타(HiAvatar) 적용 전
                          <p class="photo">
                              <img :src="userPhoto" />
                          </p>
                          -->
                          <HiAvatar         
                            size="xl" 
                            outline
                            :img="userPhoto ? userPhoto : null"
                          >              
                            <template v-slot:badge>
                              <HiIcon
                                name="ico-photo" color="white" bgColor="default" rounded="rounded"
                                class="bottom-right"
                                outline
                                @click.native="onFileSelectMode" v-click-outside="closeFileSelectMode"
                                role="button"
                            ></HiIcon>
                            </template>
                          </HiAvatar>
                          <input
                            hidden
                            type="file"
                            ref="fileUpload"
                            @change="addFile"
                            accept="image/*"
                          />
                          
                          <!-- #72684 프로필 이미지 아바타(HiAvatar) 적용 전
                          <button class="select" @click="onFileSelectMode" v-click-outside="closeFileSelectMode">
                              <span class="camera_transparent"></span>
                          </button>
                          -->
                          <div class="more-popup-wrap"
                            :class="{'on': isFileSelectMode}"
                          >
                              <button @click="onFile">
                                  <span class="text">사진 변경</span>
                              </button>
                              <button @click="delFile">
                                  <span class="text">프로필 이미지 삭제</span>
                              </button>
                          </div>
                      </div>
                  </div>
                  
                  <div class="content-wrap__name">
                      <div class="name-wrap">
                          <label id="profile-name">프로필 이름</label>
                          <input name="profile-name" id="profile-name" ref="profileName" 
                            placeholder="프로필 이름을 입력하세요." 
                            v-model="item.profileName" 
                            @input="[inputProfileName($event), checkInputNameError($event)]"
                            max-length="20"
                          />
                      </div>
                      <span class="input-error-msg" v-if="isInputNameError">이름은 완성형 한글, 영문, 숫자로 2자 이상 입력해주세요.</span>
                      <span class="edit-msg" v-if="mode === 'update'">* 프로필 수정 시, 해당 프로필을 사용중인 모든 클래스에 적용됩니다.</span>
                  </div>
              </div>

              <div class="btn-p-wrap">
                  <button :class="{ 'dis': !isSumbit || isProfileNameError }" 
                  :disabled="!isSumbit || isProfileNameError"
                  @click="submit">{{ modeStr }}</button>
              </div>

              <div class="modal-close-btn" @click="close"></div>
          </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import {mapState, mapMutations, mapActions} from 'vuex'
import {eventBus} from "@/main";

export default {
  name: 'profile-add-modal',
  components: {},
  props: {
    classId: String,
    addItem: Object,
    whereMode: String
  },
  data() {
    return {
      item: {
        profileId: null,
        profileName: "",
        profileImage: null
      },
      mode: "write",
      isFileSelectMode: false,
      isInputNameError: false
    }
  },
  computed: {
    ...mapState({
      curClassItem: 'curClassItem'
    }),
    ...mapState('storeClazzes', {
      classUser: 'classUser'
    }),
    userPhoto() {
      let defaultImage = '/files/img/profile_default.png'
      if(!this.item.profileImage) {
        return defaultImage
      }
      return this.item.profileImage 
    },
    isSumbit() {
      return this.item.profileName.length > 1 ? true : false
    },
    isProfileNameError() {
      const regexp = new RegExp(/[^A-Za-z0-9가-힣\s]/gi)
      return regexp.test(this.item.profileName)
    },
    user() {
      return this.$store.state.user
    },
    modeStr() {
      return this.mode === 'update' ? "수정" : "추가"
    }
  },
  methods: {
    ...mapMutations({
      setUser: 'setUser'
    }),
    ...mapMutations('storeClazzes', {
      setClassUser: 'setClassUser'
    }),
    ...mapActions('storeImageEditor', {
      openImageEditor: 'openImageEditor'
    }),
    init() {
      this.item.profileId = this.addItem.item.profileId
      this.item.profileName = this.addItem.item.profileName
      this.item.profileImage = this.addItem.item.profilePhoto
    },
    inputProfileName(e) {
      e.target.value = e.target.value.substr(0, 20)
      e.target.value = e.target.value.replace(/[^A-Za-z0-9ㄱ-힣\s]/gi, '').trim()
      this.item.profileName = e.target.value
    },
    checkInputNameError: debounce(function(e) {
      const profileName = e.target.value

      if(profileName.length < 2) {
        this.isInputNameError = true
        return
      }

      const regexp = new RegExp(/[^A-Za-z0-9가-힣\s]/gi)
      if(regexp.test(profileName)) {
        this.isInputNameError = true
      } else {
        this.isInputNameError = false
      }
    }, 200),
    onFile() {
      this.isFileSelectMode = false
      this.$refs.fileUpload.click()
    },
    delFile() {
      this.$refs.fileUpload.value = ""
      this.item.profileImage = null
    },
    async addFile(e) {
      let files = e.target.files
      if (files[0] !== undefined) {
        const isNotAllowExtensions = this.$store.state.isNotAllowExtensions
        if(isNotAllowExtensions.includes(files[0].name.substring(files[0].name.lastIndexOf('.') + 1, files[0].name.length).toLowerCase())) {
          this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
          this.$refs.fileUpload.value = ''
          return;
        }

        await this.openImageEditor({
          uploadedFiles: null,
          inputFiles: files,
          imageLimitCount: 1,
          componentKey: 'add-multiProfile-image',
          targetIdx: 0,
          parentComponent: 'multiProfileImage'
        })

        this.$refs.fileUpload.value = ''
      }
    },
    upload(formData) {
      let header = { 'Content-Type': 'multipart/form-data' }
      const multipartUrl = process.env.VUE_APP_BASE_FILE_URI + '/multipart'

      this.$axios({
        method: 'post',
        url: multipartUrl,
        data: formData,
        headers: header
      })
        .then(response => {
          this.$log.debug(this.$options.name, 'upload', response)
          let fileInfo = {
            fileName: response.data.filename.replace(/^.*[\\/]/, ''),
            // TODO: convert 즉시 반영시 error 경향 있음
            // fileOriginalPath: response.data._links.convert.href,
            fileOriginalPath: response.data._links.original.href,
            fileSize: response.data.size
          }
          this.item.profileImage = fileInfo.fileOriginalPath
        })
        .catch(error => {
          this.$log.debug(this.$options.name, 'upload', error)
        })
    },
    onFileSelectMode() {
      this.isFileSelectMode = !this.isFileSelectMode
    },
    closeFileSelectMode() {
      this.isFileSelectMode = false
    },
    async submit() {
      const regexp = new RegExp(/[^A-Za-z0-9ㄱ-힣\s]/gi)
      if(regexp.test(this.item.profileName)) {
        this.$hiClass.alert('적절하지 못한 단어가 포함되어 있습니다.', 'warning')
      } else {
        const obj = {
          profileName: this.item.profileName,
          profileImage: this.item.profileImage
        }

        // if(this.item.profileImage) {
        //   obj.profileImage = this.item.profileImage
        // }

        try {
          if(this.mode === "write") {
            const res = await this.$axios({
              method: 'POST',
              url: `/users/profiles`,
              data: obj
            })

            this.$emit("submit", _.cloneDeep(res.data), this.mode)
          } else {
            const res = await this.$axios({
              method: 'PUT',
              url: `/users/profile/${this.item.profileId}`,
              data: obj
            })
            
            if(res.data.isDefault) {
              const obj = {
                ...this.user,
                userPhoto: res.data.profilePhoto
              }
              this.setUser(obj)
            }

            if(this.whereMode === 'edit') {
              let profileId = res.data.isDefault ? null : res.data.profileId

              if(this.classUser.profileId === profileId) {
                this.setClassUser({
                  ...this.classUser,
                  profileId: profileId,
                  userName: res.data.profileName,
                  userPhoto: res.data.profilePhoto
                })

                if(this.curClassItem.classOwner.currentId === this.classUser.userId) {
                  this.curClassItem.classOwner.userName = res.data.profileName
                }
              }
            }

            this.$emit("submit", _.cloneDeep(res.data), this.mode)
          }
        } catch (err) {
          this.$log.debug('submit POST() error => ', err)
        }
      }

    },
    close() {
      this.$emit("close")
    }
  },
  mounted() {
    if(this.addItem.mode === "edit") {
      this.mode = "update"
      this.init()
    }

    this.$nextTick(() => {
      this.$refs.profileName.focus()
    })

    eventBus.$on(`imageEditor-add-multiProfile-image`,async uploadFileList => {
      const fileData = new FormData()
      fileData.append('file', uploadFileList[0].file, uploadFileList[0].file.name)
      this.upload(fileData)
    })
  },
  beforeDestroy() {
    eventBus.$off('imageEditor-add-multiProfile-image')
  }
}
</script>

<style scoped lang="scss">
.modal.ofy.slick-modal .modal-close-btn {
  right: 20px;
}

.profile-modal-setting {
  width: 400px;
  height: 591px;
  border-radius: 16px;
  background: #fff;
  position: relative;
  padding: 40px 30px 30px 30px;
}
.profile-modal-setting.add {
  height: 416px;
}
.profile-modal-setting.add.edit {
  height: 438px;
}
.profile-modal-setting .title-wrap {
  width: 100%;
  height: 53px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.profile-modal-setting.add .title-wrap {
  height: 20px;
}
.profile-modal-setting .title-wrap h2 {
  font-family: var(--font-tit);
  font-size: 20px;
  font-weight: 700;
  line-height: 20px;
  text-align: left;
  color: #000;
}
.profile-modal-setting .title-wrap .info {
  font-size: 15px;
  font-weight: 400;
  color: #616161;
  display: inline-block;
  height: 23px;
  line-height: 23px;
}
.profile-modal-setting .content-wrap {
  width: 100%;
  height: auto;
  margin: 30px 0;
}
.profile-modal-setting .content-wrap .content-wrap__selected,
.profile-modal-setting .content-wrap .content-wrap__photo {
  width: 100%;
  height: 174px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.profile-modal-setting .content-wrap .content-wrap__photo {
  height: 124px;
}
.profile-modal-setting .content-wrap .content-wrap__selected .photo-wrap,
.profile-modal-setting .content-wrap .content-wrap__photo .photo-wrap {
  position: relative;
}
.profile-modal-setting .content-wrap .content-wrap__selected .photo-wrap p.photo,
.profile-modal-setting .content-wrap .content-wrap__photo .photo-wrap p.photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  border: 1px solid #0000001a;
}
.profile-modal-setting .content-wrap .content-wrap__selected .photo-wrap p.photo img,
.profile-modal-setting .content-wrap .content-wrap__photo .photo-wrap p.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: auto;
}
.profile-modal-setting .content-wrap .content-wrap__selected .photo-wrap button,
.profile-modal-setting .content-wrap .content-wrap__photo .photo-wrap button.select {
  position: absolute;
  width: 34px;
  height: 34px;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: #616161;
  border: 3px solid #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}
.profile-modal-setting
  .content-wrap
  .content-wrap__photo
  .photo-wrap
  div.more-popup-wrap {
  background: #fff;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 100%;
  left: calc(100% - 34px);
  display: none;
}
.profile-modal-setting
  .content-wrap
  .content-wrap__photo
  .photo-wrap
  div.more-popup-wrap.on {
  display: block;
}
.profile-modal-setting
  .content-wrap
  .content-wrap__photo
  .photo-wrap
  div.more-popup-wrap
  button {
  min-width: 84px;
  width: 100%;
  height: 40px;
  text-align: left;
  padding: 0 16px;
  white-space: nowrap;
  position: relative;
}
.profile-modal-setting
  .content-wrap
  .content-wrap__photo
  .photo-wrap
  div.more-popup-wrap
  button:hover {
  background: #dae4f8;
}
.profile-modal-setting
  .content-wrap
  .content-wrap__photo
  .photo-wrap
  div.more-popup-wrap
  button:first-child {
  border-radius: 4px 4px 0 0;
}
.profile-modal-setting
  .content-wrap
  .content-wrap__photo
  .photo-wrap
  div.more-popup-wrap
  button:not(:last-child) {
  border-bottom: 1px solid #e6e6e6;
}
.profile-modal-setting
  .content-wrap
  .content-wrap__photo
  .photo-wrap
  div.more-popup-wrap
  button
  span.text {
  display: inline-block;
  color: #444;
  font-size: 15px;
  font-weight: 400;
}
.profile-modal-setting .content-wrap .content-wrap__selected .name-wrap {
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.profile-modal-setting .content-wrap .content-wrap__selected .name-wrap span {
  display: inline-block;
  width: 100%;
  text-align: center;
}
.profile-modal-setting .content-wrap .content-wrap__selected .name-wrap span.name {
  font-size: 18px;
  font-weight: 500;
  color: #222;
  height: 18px;
}
.profile-modal-setting .content-wrap .content-wrap__selected .name-wrap span.type {
  font-size: 14px;
  font-weight: 400;
  color: #616161;
  height: 14px;
}
.profile-modal-setting .content-wrap .content-wrap__choice {
  width: 100%;
  height: 160px;
  display: flex;
  justify-content: flex-start;
  cursor: pointer;
}
.profile-modal-setting .content-wrap .content-wrap__choice .choice-wrap,
.profile-modal-setting .content-wrap .content-wrap__choice .add-wrap {
  width: 102px;
  height: 160px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  position: relative;
  margin-left: 0;
}
.profile-modal-setting .content-wrap .content-wrap__choice .add-wrap {
  border: 1px dashed #d6d6d6;
  cursor: pointer;
}
.profile-modal-setting .content-wrap .content-wrap__choice .choice-wrap:not(:first-child),
.profile-modal-setting .content-wrap .content-wrap__choice .add-wrap {
  margin-left: 17px;
}
.profile-modal-setting .content-wrap .content-wrap__choice .choice-wrap.on {
  background: #4778de14;
  border: 1px solid var(--primary);
}
.profile-modal-setting .content-wrap .content-wrap__choice .choice-wrap p.photo,
.profile-modal-setting .content-wrap .content-wrap__choice .add-wrap p.photo {
  width: 66px;
  height: 66px;
  border-radius: 50%;
  margin: 30px 18px 10px 18px;
  position: relative;
  overflow: hidden;
  border: 1px solid #0000001a;
}
.profile-modal-setting .content-wrap .content-wrap__choice .add-wrap p.photo {
  background-color: #f3f3f3;
  border: none;
  margin-top: 21px;
  background-image: url("~@/assets/img/icon/icon_plus_24_gray01.svg");
  background-repeat: no-repeat;
  background-size: 24px 24px;
  background-position: center;
}
.profile-modal-setting
  .content-wrap
  .content-wrap__choice
  .choice-wrap
  p.photo
  span.basic {
  display: none;
}
.profile-modal-setting
  .content-wrap
  .content-wrap__choice
  .choice-wrap.on
  p.photo
  span.basic {
  display: inline-block;
  width: 100%;
  height: 18px;
  background: #222222cc;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  position: absolute;
  bottom: 0;
  left: 0;
  text-align: center;
  line-height: 18px;
}
.profile-modal-setting .content-wrap .content-wrap__choice .choice-wrap p.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: auto;
}
.profile-modal-setting .content-wrap .content-wrap__choice .choice-wrap .name,
.profile-modal-setting .content-wrap .content-wrap__choice .add-wrap .name {
  width: 82px;
  height: 42px;
  margin: 0 10px;
  line-height: 21px;
  font-size: 15px;
  font-weight: 400;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-align: center;
}
.profile-modal-setting .content-wrap .content-wrap__choice .add-wrap .name {
  color: #9e9e9e;
}
.profile-modal-setting .content-wrap .content-wrap__choice .choice-wrap p.check {
  position: absolute;
  top: 10px;
  left: 10px;
}
.profile-modal-setting.add .content-wrap .content-wrap__name .name-wrap {
  width: 100%;
  height: auto;
}
.profile-modal-setting.add .content-wrap .content-wrap__name .name-wrap label {
  display: block;
  line-height: 20px;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #222;
  text-align: left;
}
.profile-modal-setting.add .content-wrap .content-wrap__name .name-wrap input {
  width: 100%;
  height: 44px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  padding: 10px 15px;
  font-size: 15px;
  font-weight: 400;
  color: #222;
}
.profile-modal-setting.add
  .content-wrap
  .content-wrap__name
  .name-wrap
  input::placeholder {
  color: #bdbdbd;
}
.profile-modal-setting.add .content-wrap .content-wrap__name .name-wrap input:focus {
  border: 1px solid #8ea4d1;
}
.profile-modal-setting.add .content-wrap .content-wrap__name span.input-error-msg {
  display: inline-block;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #ec1f2d;
  width: 100%;
  text-align: left;
}
.profile-modal-setting.add .content-wrap .content-wrap__name span.edit-msg {
  display: inline-block;
  margin-top: 10px;
  font-size: 12px;
  font-weight: 400;
  color: #898989;
}
.profile-modal-setting .btn-p-wrap {
  width: calc(100% - 60px);
  height: auto;
  position: absolute;
  bottom: 30px;
  left: 30px;
}
.profile-modal-setting .btn-p-wrap button {
  width: 100%;
  height: 44px;
  border-radius: 24px;
  background: var(--primary);
  font-weight: 700;
  font-size: 15px;
  color: #fff;
}
.profile-modal-setting .btn-p-wrap button.dis {
  background: #d6d6d6;
}
.profile-modal-setting .modal-close-btn {
  position: absolute;
  width: 24px;
  height: 24px;
  top: 20px;
  right: 20px;
  background: url(~@/assets/img/icon/icon_modal_close.svg) no-repeat;
  cursor: pointer;
}
</style>