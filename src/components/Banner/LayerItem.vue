<template>
  <div
    v-if="popupItem.length > 0"
    v-show="isMounted"
  >
    <template v-for="(popup, index) of popupItem">
      <div
        :key="popup.postId"
        v-if="popup.popupType === 'LAYER'"
        class="layer advertising-modal type2 layer-modal"
        :style="{
          position: 'fixed',
          top: `${popup.locationY}px`,
          left: `${popup.locationX}px`
        }"
      >
        <div class="modal-cont-wrap">
          <div class="modal-cont boundary-box">
            <div class="modal-cont-inner">
              <div class="advertising-modal-cont-wrap">
                <div
                  class="slide-wrap"
                  @click="
                    link(popup)
                    closeLayer(popup)
                  "
                >
                  <a href="javascript:">
                    <img
                        :src="popup.files.find(file => file.fileFlag === 'THUMBNAIL').fileOriginalPath || ''"
                        :data-index="index"
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
                  <!-- <slick :options="option.slick" ref="slide">
                    <template v-for="file in popup.files">
                      <div class="slide" :key="file.fileOriginalPath">
                        <a href="javascript:;" :key="file.fileOriginalPath">
                          <img :src="file.fileOriginalPath" />
                        </a>
                      </div>
                    </template>
                  </slick> -->
                </div>
              </div>
              <div v-if="popup.replayType !== 'NONE'" class="modal-btm-wrap">
                <input
                  type="checkbox"
                  :id="popup.postId"
                  @click.self="closeLayer(popup, true)"
                />
                <label :for="popup.postId">
                  <span v-if="popup.replayType === 'NOTTODAY'"
                    >오늘 다시 보지 않음</span
                  >
                  <span v-else>더 이상 보지 않음</span>
                </label>
              </div>
            </div>
            <div
              @click.self="closeLayer(popup)"
              class="modal-close-btn modal-close-icon"
            ></div>
          </div>
        </div>
      </div>
      <div
        v-else
        :key="popup.postId"
        class="modal advertising-modal type2 layer-modal"
        style="display: block"
        @click.self="closeLayer(popup)"
      >
        <div
          class="modal-cont-wrap"
          :class="['layer-modal-center']"
          :ref="popup.postId"
        >
          <div class="modal-cont boundary-box">
            <div class="modal-cont-inner">
              <div class="advertising-modal-cont-wrap">
                <div
                  class="slide-wrap"
                  @click="
                    link(popup)
                    closeLayer(popup)
                  "
                >
                  <a href="javascript:">
                    <img
                        :src="popup.files.find(file => file.fileFlag === 'THUMBNAIL').fileOriginalPath || ''"
                        :data-index="index"
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
                  <!-- <slick :options="option.slick" ref="slide">
                    <template v-for="file in popup.files">
                      <div class="slide" :key="file.fileOriginalPath">
                        <a href="javascript:;" :key="file.fileOriginalPath">
                          <img :src="file.fileOriginalPath" />
                        </a>
                      </div>
                    </template>
                  </slick> -->
                </div>
              </div>
              <div v-if="popup.replayType !== 'NONE'" class="modal-btm-wrap">
                <input
                  type="checkbox"
                  :id="popup.postId"
                  @click.self="closeLayer(popup, true)"
                />
                <label :for="popup.postId">
                  <span v-if="popup.replayType === 'NOTTODAY'"
                    >오늘 다시 보지 않음</span
                  >
                  <span v-else>더 이상 보지 않음</span>
                </label>
              </div>
            </div>
            <div
              @click.self="closeLayer(popup)"
              class="modal-close-btn modal-close-icon"
            ></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import {mapActions, mapMutations} from "vuex";
import { ObserveVisibility } from 'vue-observe-visibility'

import validate from "uuid-validate"

