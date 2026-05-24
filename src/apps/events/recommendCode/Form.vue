<template>
  <div class="event-preschool-recommend-container">
    <div class="top-wrap">
      <span class="logo"></span>
    </div>

    <div class="container">
      <div class="info-wrap">
        <span class="period">이벤트 기간 : 2023.11.21(화) ~ 2024.02.29(목)</span>
        <img class="title-image" />
        <span class="recommend">공유받은 추천코드를 입력하고 <strong>5천원의 혜택</strong>을 받으세요!</span>
        <button @click="openNewPage">유치원 사용법 알아보기</button>
        <img class="info-image" />
      </div>


      <div class="content-wrap">
        <p class="top">
          <span class="title">신청정보</span>
          <span class="message">※ 이벤트 참여 완료 후 내용 수정이 불가하오니 정확히 입력해주세요.</span>
        </p>
        <div class="input">
          <div class="fd">
            <label for="code">1. 공유받은 추천코드를 입력해주세요.</label>
            <input
                type="text"
                id="code"
                name="code"
                :class="{
                  'warning': isChecked && form.recommendCode.trim().length === 0,
                  'dis': isAlreadyApply
                }"
                placeholder="영문 3자리 + 숫자 3자리"
                v-model="form.recommendCode"
                :disabled="isAlreadyApply"
            />
            <span
                v-if="isChecked && form.recommendCode.trim().length === 0 || isInCorrectCode || isMyCode"
                class="warning-message"
            >
              {{ isMyCode ? '나의(본인) 추천코드는 입력할 수 없습니다. 공유받은 추천코드를 입력해주세요' : '추천코드가 정확하지 않습니다.공유받은 추천코드를 확인해주세요.' }}
            </span>
          </div>

          <div class="fd select-1">
            <label for="region">2. 재직 중인 지역, 유치원 이름을 입력해주세요 (재직중이 아닌 경우 ‘없음’으로 표기)</label>
            <div class="area">
              <div class="hi-selectbox" :class="{'is-opened': isSelectBoxClick}" @click="setSelectBoxToggle">
                <button class="selected" :class="{'dis': isAlreadyApply}">{{ findSchoolAreaName(form.schoolArea) }}</button>
                <div class="option__layer">
                  <button
                      class="option"
                      :class="{'is-selected': form.schoolArea === schoolArea.code}"
                      v-for="schoolArea of schoolAreaCodes"
                      :key="schoolArea.code"
                      @click="form.schoolArea = schoolArea.code"
                  >
                    <span class="icon-color" style="background-color: #00B1A0"></span>{{ schoolArea.name }}
                  </button>
                </div>
              </div>
              <input
                  type="text"
                  id="region"
                  name="region"
                  :class="{
                    'warning': isChecked && form.schoolName.trim().length === 0,
                    'dis': isAlreadyApply
                  }"
                  placeholder="유치원 이름"
                  v-model="form.schoolName"
                  :disabled="isAlreadyApply"
              />
            </div>
            <span v-if="isChecked && form.schoolName.trim().length === 0" class="warning-message">지역 및 유치원 이름을 입력해주세요.</span>
          </div>

          <div class="fd">
            <label for="util">3. 유치원 선생님을 확인할 수 있는 자료를 첨부해주세요.<br/>(ex. 정교사 자격증, 재직증명서 등)</label>
            <div id="util" class="file" :class="{'dis': isAlreadyApply}">
              <input class="file-hidden" id="file" ref="fileUpload" type="file" @change="fileChange" hidden>
              <span>{{ form.file.fileName }}</span>
              <button v-if="!isAlreadyApply" for="file" class="btn-input-file" @click="openFile">파일첨부</button>
            </div>
            <span v-if="isChecked && form.file.fileOriginalPath.trim().length === 0" class="warning-message">첨부파일을 등록해주세요.</span>
          </div>

          <div class="fd">
            <label for="agreed-txt">4. 개인정보 수집 및 약관 동의</label>
            <div id="agreed-txt" class="agreed-txt">
              [개인정보의 수집 및 이용 목적]<br/>
              하이클래스에서 주최하는 이벤트 상품발송 관련하여 개인정보의 수집 및 이용 동의서를 받습니다.<br/>
              <br/>
              [개인정보 수집 항목]<br/>
              수집항목 : 신청자의 이름, 연락처, 지역, 유치원 이름, 증빙자료<br/>
              <br/>
              [개인정보 보유기간]<br/>
              수집된 개인정보는 수집이용 목적 달성 시까지 보존됩니다.<br/>
              <br/>
              이용자는 동의를 거부할 수 있습니다. 다만 개인정보 제공에 동의하신 경우에 한해 이벤트에 참여하실 수 있습니다.
            </div>
            <div class="agreed-check">
              <input type="checkbox" name="agreed" id="agreed2" v-model="isAgree" :class="{'dis': isAlreadyApply}" :disabled="isAlreadyApply">
              <label for="agreed2"><span>개인정보 수집 및 이용 관련 약관 동의 (필수) </span></label>
            </div>
            <span v-if="isChecked && !isAgree" class="warning-message agreed">이벤트 참여를 위해 약관 동의 여부를 선택해주세요.</span>
          </div>
        </div>
        <div class="banner-bonus">
          <p class="text">
            <span class="m">가장 많이 이벤트에 참여한 <br class="m-br"/><strong>유치원 TOP 5</strong></span>
            <span class="s">신규 가입 선생님들께는 커피 쿠폰을 추가로 드려요.<br/>
              주변 선생님들과 함께 많은 참여 부탁드립니다.</span>
          </p>
          <img class="banner-bonus-img"/>
        </div>

        <div class="button" :class="{'dis': isAlreadyApply}">
          <button @click="setRecommend">{{ isAlreadyApply ? '이벤트 참여완료' : '이벤트 참여하기' }}</button>
        </div>
      </div>

      <div class="footer-wrap">
        <span class="title">유의사항</span>
        <div class="info">
          <span class="m">본인을 추천할 수 없으며, 이벤트 상품지급 시점 전에 탈퇴하신 선생님은 이벤트에서 제외
            됩니다.</span>
          <span class="m">이벤트 시작일 이후 신규 가입하신 유치원 선생님에 한하여 참여가 가능하며, 부정적인
            방법으로 참여시 이벤트 참여가 무효처리 됩니다.</span>
          <p>
            <span>추천코드는 1회만 입력 가능하며 수정이 불가합니다.</span>
            <span>이벤트 당첨 시 마이페이지에  휴대폰 번호로 기프티콘이 발송됩니다.</span>
            <span>휴대폰 번호 오기재 등으로 인해 오발송되는 경품은 재발송이 불가합니다.</span>
            <span>피추천인은 추천을 여러번 받아도 1회만 혜택이 지급됩니다.</span>
            <span>본 이벤트는 하이클래스 사정에 따라 이벤트 내용이 변경될 수 있습니다.</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";
