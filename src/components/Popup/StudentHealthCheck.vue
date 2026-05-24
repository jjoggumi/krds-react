<!--
@File(Method): StudentHealthCheck.vue
@Author: -
@Date Created: -
@Description: 시도교육청 학생건강 자가진단
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
@ETC : 10.24 운영에 확인 결과 현재 서비스 되지 않는 페이지 이지만 질병 관리 관련 내용이 이후에 사용 가능성 있음.
-->
<template>
  <div class="modal normal-modal free-send-sms-modal" style="display: block;">
    <div ref="modal" class="modal-cont-wrap">
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner" v-click-outside="closeLayer">
          <div class="modal-title-wrap">
            <div class="title">시도교육청 학생건강 자가진단</div>
          </div>
          <div class="self-health-wrap">
            <div class="health-txt">
              <p>
                학생이 다니는 학교의 <span class="ft-blue">지역</span>을 선택후
                <br />
                선생님께서 알려주신
                <span class="ft-blue">학생의 인증번호</span>와
                <span class="ft-blue">이름</span>을 입력하세요.
              </p>
            </div>
            <div class="self-health-input">
              <div>
                <div
                  class="border-selectbox-wrap custom-select-box-wrap"
                  :class="{
                    selected: option.isOpen.sidoSelect
                  }"
                >
                  <div
                    class="selected-option"
                    @click.prevent="
                      option.isOpen.sidoSelect = !option.isOpen.sidoSelect
                    "
                    v-click-outside="closeSidoSelect"
                  >
                    <div class="option-val placeholder">
                      {{ model.studentHealthCheck.sidoTitle }}
                    </div>
                  </div>
                  <div class="option-list-wrap">
                    <ul>
                      <li
                        v-for="sidoOfficeOfEducation of $store.state
                          .sidoOfficeOfEducations"
                        :key="sidoOfficeOfEducation.sidoCode"
                        :class="{
                          selected:
                            sidoOfficeOfEducation.sidoCode ===
                            model.studentHealthCheck.sidoCode
                        }"
                        @click="selectItem(sidoOfficeOfEducation)"
                      >
                        <div class="option-item">
                          {{ sidoOfficeOfEducation.sidoTitle }}
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div
                class="input-box-wrap"
                :class="{
                  focus: option.isFocus.pName
                }"
              >
                <input
                  type="text"
                  placeholder="학생성명"
                  maxlength="50"
                  v-model="model.studentHealthCheck.pName"
                  @focus="option.isFocus.pName = true"
                  @blur="option.isFocus.pName = false"
                />
              </div>
              <div
                class="input-box-wrap"
                :class="{
                  focus: option.isFocus.qstnCrtfcNo
                }"
              >
                <input
                  type="text"
                  ref="qstnCrtfcNo"
                  placeholder="인증번호 6자리"
                  maxlength="6"
                  :value="model.studentHealthCheck.qstnCrtfcNo"
                  @input="
                    model.studentHealthCheck.qstnCrtfcNo = $event.target.value
                  "
                  @keydown.enter.prevent.stop
                  @focus="option.isFocus.qstnCrtfcNo = true"
                  @blur="option.isFocus.qstnCrtfcNo = false"
                />
              </div>
            </div>
            <div class="confirm-btn-wrap">
              <button class="btn-bg-c" @click="confirm(true)">
                <!-- :class="{
                  dis: !isConfirm
                }"
                :disabled="!isConfirm" -->
                확인
              </button>
            </div>
            <!-- form 1 -->
            <form
              name="healthCheckForm"
              ref="healthCheckForm"
              :action="model.studentHealthCheck.popupUrl"
              target="_blank"
              method="POST"
              @submit.prevent="openWindow('healthCheckForm')"
            >
              <input
                type="hidden"
                name="pName"
                maxlength="50"
                v-model="model.studentHealthCheck.pName"
              />
              <input
                type="hidden"
                name="qstnCrtfcNo"
                maxlength="6"
                v-model="model.studentHealthCheck.qstnCrtfcNo"
              />
              <input
                type="hidden"
                name="qstnCrtfcNoEncpt"
                maxlength="50"
                v-model="model.studentHealthCheck.qstnCrtfcNoEncpt"
              />
              <input
                type="hidden"
                name="rtnRsltCode"
                maxlength="50"
                v-model="model.studentHealthCheck.rtnRsltCode"
              />
              <button
                type="submit"
                ref="healthCheckFormBtn"
                class="btn-bg-w2 mt-10"
                style="display: none;"
              >
                확인
              </button>
            </form>
            <!-- // form 1 -->

            <!-- form 2 -->
            <form
              name="healthCheckHiddenForm"
              ref="healthCheckHiddenForm"
              :action="model.studentHealthCheckHidden.popupUrl"
              target="_blank"
              method="POST"
              @submit.prevent="openWindow('healthCheckHiddenForm')"
            >
              <input
                type="hidden"
                name="pName"
                maxlength="50"
                v-model="model.studentHealthCheckHidden.pName"
              />
              <input
                type="hidden"
                name="qstnCrtfcNo"
                maxlength="6"
                v-model="model.studentHealthCheckHidden.qstnCrtfcNo"
              />
              <input
                type="hidden"
                name="qstnCrtfcNoEncpt"
                maxlength="50"
                v-model="model.studentHealthCheckHidden.qstnCrtfcNoEncpt"
              />
              <input
                type="hidden"
                name="rtnRsltCode"
                maxlength="50"
                v-model="model.studentHealthCheckHidden.rtnRsltCode"
              />
              <button
                type="submit"
                ref="healthCheckHiddenFormBtn"
                class="btn-bg-w2 mt-10"
                style="display: none;"
              >
                확인
              </button>
            </form>
            <!-- // form 2 -->
            <div class="health-txt">
              <p>
                아래 저장된 학생정보를 선택하면, 바로 학생의 건강진단페이지로
                이동합니다.
              </p>
            </div>

            <div
              class="scrollbar-outer self-health-list"
              style="min-height: 200px;"
            >
              <ul>
                <li
                  v-for="(studentHealthCheck, i) of model.studentHealthChecks"
                  :key="`${studentHealthCheck.qstnCrtfcNoEncpt}-${i}`"
                >
                  <a
                    href="javascript:void(0)"
                    @click="openLink(studentHealthCheck)"
                    >{{ studentHealthCheck.sidoTitle }} /
                    {{ studentHealthCheck.pName }} / *******</a
                  >
                </li>
              </ul>
            </div>

            <div
              class="modal-close-btn modal-close-icon"
              @click.self="closeLayer"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <loading-overlay
      :active.sync="option.isLoading"
      :can-cancel="false"
      :is-full-page="true"
      :color="'white'"
      :backgroundColor="'rgba(90,90,90,0.8)'"
    ></loading-overlay>
  </div>
