<!--
@File(Method): ProfileImageEdit.vue
@Date Created: 2024-12-12
@Description: 대표 이미지 편집 모달 
@Modified: 2025-03-05 - #72684 프로필 이미지 아바타(HiAvatar) 구축 및 적용
-->
<template>
  <HiModal class="profile-image-edit" type="type01" size="sm" @close="cancel">
    <template v-slot:heading>대표 이미지 수정</template>
    <template v-slot:content> 
      <div>
        <HiAvatar    
          class="mt-10"        
          type="profile"
          size="xl" 
          outline
          :img="profileImage.imageBackgroundPath ? profileImage.imageBackgroundPath : null"
          :color="profileImage.imageBackgroundColor ? profileImage.imageBackgroundColor : null"
        >              
          <template v-slot:txt>
            <div
              class="txt"
              :class="{'dim': profileImage.imageBackgroundPath && profileImage.imageTitle}"
              v-html="textPreview"
            >
            </div>
          </template>
        </HiAvatar>
        <!-- 프로필 이미지 캡쳐 -->
        <div class="sr-only">
          <canvas id="profile-canvas" width="1123" height="1123"></canvas>
        </div>
        <div class="info">
          <div class="tit">
            표기명
          </div>
          <div class="input-box-wrap">
            <input type="text" :value="profileImage.imageTitle" @input="profileImage.imageTitle = $event.target.value; inputProfileImageTitle()">
          </div>
        </div>
        <div class="info">
          <div class="tit">
            배경 컬러 선택
          </div>
          <div class="color-picker">
            <div class="color-list">
              <HiButton
                  color="link"
                  class="color-item"
                  :class="{'active' : color === profileImage.imageBackgroundColor}"
                  v-for="(color,index) in profileImageBgColor"
                  :key="index"
                  :style="`background-color:${color};`"
                  @click="colorPick(color)"
              >
              </HiButton>
              <HiButton color="link" class="color-item upload" @click="openFileExplorer">
                <HiIcon name="ico-photo-fill" color="default"/>
              </HiButton>
              <input hidden type="file" ref="fileUpload" @change="addImage" accept="image/*"/>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <HiButton color="line-light-primary" size="lg" @click="cancel">취소</HiButton>
      <HiButton color="primary" size="lg" @click="saveProfileImage" :disabled="!isChange">저장</HiButton>
    </template>
  </HiModal>
</template>

<script>
import {eventBus} from "@/main";
import {mapActions, mapState} from "vuex";
import {mapFields} from "vuex-map-fields";
import Graphemer from 'graphemer';
import { EXTERNAL_LINKS } from '@/constants/externalAssets';
const splitter = new Graphemer();

