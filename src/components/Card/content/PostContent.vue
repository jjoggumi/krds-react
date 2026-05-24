<template>
  <div class="class-fr-editor">
    <div
      v-autolinker:[$className]="postContentEditor"
      @click="
        $hiClass.handleImageClick($event, postItem2, postItem);
        $hiClass.handleVideoClick($event, postItem);
      "
    ></div>
  </div>
</template>

<script>
import { mapState } from "vuex"

export default {
  name: 'post-content',
  components: {},
  props: {
    isManager: {
      type: Boolean,
      required: true
    },
    /**
     * props: post item object
     * ( post | clazzesPost | schoolsPost )
     */
    postItem: {
      type: Object,
      required: true
    },
    /**
     * props: post item type
     * ( POST | CLAZZES_POST | SCHOOLS_POST )
     */
    postItemType: {
      type: String,
      required: true
    },
  },
  data() {
    return {}
  },
  computed: {
    ...mapState({
      user: 'user',
      curClassSearchQuery: 'curClassSearchQuery',
    }),
    videoFiles() {
      return Array.isArray(this.postItem.files)
        ? this.postItem.files.filter(f => f.fileContentType.startsWith('video'))
        : []

    },
    imageFiles() {
      return this.postItem.files.filter(file => 
        file.fileContentType.indexOf('image') > -1 && 
        !file.fileOriginalPath === false
      )
    },
    postItem2() {
      const list = JSON.parse(JSON.stringify(this.postItem))
      list.files = list.files.filter(file => 
        file.fileContentType.indexOf('image') > -1 && 
        !file.fileOriginalPath === false
      )

      return list
    },
    // postContentEditor() {
    //   if (this.postItem.postContent === undefined || this.postItem.postContent === null)
    //     return null

    //   let postContentEditor = this.postItem.postContent

    //   try {
    //     const domParser = new DOMParser()
    //     const document = domParser.parseFromString(this.postItem.postContent, 'text/html')
    //     const editorElement = document.body.querySelector('.class-fr-editor')
    //     let videoElement = editorElement.querySelector('span.fr-video')
    //     const anchorElements = editorElement.querySelectorAll('p a[href*="://"]:not([target^="_blank"])')

    //     if (videoElement) {
    //       const videoNodes = editorElement.querySelectorAll('video, video source')

    //       if (videoNodes.length > 0) {
    //         let videoSrc = null

    //         for (const videoNode of videoNodes) {
    //           const src = videoNode.getAttribute('src')
    //           if (src) {
    //             videoSrc = src
    //             break
    //           }
    //         }

    //         const videoFile = this.videoFiles.find(d => videoSrc === d.fileOriginalPath || videoSrc === d.fileTranscodePath)
    //         if (videoFile) {
    //           this.setVideoElementThumbnail(document, videoElement, videoFile.fileThumbnailPath)

    //           // delete video tag
    //           const video = editorElement.querySelector('span.fr-video video')
    //           if (video)
    //             videoElement.removeChild(video)
    //         }
    //       }
    //     }

    //     for (const anchorElement of anchorElements) {
    //       anchorElement.setAttribute('target', '_blank')
    //       anchorElement.setAttribute('rel', 'noopener noreferrer')
    //     }

    //     postContentEditor = editorElement.innerHTML

    //   } catch (e) {
    //     this.$log.warn(e)
    //   }

    //   return postContentEditor || null
    // },
    postContentEditor() {
      if (this.postItem.postContent === undefined || this.postItem.postContent === null)
        return null

      // console.group(`${this.postItem.postTitle}`)

      // console.log("this.postItem", this.postItem)
      let postContentEditor = this.postItem.postContent
      try {
        const domParser = new DOMParser()
        const document = domParser.parseFromString(this.postItem.postContent, 'text/html')
        const editorElement = document.body.querySelector('.class-fr-editor')
        let videoElements = editorElement.querySelectorAll('span.fr-video video')
        const anchorElements = editorElement.querySelectorAll('p a[href*="://"]:not([target^="_blank"])')
        // console.log("this.videoFiles", this.videoFiles)
        const changeVideos = []
        const changeVideos2 = []
        const insertVideos = []
        for(const childOfvideoElement of videoElements) {
          const videoElement = childOfvideoElement.parentNode
          // console.log("videoElement", videoElement)
          const videoNode = videoElement.querySelector('source')
          const videoTagEl = videoElement.querySelector('video')
          let src = ""
          
          if(!videoTagEl === false) {
            insertVideos.push({
              videoNode: videoTagEl
            })
          }

          if(!videoNode === false) {
            src = videoNode.getAttribute('src')
            if(!src === true) {
              src = videoNode.getAttribute('poster')
            }
          } else {
            if(!videoTagEl === false) {
              src = videoTagEl.getAttribute('src')
              if(!src === true) {
                src = videoTagEl.getAttribute('poster')
              }
            }
          }

          if(src !== "") {
            const videoFile = this.videoFiles.find(
              d => src === d.fileOriginalPath || src === d.fileTranscodePath || src === d.fileThumbnailPath
            )
            //console.log("videoFile", videoFile)

            if(!videoFile === false) {
              const obj = {
                videoElement: videoElement,
                src: src,
                thumbnailPath: videoFile.fileThumbnailPath
              }

              changeVideos.push(obj)
            } else {
              let src2 = ""
              const videoNode2 = videoElement.querySelector('video')

              if(videoNode2) {
                //console.log("videoNode2", videoNode2)
                src2 = videoNode2.getAttribute('src')

                if(!src2 === true) {
                  src2 = videoNode2.getAttribute('poster')
                }
              }
              
              const videoFile2 = this.videoFiles.find(d => src2 === d.fileOriginalPath)
              
              if(!videoFile2 === false) {
                const obj = {
                  videoElement: videoElement,
                  src: src2,
                  thumbnailPath: videoFile2.fileThumbnailPath
                }

                changeVideos.push(obj)
              } else {
                videoElement.remove()
              }
            }
          }
        }

        let videoTagElements = editorElement.querySelectorAll('video')
        // console.log("videoTagElements", videoTagElements)
        for(const videoTagElement of videoTagElements) {
          // console.log("videoTagElement", videoTagElement, insertVideos)
          // console.log("videoNodeChk" , insertVideos.findIndex(v => v.videoNode === videoTagElement))
          if(!(insertVideos.findIndex(v => v.videoNode === videoTagElement) > -1)) {
            const videoNode = videoTagElement.querySelector('source')
            let src = ""
            if(!videoNode === false) {
              src = videoNode.getAttribute('src')
              if(!src === true) {
                src = videoNode.getAttribute('poster')
              }
            } else {
              src = videoTagElement.getAttribute('src')
              if(!src === true) {
                src = videoTagElement.getAttribute('poster')
              }
            }
            const videoFile = this.videoFiles.find(
              d => src === d.fileOriginalPath || src === d.fileTranscodePath || src === d.fileThumbnailPath
            )
            const obj = {
              videoElement: videoTagElement,
              src: src,
              thumbnailPath: videoFile.fileThumbnailPath
            }

            changeVideos2.push(obj)
          }
        }

        if(changeVideos2.length > 0) {
          this.setVideoElementThumbnail2(document, changeVideos2)
        }

        //console.log("changeVideos", changeVideos)
        if(changeVideos.length > 0) {
          this.setVideoElementThumbnail(document, changeVideos)

          // delete video tag
          for(const changeVideo of changeVideos) {
            let video = null
           
            for(const el of changeVideo.videoElement.childNodes) {
              if(el.nodeName === "VIDEO") {
                video = el
              }
            }
            if (video) changeVideo.videoElement.removeChild(video)
          }
        }

        for (const anchorElement of anchorElements) {
          anchorElement.setAttribute('target', '_blank')
          anchorElement.setAttribute('rel', 'noopener noreferrer')
        }

        let editorContent = ""
        if(this.curClassSearchQuery.keyword) {
          // const regex = new RegExp(`(${this.curClassSearchQuery.keyword})+(?![^<]*>)+(?![^&amp;|&nbsp;|&lt;|&gt;|&quot;|&ndash;|&mdash;|&copy;|&reg;|&trade;|&asymp;|&ne;|&pound;|&euro;|&deg;])`, "gi")
          const regex = new RegExp(`(${this.curClassSearchQuery.keyword})(?![^<]*>)(?![^&amp;|&nbsp;|&lt;|&gt;|&quot;|&ndash;|&mdash;|&copy;|&reg;|&trade;|&asymp;|&ne;|&pound;|&euro;|&deg;]*;)`, "gi")
          editorContent = editorElement.innerHTML.replace(regex, "<span class='highlight'>" + this.curClassSearchQuery.keyword + "</span>")
        } else {
          editorContent = editorElement.innerHTML
        }

        postContentEditor = editorContent
      } catch (e) {
        this.$log.warn(e)
      }

      // console.groupEnd();
      
      return postContentEditor || null
    },
  },
  created() {},
  mounted() {},
  methods: {
    // setVideoElementThumbnail(postContentDocument, videoElement, fileThumbnailPath) {
    //   if (fileThumbnailPath) {
    //     // span.fr-video span.thumb img
    //     let filesSpanElement = postContentDocument.createElement('span')
    //     filesSpanElement.className = 'thumb'

    //     let filesImgPreViewElement = postContentDocument.createElement('img')
    //     filesImgPreViewElement.src = fileThumbnailPath
    //     filesImgPreViewElement.alt = ""

    //     // span | img
    //     filesSpanElement.appendChild(filesImgPreViewElement)
    //     videoElement.appendChild(filesSpanElement)

    //   } else {
    //     // span.fr-video span.thumb-default
    //     let filesSpanElement = postContentDocument.createElement('span')
    //     filesSpanElement.className = 'thumb-default'

    //     // span
    //     videoElement.appendChild(filesSpanElement)
    //   }
    // },
    setVideoElementThumbnail(postContentDocument, changeVideos) {
      for(const changeVideo of changeVideos) {
        if(changeVideo.thumbnailPath) {
          // span.fr-video span.thumb img
          let filesSpanElement = postContentDocument.createElement('span')
          filesSpanElement.className = 'thumb'

          let filesImgPreViewElement = postContentDocument.createElement('img')
          filesImgPreViewElement.src = changeVideo.thumbnailPath
          filesImgPreViewElement.alt = ""

          // span | img
          filesSpanElement.appendChild(filesImgPreViewElement)
          changeVideo.videoElement.appendChild(filesSpanElement)
        } else {
          // span.fr-video span.thumb-default
          let filesSpanElement = postContentDocument.createElement('span')
          filesSpanElement.className = 'thumb-default'
          filesSpanElement.dataset.src = changeVideo.src

          // span
          changeVideo.videoElement.appendChild(filesSpanElement)
        }
      }
    },
    setVideoElementThumbnail2(postContentDocument, changeVideos) {
      for(const changeVideo of changeVideos) {
        if(changeVideo.thumbnailPath) {
          // span.fr-video span.thumb img
          let filesSpanFrVideoElement = postContentDocument.createElement('span')
          filesSpanFrVideoElement.className = 'fr-video'

          let filesSpanElement = postContentDocument.createElement('span')
          filesSpanElement.className = 'thumb'

          let filesImgPreViewElement = postContentDocument.createElement('img')
          filesImgPreViewElement.src = changeVideo.thumbnailPath
          filesImgPreViewElement.alt = ""

          // span | img
          filesSpanFrVideoElement.appendChild(filesSpanElement)
          filesSpanElement.appendChild(filesImgPreViewElement)
          changeVideo.videoElement.replaceWith(filesSpanFrVideoElement);
        } else {
          // span.fr-video span.thumb-default
          let filesSpanElement = postContentDocument.createElement('span')
          filesSpanElement.className = 'thumb-default'
          filesSpanElement.dataset.src = changeVideo.src
          changeVideo.videoElement.replaceWith(filesSpanElement);
        }
      }
    }

  }
}
</script>

<style scoped></style>
