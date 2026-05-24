<template>
  <div>
    <div
      v-if="popup"
      class="window-popup advertising-modal type2"
      style="display: block"
      @click.self="closeLayer(false)"
    >
      <div class="modal-cont-wrap" ref="pop">
        <div class="modal-cont boundary-box">
          <div class="modal-cont-inner">
            <div class="advertising-modal-cont-wrap">
              <div class="slide-wrap" @click="link">
                <slick :options="option.slick">
                  <template v-for="file of popup.files">
                    <div class="slide" :key="file.fileOriginalPath">
                      <a href="javascript:" :key="file.fileOriginalPath">
                        <img
                            :src="file.fileOriginalPath"
                            :data-index="0"
                            alt=""
                            v-observe-visibility="
                              isMounted
                              ? {
                                  callback: visibilityChanged,
                                  intersection: {
                                    threshold: 0.6,
                                  },
                                  once: true,
                                }
                              : false
                            "
                        />
                      </a>
                    </div>
                  </template>
                </slick>
              </div>
            </div>
            <div v-if="popup.replayType !== 'NONE'" class="modal-btm-wrap">
              <input
                type="checkbox"
                :id="popup.currentId"
                @click.self="closeLayer(true)"
              />
              <label :for="popup.currentId">
                <span v-if="popup.replayType === 'NOTTODAY'"
                  >오늘 다시 보지 않음</span
                >
                <span v-else>더 이상 보지 않음</span>
              </label>
            </div>
          </div>
          <div
            @click.self="closeLayer(false)"
            class="modal-close-btn modal-close-icon"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Slick from 'vue-slick'
import {mapActions} from "vuex";
import {ObserveVisibility} from 'vue-observe-visibility'

export default {
  name: 'popup-item',
  components: {
    Slick
  },
  directives: {
    ObserveVisibility
  },
  data() {
    return {
      isMounted: false,
      option: {
        slick: {
          autoplay: true,
          autoplaySpeed: 5000,
          slidesToShow: 1,
          infinite: true,
          adaptiveHeight: false,
          cssEase: 'linear',
          dots: false,
          prevArrow: false,
          nextArrow: false
        }
      },
      popup: null
    }
  },
  computed: {},
  mounted() {
    this.getPopup()
  },
  methods: {
    ...mapActions('storeHome', {
      onClickPopup: 'onClickPopup',
      visibilityChangedByContent: 'visibilityChangedByContent',
    }),
    getPopup() {
      this.$hiClass.postBanners
        .read(
          `${process.env.VUE_APP_BASE_API_URI}/postBanners/${this.$route.query.currentId}`
        )
        .then(res => {
          this.popup = res.data
          // this.$nextTick(() => {
          //   const modalPosition = this.$comn.getModalPosition(this.$refs.pop)
          //   this.$refs.pop.style.marginTop = `-${modalPosition.m_height}px`
          //   this.$refs.pop.style.marginLeft = `-${modalPosition.m_width}px`
          // })

          setTimeout(() => {
            this.isMounted = true
          }, 300)
        })
        .catch(err => {
          this.$log.debug(this.$options.name, ' getPopup() error => ', err)
        })
    },
    link() {
      // 클릭 시 읽음 카운트 증가 (게시물 상세보기)
      this.$hiClass.posts.read(`/posts/${this.popup.currentId}`)

      // 클릭 시 광고 ID 기준 클릭 수 증가
      this.onClickPopup({
        adWebId: this.popup.adWebId
      })

      if (this.popup.link.trim() !== '') {
        if (this.popup.linkType === 'INTERNAL') {
          if (this.popup.linkTarget === 'NOTICE') {
            // this.$router.push("/help/notice")

            // 팝업 내 이동 -> 부모 창 새 탭 열기로 변경
            window.open('/help/notice')
          } else {
            // 팝업 내 이동 -> 부모 창 새 탭 열기로 변경
            window.open(`/main/home?postId=${this.popup.link}`)
          }
        } else {
          // 팝업 내 이동 -> 부모 창 새 탭 열기로 변경
          // window.open(this.popup.link, this.popup.currentId)
          window.open(this.popup.link)
        }
        // 부모 창 새 탭 열기 후 기존 팝업 닫기
        this.closeLayer(false)
      }
    },
    closeLayer(type) {
      if (type) {
        if (this.popup.replayType === 'NOTTODAY') {
          let toDay = this.$moment().format('YYYYMMDD')
          let storage = JSON.parse(localStorage.NOTTODAY || null) || {},
            replay = storage[toDay] || null

          if (replay) {
            if (!replay.find(item => item.currentId === this.popup.currentId)) {
              replay.push({
                currentId: this.popup.currentId
              })

              localStorage.NOTTODAY = JSON.stringify(storage)
            }
          } else {
            replay = {}
            replay[toDay] = [{ currentId: this.popup.currentId }]

            localStorage.NOTTODAY = JSON.stringify(
              Object.assign(storage, replay)
            )
          }
        } else {
          let storage = JSON.parse(localStorage.ANYMORE || null) || []
          storage = storage.filter(item => {
            return item.currentId !== this.popup.currentId
          })
          storage.push({
            currentId: this.popup.currentId
          })
          localStorage.ANYMORE = JSON.stringify(storage)
        }
      }

      window.close()
    },
    visibilityChanged(isVisible, /* entry */) {
      // 노출되었을 때 adWebId 증가 처리
      if (isVisible) {
        // const dataset = entry.target.dataset
        // const content = this.popup[dataset.index]  // content
        this.$log.debug(this.$options.name, 'visibilityChanged content:', this.popup)
        this.visibilityChangedByContent({ content: this.popup })
      }
    },

  }
}
</script>
