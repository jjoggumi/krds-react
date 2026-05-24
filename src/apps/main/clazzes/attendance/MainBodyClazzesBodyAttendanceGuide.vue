<!--
@File(Method): MainBodyClazzesBodyAttendanceGuide.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 출결알리기 > 안내문구 관리
@Modified: 2025-03-17 - #72058 출결알리기 개선 (편리한 기능, 체험학습 개수 제한)
-->
<template>
  <div>
    <!-- 탭 변경영역 -->
    <div class="attendance-message-info">
      <div class="attendance-message-info-text">
        <div class="attendance-top-message">
          <div class="heading-sub">
            <h2>상단 안내문구</h2>
            <span>결석 제출 시 학부모에게 안내할 내용을 등록해주세요.</span>
          </div>
          <p>
            <textarea
              name="msg-top"
              placeholder="내용을 입력해주세요."
              v-model="guide.INFO"
              @focusout="patchGuides('INFO')"
              @input="checkLength($event, 255, 'INFO')"
              class="custom-scr"
            />
          </p>
        </div>

        <div class="attendance-kind">
          <div class="heading-sub">
            <h2>출결 구분</h2>
            <span>출결 구분 선택 시 안내할 내용을 등록해주세요.</span>
          </div>
          <p>
            <label for="absent">결석</label>
            <input
              type="text"
              id="absent"
              name="absent"
              placeholder="내용을 입력해주세요."
              v-model="guide.ABSENCE"
              @focusout="patchGuides('ABSENCE')"
              @input="checkLength($event, 30, 'ABSENCE')"
            />
          </p>
          <p>
            <label for="earlyout">조퇴</label>
            <input
              type="text"
              id="earlyout"
              name="earlyout"
              placeholder="내용을 입력해주세요."
              v-model="guide.EARLY_LEAVE"
              @focusout="patchGuides('EARLY_LEAVE')"
              @input="checkLength($event, 30, 'EARLY_LEAVE')"
            />
          </p>
          <p>
            <label for="late">지각</label>
            <input
              type="text"
              id="late"
              name="late"
              placeholder="내용을 입력해주세요."
              v-model="guide.LATENESS"
              @focusout="patchGuides('LATENESS')"
              @input="checkLength($event, 30, 'LATENESS')"
            />
          </p>
          <p>
            <label for="goout">외출</label>
            <input
              type="text"
              id="goout"
              name="goout"
              placeholder="내용을 입력해주세요."
              v-model="guide.OUT"
              @focusout="patchGuides('OUT')"
              @input="checkLength($event, 30, 'OUT')"
            />
          </p>
          <!-- #72058 출결알리기 - 가정 체험 학습 사용 여부 항목 추가 -->
          <p :class="{ off: !setting.attendanceFieldStudyUsed }">
            <label for="fieldtrip">가정 체험학습</label>
            <input
              type="text"
              id="fieldtrip"
              name="fieldtrip"
              placeholder="내용을 입력해주세요."
              v-model="guide.FIELD_STUDY"
              @focusout="patchGuides('FIELD_STUDY')"
              @input="checkLength($event, 30, 'FIELD_STUDY')"
            />
          </p>
          <div class="field-trip-set">
            <p class="desc">* 기본 항목 외 ‘가정 체험학습’을 사용하려면 ON으로 변경해주세요.</p>
            <ul class="gray-box">
              <li>
                <div class="label">가정 체험학습 사용</div>
                <div class="setting">
                  <hi-switch :model="setting.attendanceFieldStudyUsed" @update:model="onChangeFieldTrip" />
                </div>
              </li>
              <li :class="{ off: !setting.attendanceFieldStudyUsed }">
                <div class="label">
                  가정 체험학습 신청 가능일
                  <p class="smr">
                    학부모는 신청 가능일만큼 제출이 가능하며, <br />
                    선생님은 제한없이 등록 및 확인완료 할 수 있습니다. <br />
                    * 최대 30일까지 설정 가능
                  </p>
                </div>
                <div class="setting">
                  <input
                    type="number"
                    v-model="setting.classFieldStudyMaxDays"
                    @keyup="onChangeFieldStudyMaxDays"
                    @change="onChangeFieldStudyMaxDays"
                    @focusout="validateFieldStudyMaxDays"
                    min="1"
                    max="30"
                  />
                  일
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="attendance-holiday-setting">
          <div class="heading-sub">
            <h2>토/일, 공휴일 제출</h2>
            <span>
              사용 ON을 하시면 토/일,공휴일도 출결 알리기 제출을<br />
              할 수 있습니다.
            </span>
          </div>
          <div class="use-on">
            <hi-switch :model="setting.attendanceHolidayUsed" @update:model="(v) => patchSettingValue('attendanceHolidayUsed', v)" />
          </div>
        </div>
        <!-- #72058 출결알리기 - 첨부파일 사용 여부 위치 이동 및 HiSwitch 적용 -->
        <div class="attendance-top-fileon">
          <div class="heading-sub">
            <h2>첨부파일 사용 여부</h2>
            <span>사용 OFF 하시면, 신규 출결 알리기 제출 시 <br />첨부파일 등록이 불가합니다. 단, 사후 추가 서류 제출은 가능합니다. </span>
          </div>
          <div class="use-on">
            <hi-switch :model="setting.attendanceFileUsed" @update:model="(v) => patchSettingValue('attendanceFileUsed', v)" />
          </div>
        </div>
      </div>
      <div class="attendance-message-info-phone">
        <div class="attendance-phone">
          <div class="attendance-phone-view">
            <div class="header">
              <h2>출결 알리기</h2>
            </div>
            <div class="content">
              <div class="msg-top">
                <div class="info-text-msg-top custom-scr" readonly="" v-html="replaceInfo"></div>
              </div>
              <div class="normal">
                <label>자녀 이름</label>
                <span class="text" name="childName">김하이</span>
              </div>
              <div class="radio">
                <label>출결 구분</label>
                <!-- #72058 출결알리기 - 출결 구분 라디오에서 selecbox 로 변경 -->
                <HiSelectBox
                  :value="checkedRadio"
                  :items="[
                    { value: 'ABSENCE', title: '결석' },
                    { value: 'EARLY_LEAVE', title: '조퇴' },
                    { value: 'LATENESS', title: '지각' },
                    { value: 'OUT', title: '외출' },
                    ...(setting.attendanceFieldStudyUsed ? [{ value: 'FIELD_STUDY', title: '가정 체험학습' }] : []),
                  ]"
                  @update:value="checkedRadio = $event"
                  :empty-title="checkedRadio || '출결 구분'"
                />
                <p class="message">
                  <textarea class="info-text-kind-message custom-scr" v-model="guide[checkedRadio]" disabled></textarea>
                </p>
              </div>
              <!-- #72058 출결알리기 - 출결일 위치 이동 및 남은 일수 추가 -->
              <div class="calendar">
                <label>
                  출결일
                  <HiButton color="primary" size="xs" outline><HiIcon name="ico-plus2" color="primary" size="14"></HiIcon>날짜 추가</HiButton>
                </label>
                <p class="desc txt-gray" v-if="setting.attendanceFieldStudyUsed">
                  남은 일수 {{ setting.classFieldStudyMaxDays }}일 중
                  <span class="txt-primary">1일을 신청합니다.</span>
                </p>
                <span class="text">
                  {{ previewDate }}
                  <span class="date-btn"></span>
                </span>
              </div>
              <div class="normal">
                <label>사유</label>
                <input type="text" id="info-text-goout" name="info-text-goout" readonly="" value="감기로 병원 입원" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import HiButton from '@/components/Button/HiButton';
