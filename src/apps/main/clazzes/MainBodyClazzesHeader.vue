<!--
@File(Method): MainBodyClazzesHeader.vue
@Date Created: 2024-12-12
@Description: 클래스 > 상단 > 클래스
@Modified: 2025-03-05 - #72684 프로필 이미지 아바타(HiAvatar) 구축 및 적용
-->
<template>
  <div class="cont-box-top-inner">
    <div class="class-top-heading">
      <div class="info">
        <HiAvatar
          class="image"
          type="class"
          size="lg" 
          :img="curClassImagePath ? getThumbnail(curClassImagePath) : null"
        >              
          <template v-slot:badge>
            <HiIcon
              v-if="isCurClassOwnerOrManager"
              name="ico-pen2"
              color="white"
              rounded="rounded"
              class="bottom-right"
              @click.native="openProfileImageEdit"
              role="button"
          ></HiIcon>
          </template>
        </HiAvatar>
        <!-- #72684 프로필 이미지 아바타(HiAvatar) 적용 전
        <div class="avatar-img lg image class">
          <div
              class="img-area"
              :style="{'background-image': curClassImagePath ? 'none' : '~@/assets/img/icon/school_default.png'}"
          >
            <img v-if="curClassImagePath" :src="getThumbnail(curClassImagePath)" alt="">
          </div>          
          <HiIcon
              v-if="isCurClassOwnerOrManager"
              name="ico-pen2"
              color="white"
              size="18"
              rounded="rounded"
              class="bottom-right"
              @click.native="openProfileImageEdit"
              role="button"
          ></HiIcon>
        </div>
        -->
        <strong class="heading">
          {{ infoTitle }}
          <span v-if="!isCurClassActivated" class="label noadmin">미운영</span>
        </strong>
        <span v-if="isExistClassYear">{{ classYearStr }}</span>
        <span>{{ curClassOwnerName }} 선생님</span>
        <span>구성원 {{ memberCount }}명</span>
      </div>

      <div
        v-if="isShowMemberManagementButton || isShowInviteButton"
        class="group-btn"
      >
        <button
          v-if="isShowMemberManagementButton"
          class="hi-btn btn-line-white btn-md btn-member"
          @click="onClickMemberManagement"
        >
          구성원 관리
        </button>
        <button
          v-if="isShowInviteButton"
          class="hi-btn btn-line-white btn-md btn-invite"
          @click="onClickInvite"
        >
          초대하기
        </button>
      </div>
    </div>    
    <!-- #69538 프로필 이미지 수정 모달 -->
    <profile-image-edit
        v-if="isProfileImageEdit === true"
        :profileImage="profileImage"
        :profileType="'CLASS'"
        @close="isProfileImageEdit = false"
        @updateProfileImage="updateProfileImage"
    />
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";
import {eventBus} from "@/main";
import ProfileImageEdit from '@/components/Modal/ProfileImageEdit.vue'

export default {
  name: 'main-body-clazzes-header',
  components: {
    ProfileImageEdit,
  },
  props: {},
  data() {
    return {
      option: {
        loading: {
          applyParent: false,
          acceptParent: false,
          applyStudent: false,
          acceptStudent: false
        }
      },
      isProfileImageEdit: false,
      profileImage: {
        classImagePath: '',
        imageBackgroundColor: '',
        imageBackgroundPath: '',
        imageTitle: ''
      },
      memberCount: 0
    }
  },
  computed: {
    ...mapState([
      'user',
      'curClassItem'
    ]),
    ...mapGetters([
      'isCurClassActivated',
      'isCurClassOwnerOrManager',
      'curClassId',
      'curClassName',
      'curClassOwnerName',
      'curClassImagePath'
    ]),
    isExistClassYear() {
      return !(this.curClassItem.classYear === undefined || this.curClassItem.classYear === 'ANY')
    },
    isShowMemberManagementButton() {
      return this.isCurClassOwnerOrManager
    },
    isShowInviteButton() {
      return this.isCurClassOwnerOrManager && this.isCurClassActivated
    },
    classYearStr() {
      return this.curClassItem.classYear + '년'
    },
    infoTitle() {
      return this.curClassName
        ? this.$stringUtil.shorteningByLength(this.curClassName, 80)
        : 'OO초등학교 O학년 O반'
    },
  },
  mounted() {
    this.getClazzProfileImage()
    this.loadMembersCount()
  },
  methods: {
    onClickMemberManagement() {
      const nextPath = `/main/clazzes/${this.$route.params.id}/member`
      this.$router.push(nextPath, () => {
      })
    },
    onClickInvite() {
      const nextPath = `/main/clazzes/${this.$route.params.id}/invite`
      this.$router.push(nextPath, () => {
      })
    },
    async openProfileImageEdit() {
      await this.getClazzProfileImage()
      this.isProfileImageEdit = true
    },
    async getClazzProfileImage() {
      try {
        const res = await this.$axios.get(`/clazzes/${this.curClassId}/profileimage`)
        this.profileImage = res.data

        if (!res.data.imageBackgroundPath && !res.data.imageBackgroundColor) {
          this.profileImage.imageBackgroundPath = res.data.classImagePath
        }
      } catch (err) {
        this.$log.debug(err)
      }
    },
    async updateProfileImage(fileOriginalPath) {
      try {
        if (fileOriginalPath.trim().length === 0) return

        this.profileImage.classImagePath = fileOriginalPath
        const oldClassImagePath = this.curClassItem.classImagePath
        const res = await this.$axios.patch(`/clazzes/${this.curClassId}/profileimage`, this.profileImage)
        for (const [key, value] of Object.entries(res.data)) {
          this.curClassItem[key] = value
        }
        this.$hiClass.multipart.delete({ fileOriginalPath: oldClassImagePath })
        this.isProfileImageEdit = false
      } catch (err) {
        this.$log.debug(err)
      }
    },
    getThumbnail(imagePath) {
      return imagePath.split('.').pop().toLowerCase() === 'gif' ?
          imagePath :
          `${imagePath.replace('download.hiclass.net', 'image.hiclass.net')}?width=120&height=120`
    },
    async loadMembersCount() {
      const { data: { page: { totalElements } } } = await this.$axios.post(`/clazzSubscribes/!q`, null, {
        params: {_clazz: `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.curClassId}`, _memberStatus: 'ACCEPT', size: 1}
      })
      this.memberCount = totalElements
    },
  },
}
</script>

<style lang="scss" scoped>
.avatar-img{
  .hi-ico{
    border:3px solid var(--primary);
    background:#001B51;
  }
}
</style>
