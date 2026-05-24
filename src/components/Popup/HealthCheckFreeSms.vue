<!--
@File(Method): HealthCheckFreeSms.vue
@Author: -
@Date Created: -
@Description: 학생 건강상태 자가진단 무료문자 전송
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
@ETC : 4년전 수정된 파일로 현재 사용하는지 여부 알수 없음. ( 미사용 파일로 추정됨 )
-->
<template>
  <div class="modal normal-modal free-send-sms-modal" style="display: block">
    <div class="modal-cont-wrap" ref="modal">
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">
              학생 건강상태 자가진단 무료문자 전송
            </div>
          </div>
          <div class="free-sns-wrap">
            <div v-if="visible.edit">
              <div class="all-upload-wrap">
                <span>일괄 등록</span>
                <p class="tl">
                  양식을 다운받아 정보를 입력하신 뒤 파일을 업로드해주세요.
                  <br />
                  입력하신 정보로 개별 문자가 무료로 발송됩니다.
                </p>
                <p></p>
              </div>

              <div class="up-down-btns-wrap">
                <hc-json-down
                  class="btn-bg-w2 icon add-icon download"
                  :data="json.items"
                  :cols="json.cols"
                  :rowNum="false"
                  :isCellTextFomat="true"
                  name="[하이클래스]학생건강자가진단_일괄등록양식"
                >
                  등록 양식 다운로드
                </hc-json-down>
              </div>
              <div class="up-down-btns-wrap">
                <input
                  type="file"
                  ref="attach"
                  @change="upload"
                  style="display:none"
                />
                <button
                  class="btn-bg-w2 icon add-icon upload"
                  :class="{ dis: option.isUploading }"
                  :disabled="option.isUploading"
                  @click="upload(null)"
                >
                  파일 업로드
                </button>
              </div>
              <div class="hp-box">
                <table>
                  <colgroup>
                    <col width="22%" />
                    <col width="*" />
                    <col width="20%" />
                    <col width="10%" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th scope="col">학생이름</th>
                      <th scope="col">휴대폰번호</th>
                      <th scope="col">인증번호</th>
                      <th scope="col">삭제</th>
                    </tr>
                    <tr v-for="item of model.healthChecks" :key="item.idx">
                      <td>{{ item.studentName }}</td>
                      <td :class="{ 'ft-orange': item.msg !== '' }">
                        {{ setPhoneStyle(item) }}
                      </td>
                      <td>{{ item.certificationCode }}</td>
                      <td>
                        <button
                          class="delete-btn"
                          @click="delPhone(item)"
                        ></button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="confirm-btn-wrap">
                <form @submit.prevent="save">
                  <button
                    type="submit"
                    class="btn-bg-c"
                    :class="{ dis: !isSave }"
                    :disabled="!isSave"
                  >
                    전송하기
                  </button>
                </form>
              </div>
              <div
                @click.self="closeLayer"
                class="modal-close-btn modal-close-icon"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <loading-overlay
      :active.sync="option.isUploading"
      :can-cancel="false"
      :is-full-page="true"
      :color="'white'"
      :backgroundColor="'rgba(90,90,90,0.8)'"
    ></loading-overlay>
  </div>
</template>

<script>
import HcJsonDown from '../Form/HcJsonDown'
import LoadingOverlay from 'vue-loading-overlay'