import HiSwitch from '@/components/Form/HiSwitch.vue';

export default {
  name: 'main-body-clazzes-body-attendance-guide',
  components: { HiButton, HiSwitch },
  data() {
    return {
      checkedRadio: 'ABSENCE',
      guide: {
        INFO: '', // 상단
        ABSENCE: '', // 결석
        EARLY_LEAVE: '', // 조퇴
        LATENESS: '', // 지각
        OUT: '', // 외출
        FIELD_STUDY: '', // 가정 체험학습
      },
      setting: {
        attendanceFileUsed: false,
        attendanceFieldStudyUsed: false,
        attendanceHolidayUsed: false,
        classFieldStudyMaxDays: '20',
      },
    };
  },
  computed: {
    ...mapGetters({
      curClassId: 'curClassId',
    }),
    previewDate() {
      const weekday = parseInt(this.$moment().format('e'));
      const isWeekend = [0, 6].includes(weekday);
      const isSunday = weekday === 0;
      return (
        this.$moment()
          .add(isWeekend ? (isSunday ? 1 : 2) : 0, 'd')
          .format('M월 D일') + ` ${'일월화수목금토'[isWeekend ? 1 : weekday]} ${isWeekend ? '' : '(오늘)'}`
      );
    },
    replaceInfo() {
      let info = this.guide.INFO;

      let expression =
        /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
      let regex = new RegExp(expression);

      let urlArr = info.match(regex);
      if (urlArr && urlArr.length > 0) {
        for (let i = 0; i < urlArr.length; i++) {
          info = info.replaceAll(urlArr[i], `<span style="color: #00f; text-decoration: underline">${urlArr[i]}</span>`);
        }
      }

      info = info.replaceAll(/(?:\r\n|\r|\n)/g, `<br>`);

      return info;
    },
  },
  methods: {
    ...mapActions('storeClazzes', {
      patchAttendanceGuidesGuides: 'patchAttendanceGuidesGuides',
      callAttendanceGuide: 'callAttendanceGuide',
    }),

    async fetchAttendancesSetting() {
      this.setting = (await this.$axios.get(`/attendances/setting/${this.curClassId}`)).data;
    },
    async setAttendanceGuide() {
      let payload = { classId: this.curClassId };

      payload.guideType = { guideType: ['INFO'] };
      const infoRes = await this.callAttendanceGuide(payload);
      const isShowDefaultInfo = Object.keys(infoRes).length === 0;
      this.guide.INFO = isShowDefaultInfo ? this.$t('attendance.guide.default.info') : infoRes.INFO;

      payload.guideType = { guideType: ['ABSENCE', 'EARLY_LEAVE', 'LATENESS', 'OUT', 'FIELD_STUDY'] };
      const res = await this.callAttendanceGuide(payload);
      for (const [key, value] of Object.entries(res)) {
        this.guide[key] = value;
      }
    },
    patchGuides(guideType) {
      if (guideType === 'INFO') {
        if (this.guide[guideType].trim().replaceAll(/(?:\r\n|\r|\n)/g, '').length === 0) {
          this.guide[guideType] = '';
        }
      }
      this.patchAttendanceGuidesGuides({
        classId: this.curClassId,
        guide: { [guideType]: this.guide[guideType] },
      });
    },
    checkLength(e, length, guideType) {
      if ([...e.target.value].length > length) {
        e.target.value = [...e.target.value].slice(0, length).join('');
        this.guide[guideType] = [...e.target.value].slice(0, length).join('');
        this.$toasted.clear();
        this.$toasted.show(`${length}자까지 가능합니다.`, { duration: 1000 });
      }
    },
    patchSettingValue(key, val) {
      this.setting[key] = val;
      this.$hiClass.clazzes.update({ [key]: val }, `/clazzes/${this.curClassId}`);
    },
    onChangeFieldTrip(val) {
      this.patchSettingValue('attendanceFieldStudyUsed', val);
      if (!val && this.checkedRadio === 'FIELD_STUDY') {
        this.checkedRadio = 'ABSENCE';
      }
    },
    async onChangeFieldStudyMaxDays({ target: { value } }) {
      const days = /^[0-9]\d*$/.test(value) ? parseInt(value) : '';
      if (days === '') return;
      this.patchSettingValue('classFieldStudyMaxDays', Math.min(Math.max(days, 1), 30));
    },
    validateFieldStudyMaxDays() {
      if (this.setting.classFieldStudyMaxDays === '' || this.setting.classFieldStudyMaxDays < 1) {
        this.patchSettingValue('classFieldStudyMaxDays', 20);
      }
    },
  },
  async created() {
    await this.setAttendanceGuide();
    await this.fetchAttendancesSetting();
  },
};
</script>

