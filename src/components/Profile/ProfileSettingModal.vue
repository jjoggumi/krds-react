<!--
@File(Method): ProfileSettingModal.vue
@Description: 클래스 생성 후 프로필 설정 / 클래스 설정 > 내 프로필 관리 >  내 프로필 수정
@Modified: 2025-10-27 - #82529 isBtnClose에 따라 닫기버튼 유무(클래스 생성 후 프로필 설정 모달에서는 닫기버튼 없음)
-->
<template>
    <HiModal class="profile-modal-setting" type="type01" size="sm" :closeSkip="isBtnClose===false"
      @close="close" id="profileSettingModal">
      <template v-slot:heading>
        프로필 설정
        <p class="smr">클래스에서 사용할 프로필을 선택하세요.</p>
      </template>
      <template v-slot:content> 
        <div class="content-wrap">
          <div class="content-wrap__selected">
            <!-- <div class="photo-wrap">
              <p class="photo">
                  <img :src="selectItem.profilePhoto || defaultImage" />
              </p>
              <button @click="editProfile">
                  <span class="modify_transparent"></span>
              </button>
            </div> -->
            <HiAvatar         
              size="xl" 
              outline
              :img="selectItem.profilePhoto ? selectItem.profilePhoto : null"
            >              
              <template v-slot:badge>
                <HiIcon
                  name="ico-pen2" color="white" bgColor="default" rounded="rounded"
                  outline
                  class="bottom-right"
                  @click.native="editProfile"
                  role="button"
              ></HiIcon>
              </template>
            </HiAvatar>

            <div class="name-wrap">
              <span class="name">{{ selectItem.profileName }}</span>
              <span class="type">
                {{ userInfoName ? `${userInfoName} ` : "" }}{{ loginUserType }}
              </span>
            </div>
          </div>
          <div class="content-wrap__choice">
            <div 
              v-for="item of list"
              :key="`profile-${item.profileId}`"
              class="choice-wrap"
              :class="{
                'on': selectItem.profileId === item.profileId
              }"
              @click="onSelectItem(item)"
            >
              <p class="photo">
                  <img :src="item.profilePhoto || defaultImage" />
                  <span class="basic" v-if="item.isDefault">기본</span>
              </p>
              <div class="name">
                {{ item.profileName }}
              </div>
              <p class="check">
                <input type="radio" :name="`choice-profile-${item.profileId}`" :id="`choice-profile-${item.profileId}`" :checked="selectItem.profileId === item.profileId" />
                <label :for="`choice-profile-${item.profileId}`"></label>
              </p>
            </div>
            <div class="add-wrap" v-if="isAdd" @click="addProfile">
              <p class="photo"></p>
              <div class="name">
                  프로필<br/>추가
              </div>
            </div>
          </div>
          <ProfileAddModal v-if="isProfileAddModal"
            :classId="classId"
            :addItem="addItem"
            :whereMode="mode"
            @submit="submitProfileAdd"
            @close="closeProfileAddModal"
          />
        </div>
      </template>
      <template v-slot:footer>
        <HiButton color="primary" size="lg" block @click="submit" >선택 완료</HiButton>       
      </template>
    </HiModal>
</template>

<script>
import ProfileAddModal from '@/components/Profile/ProfileAddModal.vue';
import {mapFields} from "vuex-map-fields";
import {mapMutations, mapState} from 'vuex'