</template>

<script>
import LoadingOverlay from 'vue-loading-overlay'
import qs from 'qs'

export default {
  name: 'StudentHealthCheck',
  components: {
    LoadingOverlay
  },
  props: {},
  data() {
    return {
      option: {
        isLoading: false,
        isOpen: {
          sidoSelect: false
        },
        isFocus: {
          pName: false,
          qstnCrtfcNo: false
        }
      },
      model: {
        studentHealthCheck: {
          sidoCode: null,
          sidoTitle: '지역선택',
          url: null,
          pName: null,
          qstnCrtfcNo: null,
          qstnCrtfcNoEncpt: '',
          rtnRsltCode: '',
          popupUrl: ''
        },
        studentHealthCheckHidden: {
          sidoCode: null,
          sidoTitle: '지역선택',
          url: null,
          pName: null,
          qstnCrtfcNo: null,
          qstnCrtfcNoEncpt: '',
          rtnRsltCode: '',
          popupUrl: ''
        },
        studentHealthChecks: []
      }
    }
  },
  localStorage: {
    studentHealthChecks: {
      type: Array,
      default: []
    }
  },
  computed: {
    isConfirm() {
      return (
        this.model.studentHealthCheck.sidoCode !== null &&
        this.model.studentHealthCheck.url !== null &&
        this.model.studentHealthCheck.pName !== null &&
        this.model.studentHealthCheck.qstnCrtfcNo !== null &&
        this.model.studentHealthCheck.qstnCrtfcNo.length === 6
      )
    }
  },
  watch: {
    'model.studentHealthCheck.qstnCrtfcNo'(val, oldVal) {
      if (this.$validation.isRegNumberAlpha(val))
        this.model.studentHealthCheck.qstnCrtfcNo = val.toUpperCase()
      else if (!this.$validation.isRegNumberAlpha(val)) {
        if (oldVal === undefined) oldVal = ''
        this.model.studentHealthCheck.qstnCrtfcNo = oldVal
        this.$refs.qstnCrtfcNo.value = oldVal
      }
    }
  },
  created() {
    this.model.studentHealthChecks = this.$localStorage.get(
      'studentHealthChecks'
    )
  },
  mounted() {
    this.initModal()

    this.$hiClass.toggleBodyClass('add', 'hidden')

    this.$nextTick(() => {
      this.$jqueryUtil.scrollbar()
    })
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    initModal() {
      const modalPosition = this.$comn.getModalPosition(this.$refs.modal)
      this.$refs.modal.style.marginTop = `-${modalPosition.m_height}px`
      this.$refs.modal.style.marginLeft = `-${modalPosition.m_width}px`
    },
    initModelStudentHealthCheck() {
      this.model.studentHealthCheck.sidoCode = null
      this.model.studentHealthCheck.sidoTitle = '지역선택'
      this.model.studentHealthCheck.url = null
      this.model.studentHealthCheck.pName = null
      this.model.studentHealthCheck.qstnCrtfcNo = null
      this.model.studentHealthCheck.qstnCrtfcNoEncpt = ''
      this.model.studentHealthCheck.rtnRsltCode = ''
      this.model.studentHealthCheck.popupUrl = ''
    },
    addStudentHealthChecks() {
      let isExist = false
      if (this.model.studentHealthChecks.length > 0) {
        const filteredArray = this.model.studentHealthChecks.filter(item => {
          return (
            item.qstnCrtfcNoEncpt ===
            this.model.studentHealthCheck.qstnCrtfcNoEncpt
          )
        })
        if (filteredArray.length > 0) isExist = true
      }

      this.$log.debug(`addStudentHealthChecks() isExist => `, isExist)

      if (!isExist) {
        this.model.studentHealthChecks.push(this.model.studentHealthCheck)

        this.$nextTick(() => {
          this.initModal()
          this.$jqueryUtil.scrollbar()
        })
      }

      this.$localStorage.set(
        'studentHealthChecks',
        this.model.studentHealthChecks,
        Array
      )
    },
    closeLayer() {
      this.$store.commit('setStudentHealthCheck', {
        isOpen: false
      })
    },
    closeSidoSelect() {
      this.option.isOpen.sidoSelect = true

      this.$nextTick(() => {
        this.option.isOpen.sidoSelect = false
      })
    },
    selectItem(item) {
      this.model.studentHealthCheck.sidoCode = item.sidoCode
      this.model.studentHealthCheck.sidoTitle = item.sidoTitle
      this.model.studentHealthCheck.url = item.url
    },
    confirm(isSave) {
      if (!this.isConfirm) {
        alert('입력정보를 확인하세요.')
        return false
      }
      let qstnCrtfcNoEncpt = this.model.studentHealthCheck.qstnCrtfcNoEncpt

      this.option.isLoading = true

      if (
        qstnCrtfcNoEncpt !== undefined &&
        qstnCrtfcNoEncpt !== null &&
        qstnCrtfcNoEncpt.length > 0
      ) {
        // open post popup
        setTimeout(() => {
          this.$refs.healthCheckFormBtn.click()

          if (isSave) this.addStudentHealthChecks()

          this.option.isLoading = false
        }, 100)
      } else {
        this.model.studentHealthCheck.qstnCrtfcNo = this.model.studentHealthCheck.qstnCrtfcNo.toUpperCase()

        const pName = this.model.studentHealthCheck.pName
        const qstnCrtfcNo = this.model.studentHealthCheck.qstnCrtfcNo

        let url = `${this.model.studentHealthCheck.url}/stv_cvd_co00_011.do`
        let params = qs.stringify({
          pName,
          qstnCrtfcNo
        })

        this.model.studentHealthCheck.popupUrl = `${this.model.studentHealthCheck.url}/stv_cvd_co00_000.do`

        /**
         * 20200604 healthChecks request (get only)
         */
        this.$axios({
          method: 'GET',
          url: `${
            process.env.VUE_APP_BASE_API_URI
          }/healthChecks/request?url=${encodeURIComponent(url + '?' + params)}`
        }).then(res => {
          try {
            const contents = JSON.parse(res.data) || null

            this.$log.debug(`contents => `, contents)

            if (contents) {
              const resultSVO = contents.resultSVO
              const rtnRsltCode = resultSVO.rtnRsltCode
              const qstnCrtfcNoEncpt = resultSVO.qstnCrtfcNoEncpt

              this.model.studentHealthCheck.rtnRsltCode = rtnRsltCode
              this.model.studentHealthCheck.qstnCrtfcNoEncpt = qstnCrtfcNoEncpt

              if (resultSVO.rtnRsltCode === 'SUCCESS') {
                // open post popup
                setTimeout(() => {
                  this.$refs.healthCheckFormBtn.click()

                  if (isSave) this.addStudentHealthChecks()

                  this.option.isLoading = false
                }, 100)
              } else {
                this.option.isLoading = false
                alert('입력정보를 확인하세요.')
              }
            } else this.option.isLoading = false
          } catch (error) {
            this.$log.warn(error)
            alert(error)
            this.option.isLoading = false
          }
        })
      }
    },
    openWindow(target) {
      let form = document[target]
      form.target = target

      window.open(
        '',
        form.target,
        `height=${screen.availHeight - screen.availHeight / 5},
         width=${screen.availWidth - screen.availWidth / 3},
         top=0,left=0,resizable,scrollbars=1`
      )
      form.submit()
    },
    openLink(item) {
      this.option.isLoading = true

      this.model.studentHealthCheckHidden = item

      setTimeout(() => {
        this.$refs.healthCheckHiddenFormBtn.click()

        this.option.isLoading = false
      }, 100)
    }
  }
}
</script>
<style lang="scss" scoped>
.self-health-wrap {
  padding: 0 0 10px;

  .confirm-btn-wrap {
    padding: 0;
    border-top: none;
  }

  .health-txt > p {
    transform: skew(0.2deg);
    color: #333;
    font-size: 15px !important;
    line-height: 150%;
    margin: 24px 0 10px;
  }

  .self-health-input {
    width: 100%;
    margin: 20px 0;

    > div {
      display: inline-block;
      vertical-align: middle;
      font-size: 0;
      width: 30%;
      margin: 0 10px 0 0;
    }
  }

  .input-box-wrap input {
    height: 34px;
    line-height: 32px;
  }

  .hour:after {
    content: ':';
    position: absolute;
    right: -20px;
    top: 19px;
    display: inline-block;
    font-size: 15px;
    font-weight: bold;
  }

  .minute {
    width: 31%;
  }

  .wave {
    margin: 0 21px;
    font-size: 13px;
  }

  .border-selectbox-wrap {
    .option-list-wrap {
      height: 180px;
      overflow-y: scroll;
      li {
        .option-item {
          height: 40px;
          line-height: 40px;
          padding: 0 0 0 4px;
          border-bottom: 1px solid #eaeaea;
          font-weight: bold;
          color: #888;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14px;
          transform: skew(0.05deg);
          text-align: left;
        }
      }
    }
  }
}

.self-health-list{
    max-height: 320px;
    min-height: 70px;
    height: 100%;
   
}
.self-health-list ul {
    margin: 20px 0;  
    border-top: 1px solid #eaeaea;
}
.self-health-list ul li{
    display: block;
    padding: 12px 40px;
    border-bottom: 1px solid #eaeaea;
    text-align: left;
}
.self-health-list ul li:last-child{
    border-bottom:none;
}
.self-health-list ul li a{
    color: #224fac;
    text-decoration: underline;
    transform: skew(0.05deg);
}
</style>