<!--
@File(Method): HelpUpload.vue
@Author: -
@Date Created: -
@Description: 고객센터 > 서비스 제안하기 > 제안서 파일첨부
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
-->

<template>
  <div class="input-cont input-attach">
    <div class="input-title">{{ title }}</div>
    <div class="upload-file-btn">
      <input
        type="file"
        ref="attach"
        @change="upload"
        multiple
        style="display:none"
      />
      <button class="btn-bg-w2" @click="upload(null)">찾아보기</button>
      <span class="attach-guidetxt">최대 5개, 전체 업로드 파일 용량 50MB 미만
        <template
          v-if="totalAttachFileSizeByte > 0"
        >
          / 첨부된 파일 용량:
          <span
            :class="{
              'ft-blue': totalAttachFileSizeMB < 50,
              'ft-orange': totalAttachFileSizeMB > 49
            }"
          >
            {{ totalAttachFileSizeStr }}
          </span>
        </template>
      </span>
    </div>
    <div class="attach-file-wrap">
      <div
        class="attaching-file q-attach-file"
        v-for="item in fileData"
        :key="item.fileOriginalPath"
      >
        <span>{{ item.fileName }}</span>
        <button class="delete-btn" @click="fileDelete(item)"></button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'hiClass_Help_Upload',
  props: {
    files: {
      type: Array
    },
    param: {
      type: Object
    },
    title: {
      type: String,
      default() {
        return '첨부파일'
      }
    }
  },
  data() {
    return {
      option: {
        fileMb: 1024 * 1024,
        fileStatus: Object.assign(
          {
            size: null,
            limit: null,
            accept: null
          },
          this.param
        )
      }
    }
  },
  computed: {
    fileData: {
      get() {
        return this.files
      },
      set(val) {
        this.$emit('update:files', val)
      }
    },
    inCompatibleExtensions() {
      return this.$store.state.inCompatibleExtensions || []
    },
    isOverLimitFileSize() {
      return this.totalAttachFileSizeMB >= this.option.fileStatus.size
    },
    totalAttachFileSizeByte() {
      if (this.files.length === 0)
        return 0
      else {
        let initialValue = 0
        const sum = this.files.reduce(
          (accumulator, currentValue) =>
            accumulator + currentValue.fileSize, initialValue
        )

        return sum > 0 ? sum : 0
      }
    },
    totalAttachFileSizeMB() {
      return this.totalAttachFileSizeByte > 0
        ? Math.ceil(this.totalAttachFileSizeByte / 1024 / 1024)
        : 0
    },
    totalAttachFileSizeStr() {
      const sizeByte = this.totalAttachFileSizeByte
      const sizeKB = Math.floor(sizeByte / 1024)
      const sizeMB = Math.floor(sizeKB / 1024)
      const sizeGB = Math.floor(sizeMB / 1024)

      if (sizeGB > 0) {
        return `${sizeGB + 1} GB`
      } else if (sizeMB > 0) {
        return `${sizeMB + 1} MB`
      } else if (sizeKB > 0) {
        return `${sizeKB + 1} KB`
      } else {
        return `${sizeByte} Byte`
      }
    }
  },
  mounted() {
  },
  methods: {
    async upload(e) {
      if (e === null) {
        this.$refs.attach.value = ''
        this.$refs.attach.click()
      } else {
        let isChk = true
        const postApi = []
        let errMsg = 'upload error'
        
        try {
          const files = Array.from(e.target.files || e.dataTransfer.files)

          const isNotAllowExtensions = this.$store.state.isNotAllowExtensions
          if(files.some(f => isNotAllowExtensions.includes(f.name.substring(f.name.lastIndexOf('.') + 1, f.name.length).toLowerCase()))) {
            this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
            return;
          }

          if (this.option.fileStatus.limit) {
            if (
              files.length + this.fileData.length >
              this.option.fileStatus.limit
            ) {
              isChk = false
              errMsg = `최대 ${this.option.fileStatus.limit}개 까지 첨부 가능합니다.`
              this.$hiClass.alert(errMsg)
              return false  // try ... catch 절 빠져나감. finally 실행.
            }
          }

          for (let i = 0; i < files.length; i++) {
            if (this.option.fileStatus.size) {
              let maxSize = this.option.fileStatus.size * this.option.fileMb
              if (files[i].size > maxSize) {
                isChk = false
                i = files.length
                errMsg = `최대 ${this.option.fileStatus.size}MB 까지 허용 가능합니다.`
                this.$hiClass.alert(errMsg)
                return false
              }
            }

            if (this.option.fileStatus.accept) {
              if (
                !(
                  Array.isArray(this.option.fileStatus.accept) &&
                  this.option.fileStatus.accept.includes(files[i].type)
                )
              ) {
                isChk = false
                i = files.length
                errMsg = `${this.option.fileStatus.accept.join(',')} 확장자만 등록 가능 합니다.`
                this.$hiClass.alert(errMsg)
                return false
              }
            }

            // 미지원 파일확장자 체크
            if (files[i] && files[i].name) {
              const extension = this.$comn.split(files[i].name, '.')
              if (this.isInCompatibleExtensions(extension)) return false
            } else {
              return false
            }
            // -- 미지원 파일확장자 체크

            if (isChk) {
              // 이미지일 경우 업로드 전 리사이즈 처리 추가
              const convertedFile = await this.$hiClass.getConvertedFile(files[i])
              postApi.push(this.$hiClass.multipart.upload(convertedFile))
            }
          }
          
        } catch (e) {
          this.$log.warn(e)
        } finally {
          // 첨부파일 분석 완료되었으므로 input value 삭제
          this.$refs.attach.value = null
        }

        if (isChk) {
          this.$emit('setLoading', true)

          Promise.all(postApi)
            .then(res => {
              res.map(item => {
                item = item.data

                let fileConvertPath = null
                let fileThumbnailPath = null

                try {
                  if (item._links.convert && item._links.convert.href)
                    fileConvertPath = item._links.convert.href
  
                  if (item._links.thumbnail && item._links.thumbnail.href)
                    fileThumbnailPath = item._links.thumbnail.href
                  
                } catch (error) {
                  this.$log.debug(error)
                }

                let fileInfo = {
                  fileName: item.filename.replace(/^.*[\\/]/, ''),
                  fileSize: item.size,
                  fileOriginalPath: item._links.original.href,
                  fileContentType: item.contentType
                }

                if (fileConvertPath !== null)
                  fileInfo.fileConvertPath = fileConvertPath
  
                if (fileThumbnailPath !== null) {
                  fileInfo.fileThumbnailPath = fileThumbnailPath
                } else if (item.contentType.indexOf('video') > -1) {
                  fileInfo.fileThumbnailPath = this.$store.state.videoThumbnailDefault
                }

                this.fileData.push(fileInfo)
              })
            })
            .catch(err => {
              this.$log.debug(this.$options.name, ' upload() error => ', err)
            })
            .finally(() => {
              this.$refs.attach.value = null
              this.$emit('setLoading', false)
            })
        } else {
          this.$refs.attach.value = null
          this.$emit('setLoading', false)
        }
      }
    },
    fileDelete(file) {
      this.fileData = this.fileData.filter(item => {
        return item.fileOriginalPath !== file.fileOriginalPath
      })
    },
    isInCompatibleExtensions(extension) {      
      if (this.inCompatibleExtensions.includes(extension)) {          
        this.$hiClass.alert(`미지원하는 파일의 형식 : ${extension}`)
        this.$refs.attach.value = null
        this.$emit('setLoading', false)
        return true
      } else {
        return false
      }
    }
  }
}
</script>
<style scoped>
.attach-guidetxt{
    font-size: 13px;
    transform: skew(0.2deg);
    display: inline-block;
    margin-left: 20px;
    color:#666;
}
</style>