export default {
  name: 'layer-item',
  components: {
    // Slick
  },
  directives: {
    ObserveVisibility
  },
  props: {
    positionType: {
      type: String,
      required: true
    },
    item: {
      type: Object
    }
  },
  data() {
    return {
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
      isMounted: false,
      popupItem: [],
    }
  },
  computed: {},
  created() {
    this.initNotToDay()
    this.getPopup()

    if (this.item && this.item.postId) {
      this.getPopupWithItem()
    }
  },
  mounted() {
  },
  methods: {
    ...mapActions({
      openHitalkPopup: 'openHitalkPopup'
    }),
    ...mapActions('storeHome', {
      onClickPopup: 'onClickPopup',
      visibilityChangedByContent: 'visibilityChangedByContent',
    }),
    ...mapMutations({
      setHasWebHomePopup: 'setHasWebHomePopup'
    }),
    initNotToDay() {
      let toDay = this.$moment().format('YYYYMMDD')
      let storage = JSON.parse(localStorage.NOTTODAY || null) || {},
        replay = storage[toDay] || null

      let toDayStorage = {}
      toDayStorage[toDay] = replay
      localStorage.NOTTODAY = JSON.stringify(toDayStorage)
    },
    async getPopup() {
      if (!this.positionType) {
        return false
      }

      const requestParams = {
        deviceType: 'WEB',
        positionType: this.positionType
      }
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/banners`,
          params: requestParams
        })

        if (this.positionType === 'WEB_POPUP_HOME') {
          if (Object.keys(res.data).length === 0) {
            this.setHasWebHomePopup(false)
          }
        }

        if (res.data._embedded) {
          let replayData = {
            NOTTODAY: (JSON.parse(localStorage.NOTTODAY || null) || {})[this.$moment().format('YYYYMMDD')] || null,
            ANYMORE: JSON.parse(localStorage.ANYMORE || null)
          }

          res.data._embedded.banners.map(item => {
            let replayItem = (replayData[item.replayType] || []).filter(rep => {
              return rep.postId === item.postId
            }, {})

            if (replayItem.length === 0) {
              if (item.popupType === 'LAYER' || item.popupType === 'MODAL') {
                this.popupItem.push(item)
              } else {
                window.open(
                    `/popup/PopupItem?currentId=${item.postId}`,
                    item.postId,
                    'width=460, height=460, scrollbars=0, resizable=0'
                )
              }
            }

            this.$nextTick(() => {
              let isHideScrollBar = false
              this.popupItem.map(item => {
                if (item.popupType === 'MODAL')
                  isHideScrollBar = true
              })
              if (this.popupItem.length > 0 && isHideScrollBar) {
                this.$hiClass.toggleBodyClass('add', 'hidden')
              } else {
                this.$nextTick(() => {
                  this.$hiClass.toggleBodyClass('remove', 'hidden')
                })
              }

              setTimeout(() => {
                this.isMounted = true
              }, 200)
            })
          })
        }
      } catch (e) {
        this.setHasWebHomePopup(false)
        this.$log.debug(this.$options.name, ' getPopup() error => ', e)
      }

      /**
      const curDate = this.$moment().valueOf()
      const posted = [
        this.$moment(curDate)
          .subtract(5, 'years')
          .valueOf(),
        curDate
      ]

      let params = {
        // postMains 추가 파라미터
        mode: 'BANNER',
        posted: posted,
        postType: 'BANNER',
        postStatus: 'COMPLETE',
        // -- postMains 추가 파라미터
        deviceType: 'WEB',
        bannerType: 'POPUP',
        positionType: this.positionType,
        displayStatus: 'PROGRESSING',
        sort: 'positionOrderType,asc',
        size: 100
      }

      this.$hiClass.postMains
        .search(params)
        .then(res => {
          let replayData = {
            NOTTODAY:
              (JSON.parse(localStorage.NOTTODAY || null) || {})[
                this.$moment().format('YYYYMMDD')
              ] || null,
            ANYMORE: JSON.parse(localStorage.ANYMORE || null)
          }

          res.data._embedded.postViews.map(item => {
            let replayItem = (replayData[item.replayType] || []).filter(rep => {
              return rep.currentId === item.currentId
            }, {})

            if (replayItem.length === 0) {
              if (item.popupType === 'LAYER' || item.popupType === 'MODAL') {
                this.popupItem.push(item)
              } else {
                window.open(
                  `/popup/PopupItem?currentId=${item.currentId}`,
                  item.currentId,
                  'width=460, height=460, scrollbars=0, resizable=0'
                )
              }
            }

            this.$nextTick(() => {
              let isHideScrollBar = false
              this.popupItem.map(item => {
                if (item.popupType === 'MODAL')
                  isHideScrollBar = true
              })
              if (this.popupItem.length > 0 && isHideScrollBar) {
                this.$hiClass.toggleBodyClass('add', 'hidden')
              } else {
                this.$nextTick(() => {
                  this.$hiClass.toggleBodyClass('remove', 'hidden')
                })
              }

              setTimeout(() => {
                this.isMounted = true
              }, 200)
            })
          })
        })
        .catch(err => {
          this.$log.debug(this.$options.name, ' getPopup() error => ', err)
        })
        .finally(() => {
        })
       **/
    },
    getPopupWithItem() {
      const replayData = {
        NOTTODAY:
          (JSON.parse(localStorage.NOTTODAY || null) || {})[
            this.$moment().format('YYYYMMDD')
            ] || null,
        ANYMORE: JSON.parse(localStorage.ANYMORE || null)
      }

      const replayItem = (replayData[this.item.replayType] || []).filter(rep => {
        return rep.postId === this.item.postId
      }, {})

      if (replayItem.length === 0) {
        if (this.item.popupType === 'LAYER' || this.item.popupType === 'MODAL') {
          this.popupItem.push(this.item)
        } else {
          window.open(
            `/popup/PopupItem?currentId=${this.item.postId}`,
            this.item.postId,
            'width=460, height=460, scrollbars=0, resizable=0'
          )
        }
      }

      this.$nextTick(() => {
        let isHideScrollBar = false
        this.popupItem.map(item => {
          if (item.popupType === 'MODAL')
            isHideScrollBar = true
        })
        if (this.popupItem.length > 0 && isHideScrollBar) {
          this.$hiClass.toggleBodyClass('add', 'hidden')
        } else {
          this.$nextTick(() => {
            this.$hiClass.toggleBodyClass('remove', 'hidden')
          })
        }

        setTimeout(() => {
          this.isMounted = true
        }, 200)
      })
    },
    link(item) {
      // 클릭 시 읽음 카운트 증가 (게시물 상세보기)
      if (validate(item.postId))
        this.$hiClass.posts.read(`/posts/${item.postId}`)

      // 클릭 시 광고 ID 기준 클릭 수 증가
      this.onClickPopup({
        adWebId: item.adWebId
      })

      if (item.link.trim() !== '') {
        if (item.linkType === 'INTERNAL') {
          if (item.linkTarget === 'NOTICE') {
            this.$router.push('/help/notice')
          } else if (item.linkTarget === 'MENU') {
            this.$hiClass.alert('TBD: ' + item.link + ' 화면으로 이동', 'info')
          } else if (item.linkTarget === 'CP_HOME') {
            this.$hiClass.alert('TBD: CP 홈화면으로 이동', 'info')
          } else {
            this.$hiClass.posts
              .read(`${process.env.VUE_APP_BASE_API_URI}/posts/${item.link}`)
              .then(res => {
                this.setItemDetailObj(res.data)
              })
              .catch(err => {
                this.$log.debug(this.$options.name, ' link() error => ', err)
              })
          }
        } else {
          window.open(item.link, item.postId)
        }
      }
    },
    // 게시물 상세 팝업
    setItemDetailObj(item) {
      if (item) {
        let paramObj = {
          item: item,
          list: [item],
          totalElements: 1,
          pagePerSize: 1
        }
        this.$store.commit('setItemDetailObj', paramObj)
        this.$store.commit('setIsShowDetailPostLayer', true)
      } else {
        this.$store.commit('setItemDetailObj', {})
        this.$store.commit('setIsShowDetailPostLayer', false)
      }
    },
    closeLayer(pop, isChecked) {
      // 팝업 닫기
      this.popupItem = this.popupItem.filter(item => item.postId !== pop.postId)

      // 체크박스 선택 시 처리
      if (isChecked === true) {
        if (pop.replayType === 'NOTTODAY')
          this.setPopItemNotToday(pop)
        else
          this.setPopItemAnymore(pop)
      }

      this.$nextTick(() => {
        this.$hiClass.toggleBodyClass('remove', 'hidden')
      })
    },

    setPopItemNotToday(pop) {
      let toDay = this.$moment().format('YYYYMMDD')
      let storage = JSON.parse(localStorage.NOTTODAY || null) || {},
          replay = storage[toDay] || null

      if (replay) {
        if (!replay.find(item => item.postId === pop.postId)) {
          replay.push({
            postId: pop.postId
          })

          localStorage.NOTTODAY = JSON.stringify(storage)
        }
      } else {
        replay = {}
        replay[toDay] = [{ postId: pop.postId }]

        localStorage.NOTTODAY = JSON.stringify(
            Object.assign(storage, replay)
        )
      }
    },

    setPopItemAnymore(pop) {
      let storage = JSON.parse(localStorage.ANYMORE || null) || []
      storage = storage.filter(item => {
        return item.postId !== pop.postId
      })
      storage.push({
        postId: pop.postId
      })
      localStorage.ANYMORE = JSON.stringify(storage)
    },

    visibilityChanged(isVisible, entry) {
      // 노출되었을 때 adWebId 증가 처리
      if (isVisible) {
        const dataset = entry.target.dataset
        const content = this.popupItem[dataset.index]  // content
        this.$log.debug(this.$options.name, 'visibilityChanged content:', content)
        this.visibilityChangedByContent({ content })
      }
    },


  }
}
</script>
<style scoped>
.layer-modal {
  z-index: 1000;
}
.layer-modal-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
