<!--
@File(Method): MainBodyClazzesBodySettingClassDeactivate.vue
@Author: -
@Date Created: -
@Description: 클래스 > 클래스 설정 > 클래스 비공개/삭제
@Modified: 2024-12-18 - #69538 클래스 생성 시 유치, 중고등 분류 : ui 수정 및 HiButton으로 변경
-->

<template>
  <!-- 클래스 비공개/삭제 -->
  <div class="setting-category-wrap category-class-disabled">
    <div class="category-title">클래스 비공개/삭제</div>
    <div class="category-cont-wrap boundary-box clfix">
      <div
        v-if="isClassDeactivate || isClassClosing"
        class="top-wrap"
      >
        <template v-if="isClassDeactivate">
          <p class="">현재 비공개 상태의 미운영 클래스입니다.</p>
          <span class="period">비공개 클래스 유지기간 : <span>{{ classDeactivateTimeFormat }}</span></span>
        </template>

        <template v-else-if="isClassClosing">
          <p><span class="ft-blue">{{ classClosedTimeFormat }}</span> 클래스 삭제예정입니다.</p>
        </template>
      </div>

      <div class="text-wrap">
        <div class="highlight-box">
          <p class="top">
            <strong>잠깐! <span class="txt-warning">하이톡</span>을 <span class="txt-warning">저장</span>해주세요.</strong>
            <HiButton color="link" @click="linkHowToSaveHitalk">하이톡 저장 방법 안내 &gt;</HiButton>
          </p>
          <p class="message">
            <span class="text">클래스 비공개 또는 삭제시 구성원이 자동 탈퇴되오니, <br>중요한 하이톡 대화 내용은 클래스 상태 변경 전에 미리 저장해주세요.</span>
          </p>
        </div>

        <div class="title">클래스 비공개</div>
        <p class="desc">지난해 운영하던 클래스를 비공개로 전환하여 선생님만 게시물과 자료를 활용하실 수 있습니다.</p>
        <ul class="text-list">
          <li>비공개로 전환되면 기존 자료 열람은 가능하지만 등록/수정/삭제가 불가합니다.</li>
          <li>비공개 전환 후 7일 후에는 관리자를 제외한 클래스 구성원은 클래스 종료 안내와 함께 자동 탈퇴 됩니다.</li>
          <li>비공개 클래스는 ‘나의클래스’에 보관되어 언제든지 확인할 수 있으며, 비공개 클래스는 다시 공개하여 운영할 수 있습니다.</li>
          <li>비공개 처리 후 1년(365일)이 도래하면 자동 삭제처리 됩니다. <br>[중요] 삭제를 원치 않으실 경우, 클래스를 공개 상태로 변경하고 클래스 연도를 '연도무관'으로 설정해주세요.</li>
        </ul>
        <div class="title">클래스 삭제</div>
        <p class="desc">불필요한 클래스는 삭제하여 내 클래스 목록을 관리하실 수 있습니다.</p>
        <ul class="text-list">
          <li>7일 후 클래스 종료안내와 함께 구성원들이 자동탈퇴되며, 게시물을 포함한 모든 자료가 삭제됩니다. (해당 클래스 구성원과의 하이톡 대화내용 포함)</li>
          <li>7일 후 완전히 삭제된 클래스는 철회가 불가하며, 삭제된 클래스는 복구가 불가합니다.</li>
        </ul>
      </div>

    </div>

    <div
        v-if="!isClassClosing"
        class="btn-wrap"
      >
        <div class="btn-group">
          <HiButton
          color="primary"
          @click="doClazzDeactivate"
          >
          {{ classDeactiveButtonText }}
          </HiButton>
          <HiButton
          color="warning"
          @click="doClazzClosing"
          >
          {{ classClosingButtonText }}
          </HiButton>
        </div>
      </div>

    <!-- 로딩 백그라운드 투명 처리 -->
    <loading-overlay
      :active.sync="option.isLoading"
      :can-cancel="false"
      :is-full-page="true"
      :color="'#4275df'"
      :backgroundColor="'rgba(90,90,90,0)'"
    ></loading-overlay>
  </div>

