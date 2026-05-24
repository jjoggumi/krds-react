<!--
@File(Method): MainBodyMypageInfoBodyProfileMulti.vue
@Description: 마이페이지 > 내 정보 관리 > 내 멀티 프로필 영역
@Modified: 2025-03-05 - #72684 프로필 이미지 아바타(HiAvatar) 구축 및 적용
@Modified: 2025-03-17 - #73034 프로필이미지에 기본 이미지 경로가 저장되는 문제
-->
<template>
  <div>
    <div class="privacy-info-box boundary-box login-info">
      <div class="left-wrap">
          <div class="box-title">내 멀티프로필</div>
          <div class="profile-thumbnail">
              <div class="circle"></div>
          </div>
      </div>
      <div class="right-wrap">
          <div class="info-category">
              <div class="profile"
                  v-for="item of list"
                  :key="`profile-${item.profileId}`"
              >
              <HiAvatar         
                  size="lg" 
                  outline
                  :img="item.profilePhoto ? item.profilePhoto : null"
                />        
                <!-- #72684 프로필 이미지 아바타(HiAvatar) 적용 전
                <div class="image">
                  <p class="photo">
                    <img :src="item.profilePhoto" />
                  </p>
                </div>
                -->
                <!--  #72684 프로필 이미지 아바타(HiAvatar) 적용 전 & #73034 프로필이미지에 기본 이미지 경로가 저장되는 문제
                <div class="image">
                    <p class="photo">
                      <img :src="item.profilePhoto || defaultImage" />
                    </p>
                  </div> -->                    
                  <div class="name">
                    <span class="user-name">{{ item.profileName }}</span>
                  </div>
                  <div class="btn-wrap">
                    <button @click="editProfile(item)">수정</button>
                    <button class="delete" @click="deleteProfile(item)">삭제</button>
                  </div>
              </div>
              <div class="profile add" v-if="isAdd">
                  <div class="image cursor-pointer" @click="addProfile">
                      <p class="photo"></p>
                  </div>
                  <div class="name">
                      <span class="user-name cursor-pointer" @click="addProfile">프로필 추가</span>
                  </div>
              </div>
          </div>
      </div>
    </div>

    <ProfileAddModal v-if="isProfileAddModal" 
      :addItem="addItem"
      :whereMode="'mypage'"
      @submit="submitProfileAdd"
      @close="closeProfileAddModal"
    />
  </div>
</template>

<script>
import ProfileAddModal from '@/components/Profile/ProfileAddModal.vue';

export default {
  name: "MainBodyMypageInfoBodyProfileMulti",
  components: {
    ProfileAddModal
  },
  props: {
  },
  computed: {
    isAdd() {
      return this.list.length >= 2 ? false : true
    }
  },
  data() {
    return {
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
    addProfile() {
      this.addItem.mode = "write"
      this.addItem.item = {}
      this.openProfileAddModal()
    },
    editProfile(item) {
      this.addItem.mode = "edit"
      this.addItem.item = _.cloneDeep(item)
      this.openProfileAddModal()
    },
    deleteProfile(item) {
      const message = this.getDeleteMessage()
      
      const opts = {
        confirmButtonText: '삭제',
        reverseButtons: true,
        confirmButtonColor: '#EC1F2D',
      }
      this.$hiClass.confirm(message, null, opts).then(() => {
        this.deleteProfileOk(item.profileId)
      })
    },
    getDeleteMessage() {
      let title = '이 프로필을 사용중인 클래스의 프로필이<br/>기본 프로필로 변경됩니다.<br/>삭제하시겠습니까?'

      let message = ``
      message += `<div class="modal-cont-inner">`
      message += `<div class="modal-title-wrap">`
      message += `<div class="title" style="margin:0;padding-bottom:0;">${title}</div>`
      message += `</div>`
      message += `</div>`

      return message
    },
    async deleteProfileOk(profileId){
      try {
        const res = await this.$axios({
          method: 'DELETE',
          url: `/users/profile/${profileId}`
        })

        this.list = this.list.filter(v => v.profileId !== res.data.profileId)
      } catch (err) {
        this.$log.debug('deleteProfileOk DELETE() error => ', err)
      }
    },
    openProfileAddModal() {
      this.isProfileAddModal = true
    },
    closeProfileAddModal() {
      this.isProfileAddModal = false
    },
    submitProfileAdd(item, mode) {
      const isProfileImage = (profile) =>  profile.profilePhoto && profile.profilePhoto.includes('download.hiclass.net')
      if (mode === "write") {
        item.profilePhoto = isProfileImage(item) ? item.profilePhoto : null
        this.list.push(item)
        this.closeProfileAddModal()
      } else {
        const obj = this.list.find(v => v.profileId === item.profileId)
        obj.profileName = item.profileName
        obj.profilePhoto = isProfileImage(item) ? item.profilePhoto : null
        this.closeProfileAddModal()
      }
    },
    async getProfiles() {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/users/profiles`
        })

        this.list = _.cloneDeep(res.data._embedded.userProfiles.filter(v => v.isDefault === false)).map(item => {
          if(!item.profilePhoto) item.profilePhoto = null
          return item
        })
      } catch (err) {
        this.$log.debug('getProfiles GET() error => ', err)
      }
    }
  },
  mounted() {
    // console.log("profilesettingmodal mounted user", this.user)
    this.getProfiles()
  }
}
</script>
<style lang="scss" scoped>
.avatar-img.lg{
  min-width: 66px;
  min-height: 66px;
  width: 66px;
  height: 66px;
}
</style>