<style lang="scss" scoped>
.attendance-message-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .attendance-message-info-text {
    width: 415px;
  }
  .attendance-message-info-phone {
    width: 426px;
    height: 832px;
  }
}

// 좌측 영역
.attendance-message-info-text {
  .attendance-top-message {
    margin-top: 20px;
  }
  .heading-sub h2 {
    font-size: 18px;
    font-weight: 700;
    color: #000;
    height: 27px;
    line-height: 27px;
  }
  .heading-sub span {
    display: inline-block;
    font-size: 14px;
    font-weight: 400;
    color: #9e9e9e;
    margin-top: 3px;
    height: 21px;
    line-height: 21px;
  }
  .attendance-top-message p {
    margin-top: 12px;
    height: auto;
  }
  .attendance-top-message p textarea {
    width: 100%;
    height: 90px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.05);
    padding: 10px 15px;
    font-size: 15px;
    font-weight: 400;
    line-height: 23px;
    color: #222;
  }
  .attendance-top-message p textarea:focus {
    border: 1px solid #8ea4d1;
  }
  .attendance-kind {
    margin-top: 50px;
  }
  .attendance-kind > p {
    margin-top: 20px;
    display: flex;
    align-items: flex-start;
    gap: 4px;
    transition: 0.3s;
    height: 44px;
    overflow: hidden;
  }
  .attendance-kind > p.off {
    height: 0;
  }
  .attendance-kind > p:nth-of-type(1) {
    margin-top: 12px;
  }
  .attendance-kind > p label {
    display: block;
    height: 100%;
    width: 125px;
    line-height: 44px;
    font-size: 14px;
    font-weight: 500;
    color: #666666;
  }
  .attendance-kind > p input {
    width: 100%;
    height: 44px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    font-size: 15px;
    font-weight: 400;
    padding: 10px 15px;
  }
  .attendance-kind > p input:focus {
    border: 1px solid #8ea4d1;
    color: #222;
  }
  /* 가정체험학습 세팅 */
  .field-trip-set {
    margin-top: 27px;
  }
  .field-trip-set .desc {
    display: block;
    margin: 12px 0 14px;
  }
  .field-trip-set .gray-box {
    border-radius: 6px;
    padding: 20px;
  }
  .field-trip-set .gray-box li {
    display: flex;
    justify-content: space-between;
    align-items: center;   
  }
  .field-trip-set .gray-box li.off {
    height: 0;
    margin-top: 0px;
  }
  .field-trip-set .gray-box li + li {
    margin-top: 28px;
    overflow: hidden;
    transition: 0.3s;
    align-items: flex-start;  
    height:85px;
  }
  .field-trip-set .gray-box li .label {
    font-size: 15px;
    font-weight: 500;
    color: #222;
  }
  .field-trip-set .gray-box li .label .smr {
    margin-top: 16px;
    font-size: 13px;
    font-weight: 300;
    color: #9e9e9e;
  }
  .field-trip-set .gray-box li .setting {
    color: #222;
  }
  .field-trip-set .gray-box li .setting input {
    width: 55px;
    height: 44px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    font-size: 15px;
    font-weight: 400;
    padding: 10px 5px 10px 15px;
    margin-right: 6px;
  }
  .attendance-top-fileon {
    margin-top: 45px;
    position: relative;
  }
  .attendance-top-fileon .use-on {
    position: absolute;
    top: 3px;
    right: 20px;
  }
  .attendance-top-fileon .heading-sub span {
    margin-top: 10px;
    height: 42px;
  }
  .attendance-holiday-setting {
    margin-top: 45px;
    position: relative;
    .heading-sub span {
      margin-top: 10px;
      height: 42px;
    }
    .use-on {
      position: absolute;
      top: 3px;
      right: 20px;
    }
  }
}