</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: 'mainBodyClazzesBodySettingClassDeactivate',
  components: {
    LoadingOverlay: () => import('vue-loading-overlay')
  },
  props: [
    'clazzes',
    'clazzMemberRole',
    'isManager'
  ],
  data() {
    return {
      option: {
        isLoading: false,
      },
      flag: {
        deactivate: false,
        closing: false
      },
      flagKey: ''
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    classDeactiveButtonText() {
      if (this.clazzes.classStatus === 'ACTIVATE') return '클래스 비공개'
      else return '클래스 공개'
    },
    classClosingButtonText() {
      return '클래스 삭제'
    },
    isClassActivate() {
      return this.clazzes.classStatus === 'ACTIVATE'
    },
    isClassDeactivate() {
      return this.clazzes.classStatus === 'DEACTIVATE'
    },
    isClassClosing() {
      return this.clazzes.classStatus === 'CLOSING'
    },
    classClosedTimeFormat() {
      return this.clazzes.classClosedTimestamp
          ? this.$moment(this.clazzes.classClosedTimestamp).format('YYYY년 MM월 DD일')
          : null
    },
    classDeactivateTimeFormat() {
      if (this.clazzes.classDeactivateTimestamp) {
        const format = 'YYYY년 MM월 DD일'
        const startTime = this.$moment(this.clazzes.classDeactivateTimestamp)
        const startTimeFormat = startTime.format(format)
        const endTimeFormat = startTime.add(1, 'years').format(format)

        return `${startTimeFormat} ~ ${endTimeFormat}`

      } else {
        return null
      }
    },
  },
  watch: {
    'option.isLoading'(val) {
      if (val === false) {
        for (const key of Object.keys(this.flag))
          this.flag[key] = false

        this.flagKey = ''
      }
    }
  },
  methods: {
    beforeClazzSettingControl() {
      return new Promise((resolve, reject) => {
        if (this.clazzMemberRole === this.CONSTANTS.CLAZZ_SUBSCRIBE.MEMBER_ROLE.OWNER) {
          resolve(true)
        } else if (this.clazzMemberRole === this.CONSTANTS.CLAZZ_SUBSCRIBE.MEMBER_ROLE.MANAGER) {
          const statusMessage = this.clazzes.classStatus === 'DEACTIVATE' ? '공개' : '비공개 및 삭제'
          const message = '알림<br><br>' +
            `클래스 ${statusMessage}는<br>` +
            `'클래스 개설자'만 가능합니다.<br><br>` +
            `필요하신 경우 클래스 개설자에게<br>` +
            `개설 권한을 위임받아 할 수 있습니다.`
          this.$hiClass.alert(message)
          reject(false)
        } else {
          const message = '알림<br><br>' +
            '클래스 비공개 및 삭제 권한이 없습니다.'
          this.$hiClass.alert(message)
          reject(false)
        }
      })
    },
    async doClazzDeactivate() {
      try {
        await this.beforeClazzSettingControl()
      } catch (e) {
        return false
      }

      this.flagKey = 'deactivate'

      let msg = ''
      let act = ''
      if (this.clazzes.classStatus === 'DEACTIVATE') {
        act = 'ACTIVATE'
        msg = '클래스를 공개하시겠습니까?'

      } else {
        act = 'DEACTIVATE'
        msg = this.createConfirmMsg()
        // 체크박스 버튼 생성 후 이벤트 추가
        this.createCheckBox()
      }

      const opts = {}
      if (this.clazzes.classStatus === 'ACTIVATE') {
        opts.confirmButtonText = '비공개'
      }
      this.$hiClass.confirm(msg, null, opts)
        .then(() => {
          if (this.clazzes.classStatus === 'ACTIVATE' && !this.flag[this.flagKey]) {
            this.$hiClass.alert(`${opts.confirmButtonText} 동의 여부에 체크해주세요`)
            return false
          }
          this.updateClazzes(act)
        })
        .catch(err => {
          this.$log.warn(err)
          this.flag[this.flagKey] = false
        })
    },
    async doClazzClosing() {
      try {
        await this.beforeClazzSettingControl()
      } catch (e) {
        return false
      }

      this.flagKey = 'closing'

      const act = 'CLOSING'
      const msg = this.createConfirmMsg()
      // 체크박스 버튼 생성 후 이벤트 추가
      this.createCheckBox()

      const opts = {
        confirmButtonText: '삭제',
        confirmButtonColor: '#ff6a6a',
      }
      this.$hiClass.confirm(msg, null, opts)
        .then(() => {
          if (!this.flag[this.flagKey]) {
            this.$hiClass.alert(`${opts.confirmButtonText} 동의 여부에 체크해주세요`)
            return false
          }
          this.updateClazzes(act)
        })
        .catch(err => {
          this.$log.warn(err)
          this.flag[this.flagKey] = false
        })
    },

    async updateClazzes(act) {
      if (!this.option.isLoading) {
        this.option.isLoading = true

        if (!this.isManager) {
          alert('설정 변경 권한이 없습니다.')
          this.option.isLoading = false
          return false
        }
        const classId = this.clazzes.currentId

        // 서버의 클래스 정보 확인
        const clazzData = await this.$hiClass.clazzes.read(`/clazzes/${this.clazzes.currentId}`).then(res => res.data) || null

        if (clazzData === null) {
          alert('요청이 실패했습니다. 다시 한번 확인해 주세요.')
          this.option.isLoading = false
          return false
        }

        if (clazzData.classStatus === 'CLOSING') {
          alert('삭제된 클래스입니다.\n클래스 설정을 변경할 수 없습니다.')
          this.option.isLoading = false
          window.location.replace(location.href)

        } else {

          const prevAct = this.clazzes.classStatus
          const updateUrl = `/clazzes/${classId}`
          const requestBody = { classStatus: act }

          this.$hiClass.clazzes.update(requestBody, updateUrl)
            .then(result => {
              this.$log.debug(
                this.$options.name + ' updateClazzes() result => ',
                result
              )
              // 클래스 상태 변경 성공 시 클래스 상태 갱신
              this.clazzes.classStatus = act

              if (act === 'CLOSING')
                this.clazzes.classClosedTimestamp = this.$moment().add(7, 'days').valueOf()
              else if (act === 'DEACTIVATE')
                this.clazzes.classDeactivateTimestamp = this.$moment().valueOf()

            })
            .catch(error => {
              this.$log.debug(error)

              // 클래스 상태 변경 실패한 경우 이전 상태로 되돌림
              this.clazzes.classStatus = prevAct
            })
            .finally(() => {
              this.option.isLoading = false
            })

        }

      }
    },

    createConfirmMsg() {
      let returnMsg = ``
      const focusWord = {
        deactivate: `<span class="span-color-blue">비공개</span>`,
        closing: `<span class="span-color-red">삭제</span>`
      }
      const checkBoxArea = `
        <div class="checkbox-wrap">
          <input
            type="checkbox"
            id="class-setting-${this.flagKey}-confirm-checkbox"
            ${ this.flag[this.flagKey] === true ? 'checked' : '' }
          />
          <label for="class-setting-${this.flagKey}-confirm-checkbox">
            <span class="span-color-black">클래스를${focusWord[this.flagKey]} 하시겠습니까?<br></span>
          </label>
        </div>
        `

      switch (this.flagKey) {
        case 'deactivate': {
          returnMsg = `
            <div style="text-align: left; line-height: 1.4;">
              7일 후 클래스 종료안내와 함께 구성원들이 자동탈퇴됩니다.<br>
              기존 게시물과 자료는 선생님만 간직하고 활용하실 수 있습니다. (하이톡 대화내용은 삭제됨)<br>
              <br>
              비공개 클래스는 "나의 클래스"메뉴에서 확인가능하며, 1년 이내로 다시 공개로 운영할 수 있습니다.<br>
              <br>
           `
          returnMsg += checkBoxArea
          returnMsg += `</div>`
          break
        }
        case 'closing': {
          returnMsg = `
            <div style="text-align: left; line-height: 1.4;">
              7일 후 클래스 종료안내와 함께 구성원들이 자동탈퇴되며, 게시물을 포함한 모든 자료가 삭제됩니다. (하이톡 대화내용 포함)<br>
              <br>
              클래스 삭제는 요청 후 철회가 불가하며, 삭제된 클래스는 복구가 불가하오니 신중하게 선택해주세요.<br>
              <br>
          `
          returnMsg += checkBoxArea
          returnMsg += `</div>`
          break
        }
      }
      return returnMsg
    },

    createCheckBox() {
      this.$nextTick(() => {
        const elements = document.querySelectorAll('.swal2-html-container .checkbox-wrap input[type="checkbox"]')
        elements.forEach(element => {
          element.addEventListener('change', event => {
            this.flag[this.flagKey] = event.target.checked
          })
        })
      })
    },

    linkHowToSaveHitalk() {
      window.open('https://www.hiclass.net/share/9b0871de-2a72-4bf2-9900-0879846038f2')
    }

  },

}
</script>

