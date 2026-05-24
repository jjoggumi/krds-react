<template>
  <div class="hi-modal-common modal-flex" style="display: block;">
      <div class="modal__dim"></div>
      <div class="behavior-modal01">
          <div class="behavior-modal-student-edit-character">
              <div class="title-wrap">
                  <h2>캐릭터 변경</h2>
              </div>
              <div class="list-wrap">
                  <div class="photo" :class="{'is-photo': isPhoto}">
                      <p>
                          <img
                              :class="{'photo': isPhoto}"   
                              :src="selectedImageSrc" 
                          />
                      </p>
                      <button class="mt-10" @click="openFileExplorer">
                          <i class="bh-ic-camera-20"></i>직접변경
                          <input
                              type="file"
                              id="file"
                              ref="file"
                              accept=".jpg, .jpeg, .gif, .png, .bmp, .webp"
                              @change="handleFileUpload"
                              style="display:none"
                          />
                      </button>
                  </div>

                  <div class="list">
                      <p
                          v-for="character of characters"
                          :key="character.code"
                          @click="changeCharacter(character)"
                          :class="{
                              on: selectItem.code === character.code && !isPhoto
                          }"
                      >
                          <!-- <img :src="character.url" /> -->

                          <img :src="`https://download.hiclass.net/static/classroom/student/${character.code}_fullshot.png`" />
                      </p>
                  </div>
              </div>
              <div class="btn-wrap">
                  <button @click="closeModal(false)">취소</button>
                  <button @click="closeModal(true)">사용</button>
              </div>
          </div>
      </div>
      <confirm-modal
          v-if="confirmModal.isOpen"
          :title="confirmModal.title"
          :isAlert="confirmModal.isAlert"
          @closeConfirmDialog="closeConfirmModal"
      />
  </div>
</template>

<script>
import {mapActions, mapState} from 'vuex'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
import {eventBus} from "@/main";
export default {
  name: 'change-student-character-modal',
  components: {ConfirmModal},
  props: {
      current: Object
  },
  data() {
      return {
          selectItem: {
              code: '',
              url: '',
              photo: null
          },
          deleteImages: [],
          confirmModal: {
              isOpen: false,
              title: null,
              isAlert: true
          }
      }
  },
  computed: {
      ...mapState('storeBehavior', {
          characters: 'characters'
      }),
      isPhoto: function() {
          return this.selectItem.photo !== null
      },
      selectedImageSrc: function() {
          return this.isPhoto 
              ? this.selectItem.photo 
              : `https://download.hiclass.net/static/classroom/student/${this.selectItem.code}_fullshot.png`
      }
  },
  methods: {
      ...mapActions('storeImageEditor', {
        openImageEditor: 'openImageEditor'
      }),
      changeCharacter: function(character) {
          if(this.selectItem.photo) {
              this.deleteImages = [...this.deleteImages, this.selectItem.photo]
          }
          this.selectItem = {...character, photo: null}
      },
      closeModal: async function(isConfirm) {
          const deleteApis = isConfirm 
              ? this.deleteImages.map(s => this.$hiClass.multipart.delete({fileOriginalPath: s}))
              : this.deleteImages.filter(s => s !== this.current.photo).map(s => this.$hiClass.multipart.delete({fileOriginalPath: s}))
          
          await Promise.all(deleteApis)
          
          if(isConfirm) {
              this.$emit('close', this.selectItem)
          } else {
              if(this.selectItem.photo && this.selectItem.photo !== this.current.photo) {
                  await this.$hiClass.multipart.delete({fileOriginalPath: this.selectItem.photo})
              }
              this.$emit('close', null)
          }
      },
      validateFiles(file) {
          this.$refs.file.value = '';
          const imageExtensions = ['jpg', 'jpeg', 'gif', 'png', 'bmp', 'webp']
          const isImage = file.type.startsWith('image')
          const isExtensions = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length).toLowerCase()
          const maxFileSize = this.$store.state.upload.chat.etc.size * 1024 * 1024
          
          const isImageExtensions = imageExtensions.includes(file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length).toLowerCase())
                              
          if(!isImage || !isExtensions || !isImageExtensions) {
              this.confirmModal = {
                  isOpen: true,
                  action: 'file',
                  title: this.$t("chat.upload.invalid.alert"),
                  description: null,
                  isAlert: true
              }
              return false
          }

          if(file.size > maxFileSize) {
              const fileUploadErrorMessage = this.$t(
                  `file.upload.error.size.over.etc`,
                  {sizeStr: this.$store.state.upload.class.etc.sizeStr}
              )
              this.confirmModal = {
                  isOpen: true,
                  action: 'file',
                  title: fileUploadErrorMessage,
                  description: null,
                  isAlert: true
              }
              return false
          }
          return true
      },
      handleFileUpload: async function() {
          const file = this.$refs.file.files[0]
          
          if(this.validateFiles(file)) {
            if(this.selectItem.photo) {
              this.deleteImages = [...this.deleteImages, this.selectItem.photo]
            }

            await this.openImageEditor({
              uploadedFiles: null,
              inputFiles: [file],
              imageLimitCount: 1,
              componentKey: 'change-student-character-modal',
              targetIdx: 0,
              parentComponent: 'behaviorStudentProfileImage'
            })
          }
      },
      openFileExplorer: function() {
          this.$refs.file.click()
      },
      closeConfirmModal: async function() {
          this.confirmModal.isOpen = false
      }
  },
  created() {
      this.selectItem = {...this.current}
  },
  mounted() {
    eventBus.$on(`imageEditor-change-student-character-modal`,async uploadFileList => {
      const uploadInfo = await this.$hiClass.multipart.upload(uploadFileList[0].file)
      if (uploadInfo.data) {
        this.selectItem = {
          ...this.selectItem,
          photo: uploadInfo.data._links.original.href,
        }
      }
    })
  },
  beforeDestroy() {
    eventBus.$off(`imageEditor-change-student-character-modal`)
  }
}
</script>

<style>

</style>