export default {
  name: "profile-image-edit",
  data() {
    return {
      originalProfileImage: {
        imageBackgroundColor: '',
        imageBackgroundPath: '',
        imagePath: '',
        imageTitle: ''
      },
      prevImageTitle: ''
    }
  },
  props: {
    profileImage: {
      type: Object
    },
    profileType: {
      type: String,
      required: true
    },
    emptyImage: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapState([
      'profileImageBgColor'
    ]),
    ...mapFields([
      'isDimLoading'
    ]),
    isChange() {
      return Object.keys(this.profileImage).some(key => this.profileImage[key] !== this.originalProfileImage[key])
    },
    needsLineBreak() {
      return this.profileImage.imageTitle && splitter.splitGraphemes(this.profileImage.imageTitle).length > 3 && !/^[0-9]{1,2}-[0-9]{1,2}$/.test(this.profileImage.imageTitle)
    },
    textPreview() {
      return this.needsLineBreak ?
          `${splitter.splitGraphemes(this.profileImage.imageTitle).slice(0, 2).join('')}<br>${splitter.splitGraphemes(this.profileImage.imageTitle).slice(2).join('')}`
          : this.profileImage.imageTitle
    }
  },
  mounted() {
    eventBus.$on(`imageEditor-add-Profile-image`,async uploadFileList => {
      this.isDimLoading = true
      const newBgImagePath = await this.upload(uploadFileList[0].file)
      if (this.profileImage.imageBackgroundPath && !this.profileImage.imageBackgroundPath.includes('download.hiclass.net/static')) {
        this.deleteUnusedFiles(this.profileImage.imageBackgroundPath)
      }
      this.profileImage.imageBackgroundPath = newBgImagePath
      this.profileImage.imageBackgroundColor = null
      this.isDimLoading = false
    })

    for (let [key, value] of Object.entries(this.profileImage)) {
      this.originalProfileImage[key] = value
    }
  },
  beforeDestroy() {
    eventBus.$off('imageEditor-add-Profile-image')
  },
  methods: {
    ...mapActions('storeImageEditor', [
      'openImageEditor'
    ]),
    ...mapActions('storeClazzes', ['generateProfileImage']),
    colorPick(color) {
      if (this.profileImage.imageBackgroundPath && !this.profileImage.imageBackgroundPath.includes('download.hiclass.net/static')) {
        this.deleteUnusedFiles(this.profileImage.imageBackgroundPath)
      }
      this.profileImage.imageBackgroundColor = color
      this.profileImage.imageBackgroundPath = null
    },
    inputProfileImageTitle() {
      if (splitter.splitGraphemes(this.profileImage.imageTitle).length > 4) {
        this.profileImage.imageTitle = this.prevImageTitle
      }
      this.profileImage.imageTitle = this.profileImage.imageTitle.replace(/ /g,'')
      this.prevImageTitle = this.profileImage.imageTitle
    },
    openFileExplorer() {
      this.$refs.fileUpload.click()
    },
    async addImage(e) {
      if (e === null) {
        this.openFileExplorer()
        return
      }

      let files = e.target.files
      const isNotAllowExtensions = this.$store.state.isNotAllowExtensions
      if (isNotAllowExtensions.includes(files[0].name.split('.').pop().toLowerCase())) {
        this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
        return
      }

      await this.openImageEditor({
        uploadedFiles: null,
        inputFiles: files,
        imageLimitCount: 1,
        componentKey: 'add-Profile-image',
        targetIdx: 0,
        parentComponent: 'ProfileImageEdit'
      })

      this.$refs.fileUpload.value = ''
    },
    async upload(file) {
      const res = await this.$hiClass.multipart.upload(file)
      return res.data._links.original.href
    },
    async saveProfileImage() {
      if (this.profileImage.imageTitle !== null && this.profileImage.imageTitle.trim() === '') {
        this.profileImage.imageTitle = null
      }

      let fileOriginalPath = null
      // 이미지만 올렸을때
      if (this.profileImage.imageBackgroundPath && this.profileImage.imageBackgroundPath.includes('download.hiclass.net') && !this.profileImage.imageTitle) {
        fileOriginalPath = this.profileImage.imageBackgroundPath
      } else {
        this.isDimLoading = true
        let generatedImage = await this.generateProfileImage(
            { profileText: this.profileImage.imageTitle, profileBgColor: this.profileImage.imageBackgroundColor, profileBgImage: this.profileImage.imageBackgroundPath })

        fileOriginalPath = this.profileType === 'STUDENT' || generatedImage !== null ?
          generatedImage :
          EXTERNAL_LINKS.IMAGES.DEFAULT_CLASS
        this.isDimLoading = false
      }

      this.$emit('updateProfileImage', fileOriginalPath)
      this.$emit('close')
    },
    deleteUnusedFiles(unUsedFilePath) {
      if (this.originalProfileImage.imageBackgroundPath !== unUsedFilePath) {
        this.$hiClass.multipart.delete({ fileOriginalPath: unUsedFilePath })
      }
    },
    cancel() {
      for (let [key, value] of Object.entries(this.originalProfileImage)) {
        this.profileImage[key] = value
      }
      this.$emit('close')
    }
  }     
}
</script>

<style lang="scss" scoped>
.profile-image-edit{
  ::v-deep .modal__layer{overflow: hidden;}
  .avatar-img:not(.capture){
    .img-area .txt{
        font-size: 35px;
        &.word4{
          padding: 15px;
        }
      }
  }
  .info{
    margin-top: 35px;
    .tit{
      text-align: left;
      font-size: 15px;
      font-weight: 500;
      margin-bottom: 15px;
    }
  }
}

</style>