/* 우측폰영역 */
.attendance-message-info-phone {
  .attendance-phone {
    width: 426px;
    height: 832px;
    background: url('~@/assets/img/bg_attendance_phone.svg') no-repeat center/cover;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .attendance-phone-view {
    width: 375px;
    height: 782px;
    background: #fff;
    border-radius: 40px;
  }
  .attendance-phone-view .header {
    height: 64px;
    border-bottom: 1px solid #0000001a;
    display: flex;
    justify-content: center;
    position: relative;
    h2 {
      line-height: 64px;
      font-size: 17px;
      font-weight: 500;
      color: #000;
    }
    span {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translate(-24px, -50%);
      width: 24px;
      height: 24px;
      background: url('~@/assets/img/icon/icon_close_black_s2.svg') no-repeat;
    }
  }
  .attendance-phone-view .content *{
      font-family: var(--font-body);
  }
  .attendance-phone-view .content {
      padding: 24px 20px;
      .msg-top {
          height: 68px;
          border-radius: 8px;
          border: 1px solid #FF6A6A;
          border-style: dashed;
          padding: 5px;
          padding-right: 0;
          overflow: hidden;
      }      
      .msg-top .info-text-msg-top {
          display: inline-block;
          width: 100%;
          height: 100%;
          padding: 11px;
          padding-right: 8px;
          border: 0;
          line-height: 20px;
          font-size: 14px;
          font-weight: 400;
          color: #888;
          word-break:break-all;
          overflow: auto;
          margin-top: 0px;
          white-space: pre-wrap;
      }      
      > div:not(.msg-top) {
          margin-top: 40px;
      }
      label {
          display: block;
          height: 14px;
          line-height: 14px;
          margin-bottom: 4px;
          font-size: 13px;
          font-weight: 700;
          color: #333;
          display: flex;
          align-items: center;
          justify-content: space-between;
      }
      label .hi-btn{    
          font-size: 12px;
          font-weight: 700;
          transform: skew(0deg);
      }
      input {
          width: 100%;
          height: 46px;
          border: 0;
          border-bottom: 1px solid #E0E0E0;
          font-size: 15px;
          font-weight: 400;
          color: #333;
          padding: 15px 0 14px 0;
      }
      span.text {
          width: 100%;
          height: 46px;
          border: 0;
          border-bottom: 1px solid #E0E0E0;
          font-size: 15px;
          font-weight: 400;
          color: #333;
          padding: 15px 0 14px 0;
          display: inline-block;
      }
      .calendar span.text {
          color: var(--primary);
          font-size: 15px;
          font-weight: 700;
          position: relative;
      }
      .calendar .desc{
          margin: 8px 0;
          font-size: 13px;
          font-weight: 400;
      }
      .calendar span span.date-btn {
          position: absolute;
          width: 24px;
          height: 24px;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          background: url("~@/assets/img/icon/icon_calendar_s2.svg") no-repeat;
      }
      .radio .hi-selectbox{
          width:100%;
          margin:4px 0;
      }
      .radio .hi-selectbox::v-deep .selected{
          height: 46px;
          border-radius: 8px;
          border: 1px solid #C4C4C4;
      }
      .radio p.message {
          height: 62px;
          border-radius: 8px;
          border: 1px solid #FF6A6A;
          background-color: #F8F9FB;
          border-style: dashed;
          padding: 5px;
          padding-right: 0;
          overflow: hidden;
      }
      .radio p.message textarea {
          display: inline-block;
          width: 100%;
          height: 100%;
          padding: 11px;
          padding-right: 8px;
          border: 0;
          font-size: 13px;
          font-weight: 400;
          line-height: 17px;
          color: #666; 
          background-color: #F8F9FB;
          word-break:break-all;
          overflow: auto;
      }
      .radio p.message textarea:disabled{    
          background-color: #F8F9FB;
      }
  }
}
</style>