export default {
  name: 'HealthCheckFreeSms',
  components: {
    HcJsonDown,
    LoadingOverlay
  },
  props: {},
  data() {
    return {
      option: {
        phone: '',
        isUploading: false,
        isToast: false
      },
      visible: {
        edit: true
      },
      json: {
        items: [],
        cols: [
          { prop: 'schoolName', label: '학교' },
          { prop: 'sidoEducationOfficeUrl', label: '시도교육청 URL' },
          { prop: 'studentName', label: '학생이름' },
          { prop: 'phone', label: '전화번호(숫자만)' },
          { prop: 'certificationCode', label: '인증번호' },
          { prop: 'urlshortcutUrl2', label: '바로참여 URL' }
        ]
      },
      model: {
        healthChecks: []
      }
    }
  },
  computed: {
    isSave() {
      return (
        !this.option.isUploading &&
        this.model.healthChecks.length > 0 &&
        !this.model.healthChecks.find(item => item.msg !== '')
      )
    }
  },
  created() {
    this.sampleExcelData()
  },
  mounted() {
    this.initModal()

    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    sampleExcelData() {
      const SAMPLE_ITEMS_LENGTH = 6

      for (let i = 0; i < 100; i++) {
        let item = {}

        if (i > SAMPLE_ITEMS_LENGTH) {
          item = {
            schoolName: '',
            sidoEducationOfficeUrl: '',
            studentName: '',
            phone: '',
            certificationCode: '',
            urlshortcutUrl2: ''
          }
        } else {
          item = {
            schoolName: '서울OO초등학교',
            sidoEducationOfficeUrl: 'https://eduro.sen.go.kr/hcheck',
            studentName: `홍길동${i + 1}`,
            phone: '01012345678',
            certificationCode: `ABCDEF${i + 1}`,
            urlshortcutUrl2: 'https://eduro.sen.go.kr/hcheck/…….'
          }
        }

        this.json.items.push(item)
      }
    },
    initModal() {
      const modalPosition = this.$comn.getModalPosition(this.$refs.modal)
      this.$refs.modal.style.marginTop = `-${modalPosition.m_height}px`
      this.$refs.modal.style.marginLeft = `-${modalPosition.m_width}px`
    },
    setPhoneStyle(item) {
      let hyphenPhone = (item.phone || '')
        .replace(/[^\d]/g, '')
        .replace(/^(\d{3})-?(\d+)-?(\d{4})$/, '$1-$2-$3')
      if (item.msg !== '') {
        hyphenPhone = `${hyphenPhone} (${item.msg})`
      }

      return hyphenPhone
    },
    delPhone(item) {
      this.model.healthChecks = this.model.healthChecks.filter(phone => {
        return phone.idx !== item.idx
      })

      this.sortPhone()
      this.vailPhone()
    },
    sortPhone() {
      this.model.healthChecks.map((item, index) => {
        item.idx = index + 1
      })
    },
    vailPhone() {
      this.model.healthChecks.map(phone => {
        if (!/^(01{1}[016789]{1}|070{1})[0-9]{7,8}$/.test(phone.phone)) {
          phone.msg = '유효하지 않은 번호'
        } else if (
          this.model.healthChecks.find(
            f => f.phone === phone.phone && f.idx !== phone.idx
          )
        ) {
          phone.msg = '중복된 번호'
        } else {
          phone.msg = ''
        }
      })
    },
    upload(e) {
      if (e === null) {
        this.$refs.attach.click()
      } else {
        const file = (e.target.files || e.dataTransfer.files)[0]

        if (file) {
          let fileExt = file.name.substring(file.name.lastIndexOf('.'))
          if ('.xlsx'.indexOf(fileExt) < 0) {
            alert('올바른 확장자를 등록해 주세요.')
            this.$refs.attach.value = ''
            return
          }

          this.option.isUploading = true
          this.$hiClass.excels
            .uploadHealthCheck(file)
            .then(res => {
              res.data
                .filter(item => {
                  return (item.phone || '').toString().trim() !== ''
                })
                .map(item => {
                  this.model.healthChecks.push({
                    idx: this.model.healthChecks.length + 1,
                    msg: '',
                    schoolName: item.schoolName,
                    sidoEducationOfficeUrl: item.sidoEducationOfficeUrl,
                    studentName: item.studentName,
                    phone: (item.phone || '').replace(/[^\d]/g, ''),
                    certificationCode: item.certificationCode,
                    shortcutUrl: item.shortcutUrl
                  })
                })
            })
            .catch(err => {
              this.$log.debug(this.$options.name, ' upload() error => ', err)
            })
            .finally(() => {
              this.$refs.attach.value = ''
              this.option.isUploading = false
              if (this.model.healthChecks.length > 0) {
                this.vailPhone()
              } else {
                alert('조회 결과가 없습니다.')
              }

              this.$hiClass.toggleBodyClass('add', 'hidden')
            })
        }
      }
    },
    save() {
      this.$hiClass.sendMessages
        .healthCheck({
          healthChecks: this.model.healthChecks
        })
        .then(res => {
          if (res) {
            this.option.isToast = true

            this.$toasted.show(
              '학생 건강상태 자가진단 무료문자 전송이 완료되었습니다.'
            )
            this.closeLayer()

            setTimeout(() => {
              this.option.isToast = false
            }, 3000)
          }
        })
        .catch(err => {
          this.$log.debug(this.$options.name, ' save() error => ', err)
        })
    },
    closeLayer() {
      this.$store.commit('setHealthCheckFreeSms', {
        isOpen: false
      })
    }
  }
}
</script>
<style scoped>
.hp-box{
    height: 216px;
    margin: 16px 0;
    padding: 0 20px;
    border-top: 1px solid rgba(0,0,0,0.1);
    overflow: auto;
}
.hp-box table{width:100%;margin-top:20px;border-bottom: 1px solid #e1e1e1;}
.hp-box table th{
    padding: 8px 0;
    background: #cfcfcf;
    border-top: 2px solid #333;
    border-left: 1px solid #fff;
    transform: skew(0.2deg);
    font-weight: bold;
}
.hp-box table td{
    padding: 8px 0;
    border-top: 1px solid #e1e1e1;
    border-left: 1px solid #e1e1e1;
    transform: skew(0.2deg);
    font-weight: bold;
    color: #333;
    position:relative;
}
.hp-box table td:first-child{
    border-left:none;
}
.hp-box .delete-btn {position:absolute;top:3px;right:11px;width:24px;height:24px;background:url('../../assets/img/icon_delete_small_24.png');}
.hp-box .delete-btn:hover {background-position:-24px 0;}
.hp-box .delete-btn.dis {background-position:-48px 0;} 
</style>