import axios from "axios";

export default {
  name: "recommend-code-form",
  data() {
    return {
      form: {
        eventId: '',
        postId: '',
        userId: '',
        recommendUserId: '',
        recommendCode: '',
        schoolArea: 'SEOUL',
        schoolName: '',
        file: {
          fileName: '',
          fileSize: 0,
          filecontentType: '',
          fileOriginalPath: ''
        }
      },
      isMyCode: false,
      isInCorrectCode: false,
      isChecked: false,
      isAgree: false,
      isAlreadyApply: false,
      isSelectBoxClick: false,
      userType: '',
      userInsertedTimestamp: null,
      schoolAreaCodes: [
        { code: "SEOUL", name: "서울" },
        { code: "GYEONGGI", name: "경기" },
        { code: "BUSAN", name: "부산" },
        { code: "DAEGU", name: "대구" },
        { code: "INCHEON", name: "인천" },
        { code: "GWANGJU", name: "광주" },
        { code: "DAEJEON", name: "대전" },
        { code: "ULSAN", name: "울산" },
        { code: "SEJONG", name: "세종" },
        { code: "KANGWON", name: "강원" },
        { code: "CHUNGBUK", name: "충북" },
        { code: "CHUNGNAM", name: "충남" },
        { code: "JEONBUK", name: "전북" },
        { code: "JEONNAM", name: "전남" },
        { code: "GYEONGBUK", name: "경북" },
        { code: "GYEONGNAM", name: "경남" },
        { code: "JEJU", name: "제주" },
        { code: "NONE", name: "없음" },
      ],
      eventStartDay: ''
    }
  },
  props: {
    eventId: {
      type: String
    },
    postId: {
      type: String
    }
  },
  computed: {
    ...mapState({
      isMobileObj: 'isMobileObj'
    }),
    ...mapGetters({
      isMobile: 'isMobile'
    })
  },
  async created() {
    await this.getEventStartDay()
    await this.getRecommend()
    await this.getUser()
  },
  methods: {
    async getEventStartDay() {
      try {
        const res = await axios({
          method: 'GET',
          url: 'https://download.hiclass.net/static/event/recommendEvent.json'
        })

        if (process.env.VUE_APP_BASE_UI_URI === 'https://www.hiclass.net') {
          this.eventStartDay = res.data.eventStartDay.production
        } else if (process.env.VUE_APP_BASE_UI_URI === 'https://stage.hiclass.net') {
          this.eventStartDay = res.data.eventStartDay.stage
        } else if (process.env.VUE_APP_BASE_UI_URI === 'https://devui.hiclass.net') {
          this.eventStartDay = res.data.eventStartDay.dev
        } else {
          this.eventStartDay = res.data.eventStartDay.production
        }
      } catch (e) {}
    },

    findSchoolAreaName(code) {
      return this.schoolAreaCodes.find(schoolArea => schoolArea.code === code).name
    },
    /**
     * 신청한 추천 정보 조회
     */
    async getRecommend() {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/eventRecommends/${this.eventId}/${localStorage.getItem('uuid')}`
        })
        for (const key of Object.keys(this.form)) {
          this.form[key] = res.data[key]
        }
        this.isAgree = true
        this.isAlreadyApply = true
      } catch (e) {
        this.$log.error(e)
      }
    },

    /**
     * 유저 정보
     * @returns {Promise<void>}
     */
    async getUser() {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/users/${localStorage.getItem('uuid')}`
        })
        this.userInsertedTimestamp = res.data.insertedTimestamp
        this.userType = res.data.userType
      } catch (e) {
        this.$log.error(e)
      }
    },

    /**
     * 신청하기
     * @returns {Promise<void>}
     */
    async setRecommend() {
      // 이미 참여 완료
      if (this.isAlreadyApply) {
        this.$hiClass.alert('이미 이벤트 참여가 완료되었습니다.')
        return false
      }

      // 선생님이 아니면 참여 불가
      if (this.userType !== 'TEACHER') {
        this.$hiClass.alert('선생님 회원만 참여가 가능한 이벤트입니다.')
        return false
      }

      // 이벤트 시작일 이전 가입자는 참여 불가
      if (this.userInsertedTimestamp < this.$moment(this.eventStartDay).valueOf()) {
        const dateForamt = this.$moment(this.eventStartDay).format('YYYY.MM.DD')
        this.$hiClass.alert(`${dateForamt} 이후 신규 가입자만<br>입력이 가능한 페이지 입니다.<br>이전에 가입한 경우<br>‘내 추천코드 공유하기’만 참여 가능합니다.`)
        return false
      }

      // 한번 유효성 검사했는지 체크하는 값
      this.isChecked = true

      //입력값 모두 있는지 체크
      if (
          this.form.recommendCode.trim().length === 0 ||
          this.form.schoolName.trim().length === 0 ||
          this.form.file.fileOriginalPath.trim().length === 0 ||
          !this.isAgree
      ) {
        this.$hiClass.alert('입력한 정보를 확인해주세요.')
        return false
      }

      // 추천코드가 유효한지 체크
      try {
        this.form.recommendUserId = await this.getRecommendUserId()

        // 내 추천코드를 입력했는지
        if (localStorage.getItem('uuid') === this.form.recommendUserId) {
          this.isMyCode = true
          this.$hiClass.alert('입력한 정보를 확인해주세요.')
          return false
        }

        if (this.isInCorrectCode) {
          this.isInCorrectCode = false
        }
      } catch (e) { // 추천코드로 조회안된 경우
        if (this.isMyCode) {
          this.isMyCode = false
        }

        // 유효하지 않은 코드 입력시
        this.isInCorrectCode = true
        this.$hiClass.alert('입력한 정보를 확인해주세요.')
        return false
      }

      this.form.eventId = this.eventId
      this.form.postId = this.postId
      this.form.userId = localStorage.getItem('uuid')
      this.form.recommendCode = this.form.recommendCode.toUpperCase()

      try {
        const res = await this.$axios({
          method: 'POST',
          url: `/eventRecommends`,
          data: this.form
        })

        this.$hiClass.alert('이벤트 참여가 완료되었습니다.')
            .then(() => {
              this.joinComplete()
            })
      } catch (e) {
        if (e.response.status === 409) {
          this.$hiClass.alert('이미 이벤트 참여가 완료되었습니다.')
        } else {
          this.$log.error(e)
        }
      }
    },

    /**
     * 참여완료후
     */
    joinComplete() {
      if (this.isMobile) {
        // aos
        if (this.isMobileObj.android.device || this.isMobileObj.android.phone || this.isMobileObj.android.tablet) {
          AOSHandler.goBack()
        } else { // ios
          const postMessage = {
            command: 'goBack',
          }
          window.webkit.messageHandlers.iOSHandler.postMessage(postMessage)
        }
      } else { // web
        window.close()
      }
    },

    /**
     * 추천코드의 유저정보 조회
     * @returns {Promise<void>}
     */
    async getRecommendUserId() {
      const res = await this.$axios({
        method: 'GET',
        url: `/userRecommendCodes/${this.form.recommendCode}`
      })
      return res.data.userId
    },

    /**
     * 학교지역 셀렉트박스 컨트롤
     * @returns {boolean}
     */
    setSelectBoxToggle() {
      if (this.isAlreadyApply) {
        return false
      }
      this.isSelectBoxClick = !this.isSelectBoxClick
    },

    /**
     * 파일 업로드
     * @param e
     */
    openFile(e) {
      e.preventDefault()
      this.$refs.fileUpload.value = ''
      this.$refs.fileUpload.click()
    },
    async fileChange(e) {
      e.preventDefault()
      const files = e.target.files || e.dataTransfer.files

      if (files[0].type.indexOf('video') !== -1 || files[0].type.indexOf('audio') !== -1) {
        return false
      }
      const isNotAllowExtensions = this.$store.state.isNotAllowExtensions
      if(isNotAllowExtensions.includes(files[0].name.substring(files[0].name.lastIndexOf('.') + 1, files[0].name.length).toLowerCase())) {
        this.$hiClass.alert('지원하지 않는 파일 형식입니다.')
        return;
      }
      this.$hiClass.multipart.upload(files[0])
          .then(res => {
            this.form.file.fileName = res.data.filename
            this.form.file.fileSize = res.data.size
            this.form.file.fileContentType = res.data.contentType
            this.form.file.fileOriginalPath = res.data._links.original.href
          })

      this.$refs.fileUpload.value = ''
    },

    /**
     * 유치원 사용법 새탭으로 열기
     */
    openNewPage() {
      const infoUrl = `${process.env.VUE_APP_BASE_UI_URI}${this.$route.fullPath.replace('form','info')}`
      if (this.isMobile) {
        // aos
        if (this.isMobileObj.android.device || this.isMobileObj.android.phone || this.isMobileObj.android.tablet) {
          AOSHandler.openNewPage(infoUrl)
        } else { // ios
          const postMessage = {
            command: 'openNewPage',
            url: infoUrl
          }
          window.webkit.messageHandlers.iOSHandler.postMessage(postMessage)
        }
      } else { // web
        window.open(infoUrl, '_blank');
      }
    }
  }
}
</script>

<style scoped>

</style>