<style lang="scss">
.swal2-content {
  .span-color-black {
    color: black
  }
  .span-color-blue {
    color: blue
  }
  .span-color-red {
    color: red
  }
}
</style>

<style scoped>
.class-setting-wrap .setting-category-wrap .category-title {
  font-family: var(--font-body); margin:0 0 0 0; color: #000000; font-size: 18px;
}
.class-setting-wrap .setting-category-wrap {
  padding: 28px 26px 0 28px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.class-setting-wrap .boundary-box { border: 0; }

.class-setting-wrap .category-class-disabled .boundary-box {
  padding: 28px 0 0;
}
.boundary-box {
  -webkit-box-shadow: none;
  box-shadow: none;
}
.class-setting-wrap .category-class-disabled .text-wrap {
  padding: 0 0 28px 0;
  border-top: 0;
}
.class-setting-wrap .category-class-disabled .btn-wrap {
  padding: 0;
  margin-bottom: 28px;
}

.text-wrap .highlight-box strong {
  font-weight: 700;
  font-size: 16px;
}

.class-setting-wrap .highlight-box .btn-arrow {
  color: #616161;
  height: 32px;
  width: 170px;
  font-size: 14px;
}

/* .class-setting-wrap .highlight-box .btn-arrow:after {
  border-top: 1px solid #616161;
  border-right: 1px solid #616161;
  margin-left: 6px;
} */

.text-wrap .highlight-box p.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  margin-bottom: 12px;
}
.text-wrap .highlight-box p.top strong {
  font-weight: 700;
  font-size: 16px;
  color: #222222;
}

.text-wrap .highlight-box p.message {
  margin: 0;
}
.class-setting-wrap .highlight-box .text {
  font-size: 14px;
  margin: 0;
  color: #616161;
  font-weight: 400;
}
</style>