export default {
  name: 'profile-setting-modal',
  components: {
    ProfileAddModal
  },
  props: {
    classId: String,
    isBtnClose: { type: Boolean, default: true },
    profileId: String,
    mode: String,
    path: String,
    userInfoName: String
  },
  computed: {
    ...mapFields({
      isDimLoading: 'isDimLoading',
    }),
    ...mapState({
      isClassCreatedNew: 'isClassCreatedNew',
      curClassItem: 'curClassItem'
    }),
    ...mapState('storeClazzes', {
      classUser: 'classUser'
    }),
    user() {
      return this.$store.state.user
    },
    isUserTeacherType() {
      if(this.user.userType === 'TEACHER') {
        if(this.path) {
          if(this.path === "class") {
            if(this.classUser.userType === "TEACHER") {
              return true
            } else {
              return false
            }
          } else {
            return false
          }
        } else {
          return true
        }
      } else {
        return false
      }
    },
    loginUserType() {
      let loginUserType = null
      
      if(this.path) {
        if(this.path === "class") {
          switch (this.classUser.userType) {
            case 'TEACHER':
              loginUserType = ' 선생님'
              break
            case 'PARENTS':
              loginUserType = ' 학부모'
              break
            case 'STUDENT':
              loginUserType = ' 학생'
              break
          }
        } else {
          switch (this.user.userType) {
            case 'TEACHER':
              loginUserType = ' 학부모'
              break
            case 'PARENTS':
              loginUserType = ' 학부모'
              break
            case 'STUDENT':
              loginUserType = ' 학생'
              break
          }
        }
      } else {
        switch (this.user.userType) {
          case 'TEACHER':
            loginUserType = ' 선생님'
            break
          case 'PARENTS':
            loginUserType = ' 학부모'
            break
          case 'STUDENT':
            loginUserType = ' 학생'
            break
        }
      }
      return loginUserType
    },
    isAdd() {
      return this.list.length >= 3 ? false : true
    }
  },
  data() {
    return {
      selectItem: {},
      list: [],
      isProfileAddModal: false,
      addItem: {
        mode: "write",
        item: {}
      },
      defaultImage: '/files/img/profile_default.png'
    }
  },
  methods: {
    ...mapMutations({
      setIsClassCreatedNew: 'setIsClassCreatedNew'
    }),
    ...mapMutations('storeClazzes', {
      setClassUser: 'setClassUser'
    }),
    async getProfiles() {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/users/profiles`
        })

        this.list = _.cloneDeep(res.data._embedded.userProfiles).map(item => {
          if(!item.profilePhoto) item.profilePhoto = null
          return item
        })

        if(_.isEmpty(this.selectItem)) {
          if(this.profileId) {
            this.selectItem = this.list.find(v => v.profileId === this.profileId)
            if(!this.selectItem) {
              this.selectItem = this.list[0]
            }
          } else {
            this.selectItem = this.list[0]
          }
        }

        if(this.classUser.userType === "STUDENT") {
          this.setClassUser({
            ...this.classUser,
            profileId: this.selectItem.profileId,
            userName: this.selectItem.profileName,
            userPhoto: this.selectItem.profilePhoto
          })
        }
      } catch (err) {
        this.$log.debug('getProfiles GET() error => ', err)
      }
    },
    onSelectItem(item) {
      this.selectItem = item
    },
    addProfile() {
      this.addItem.mode = "write"
      this.addItem.item = {}
      this.openProfileAddModal()
    },
    editProfile() {
      this.addItem.mode = "edit"
      this.addItem.item = _.cloneDeep(this.selectItem)
      this.openProfileAddModal()
    },
    openProfileAddModal() {
      this.isProfileAddModal = true
    },
    closeProfileAddModal() {
      this.isProfileAddModal = false
    },
    submitProfileAdd(item, mode) {
      const isProfileImage = (profile) =>  profile.profilePhoto && profile.profilePhoto.includes('download.hiclass.net')
      if(mode === "write") {
        item.profilePhoto = isProfileImage(item) ? item.profilePhoto : null
        this.list.push(item)
        this.closeProfileAddModal()
      } else {
        this.selectItem.profileName = item.profileName
        this.selectItem.profilePhoto = isProfileImage(item) ? item.profilePhoto : null
        this.closeProfileAddModal()
      }
    },
    async submit() {
      if(this.mode === 'init' && !this.isUserTeacherType) {
        this.isDimLoading = false
        this.$emit("submit", this.selectItem.profileId)
        return
      }
      this.isDimLoading = true

      try {
        const res = await this.$axios({
          method: 'PUT',
          url: `/users/profiles/class/${this.classId}`,
          data: {
            profileId :this.selectItem.profileId
          }
        })

        if(this.mode === 'init') {
          if(this.isUserTeacherType) {
            setTimeout(() => {
              this.setIsClassCreatedNew(true)
              this.isDimLoading = false
              this.$router.push(`/main/clazzes/${this.classId}`)
              this.$toasted.show('클래스를 생성하였습니다.', { duration: 1500 })
            }, 2000)
          } else {
            this.isDimLoading = false
            this.$emit("submit")
          }
        } else {
          this.isDimLoading = false
          let profileId = res.data.isDefault ? null : res.data.profileId

          this.setClassUser({
            ...this.classUser,
            profileId: profileId,
            userName: res.data.profileName,
            userPhoto: res.data.profilePhoto
          })

          if(this.curClassItem.classOwner.currentId === this.classUser.userId) {
            this.curClassItem.classOwner.profileId = profileId
            this.curClassItem.classOwner.userName = res.data.profileName
            this.curClassItem.classOwner.userPhoto = res.data.profilePhoto
          }

          this.$emit("closeProfileSettingModal")
        }
      } catch (err) {
        this.isDimLoading = false
        this.$log.debug('profileSetting submit PUT() error => ', err)
      }
    },
    close() {
      this.$emit("closeProfileSettingModal")
    }
  },
  mounted() {
    this.getProfiles()
  }
}
</script>
<style scoped lang="scss">
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
.avatar-img.lg{
  width:66px;
  height:66px;
  min-width: 66px;
  min-height: 66px;
}

</style>