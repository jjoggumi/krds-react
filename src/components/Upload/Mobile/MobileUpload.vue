<!--
@File(Method): MobileUpload.vue
@Date Created: -
@Description: 1:1문의하기 > 쓰기 > 파일 업로드
@Modified: 2024-12-17 - #70648 1:1문의하기 웹뷰
-->

<template>
  <div>
    <!-- <div class="input-title">{{ title }}</div> -->

          <div class="filebox">
      <label
        v-if="files.length < $store.state.upload.help.limit"
        for="ex_file"
      >
      <HiIcon class="mr-05" name="ico-plus" size="18" color="primary"/>
        첨부파일 추가
      </label>
      <input
        type="file"
        id="ex_file"
        ref="attach"
        @change="upload"
        :disabled="fileUploadLoading"
        multiple
      />
    </div>
    
    <ul class="m-attachfile-list" v-if="totalAttachFileSizeByte > 0">
      <li class="info">
        첨부된 파일 용량 : 
        <span
          :class="{
            'ft-blue': totalAttachFileSizeMB < 50,
            'ft-orange': totalAttachFileSizeMB > 49
          }"
        >
          {{ totalAttachFileSizeStr }}
        </span>
      </li>
      <li
        v-for="(item, index) of fileData"
        :key="`${item.fileOriginalPath}-${index}`"
      >
      <HiIcon class="mr-05 p-00" name="ico-clip" size="18" color="default"/>
      <span>{{ item.fileName }}</span>
      <button class="m-btn-delete"  @click="fileDelete(item)">삭제</button>
      </li>
    </ul>    
    <p>
      - 첨부 파일은 최대 {{ $store.state.upload.help.size }}MB 이내, 최대 {{ $store.state.upload.help.limit }}개까지 첨부 가능합니다.      
    </p>
  </div>
</template>

<script>
export default {
  name: 'mobile-upload',
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
    },
    fileUploadLoading: {
      type: Boolean
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
    },
    compatibleExtensions() {
      return ['jpeg', 'jpg', 'png', 'gif', 'avi', 'wav', 'mp4', 'aac']
    },
    acceptMimeTypes() {
      const images = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      const audios = ['audio/wav', 'audio/mp3']
      const videos = ['video/avi', 'video/mp4', 'video/mov']

      return images.concat(audios).concat(videos).join(',')
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    async upload(e) {
      if (this.fileUploadLoading) return false

      if (e === null || e === undefined) {
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
                errMsg = `${this.option.fileStatus.size}MB 이내만 등록 가능합니다.`
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

            // 지원 파일확장자 체크
            // if (files[i] && files[i].name) {
            // const extension = this.$comn.split(files[i].name, '.')
            // if (this.isInCompatibleExtensions(extension)) return false
            // } else {
            //   return false
            // }
            // -- 지원 파일확장자 체크

            if (isChk) {
              // 이미지일 경우 업로드 전 리사이즈 처리 추가
              this.$emit('setLoading', true)
              const convertedFile1 = await this.$hiClass.getConvertedFile(files[i])
              const convertedFile2 = await this.$hiClass.getConvertedFile(files[i])

              const size1 = this.byteCalculation(convertedFile1.size)
              const size2 = this.byteCalculation(convertedFile2.size)

              if (size1 === size2) {
                postApi.push(this.$hiClass.multipart.upload(convertedFile1))
              } else {
                postApi.push(this.$hiClass.multipart.upload(convertedFile2))
                // 리사이징 테스트 alert
                // isChk = false
                // errMsg = `이미지 리사이징이 정상 처리되지 않았습니다. 다시 한번 확인해주세요.`
                // this.$hiClass.alert(errMsg)
                // this.$emit('setLoading', false)
                // return false
              }

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
      if (!this.compatibleExtensions.includes(extension)) {
        this.$hiClass.alert(`미지원하는 파일의 형식 : ${extension}`)
          .then(() => {
            this.$refs.attach.value = null
            this.$emit('setLoading', false)
          })
        return true
      } else {
        return false
      }
    },

    byteCalculation(bytes) {
      const parseBytes = parseInt(bytes)
      const calcArr = ['byte', 'KB', 'MB', 'GB', 'TB', 'PB']
      try {
        const computedValue = Math.floor(Math.log(parseBytes) / Math.log(1024))
        if (computedValue.toString() === "-Infinity") {
          return "0 " + calcArr[0]
        } else {
          return (parseBytes / Math.pow(1024, Math.floor(computedValue))).toFixed(2) + " " + calcArr[computedValue]
        }
      } catch (e) {
        return "0 " + calcArr[0]
      }
    },

  }
}
</script>
<style lang="scss" scoped>

</style>
