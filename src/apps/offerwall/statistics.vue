<!--
@File(Method): statistics.vue
@Author: -
@Date Created: - 2025-01-13
@Description: 오퍼월 업체 관리자 > 광고통계
-->
<template>
  <div class="container statistics" v-if="isShow">
    <div class="title-wrap">
      <h2>광고 통계</h2>
    </div>
    <div class="form-area">
      <div class="form-group row">
        <label class="col-sm-1 col-form-label">검색항목</label>
        <div class="col-3">
          <select class="form-control" name="searchFieldType" v-model="searchForm.searchFieldType" @change="resetSearchKeyword">
            <option value="BRAND">브랜드</option>
            <option value="APPLICANT">신청자명</option>
            <option value="PHONE">핸드폰 번호</option>
            <option value="GRADE">선택학년</option>
          </select>
        </div>
        <div class="col-3">
          <input type="text" name="searchKeyword" v-model="searchForm.searchKeyword" v-if="isInputType(searchForm.searchFieldType)"
                 class="form-control" placeholder="입력">
          <select class="form-control" name="searchFieldType" v-model="searchForm.searchKeyword"
                  v-if="searchForm.searchFieldType === 'GRADE'">
            <option value="" selected>학년선택</option>
            <option v-for="(grade, index) in grades" :key="index" :value="grade.value">
              {{ grade.label }}
            </option>
          </select>
          <select class="form-control" name="searchFieldType" v-model="searchForm.searchKeyword"
                  v-if="searchForm.searchFieldType === 'BRAND'">
            <option value="">전체</option>
            <option
                v-for="(brand, index) in brands"
                :key="brand.brandId"
                :value="brand.brandId"
            >
              {{ brand.brandName }}
            </option>
          </select>
        </div>
        <div class="col-2">
          <select class="form-control" v-model="searchForm.size">
            <option value="10">10개씩 보기</option>
            <option value="20">20개씩 보기</option>
            <option value="50">50개씩 보기</option>
            <option value="100">100개씩 보기</option>
          </select>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-sm-1 col-form-label">기간선택</label>

        <!-- 추가 -->
        <div class="col-1">
          <button class="btn btn-block" :class="searchForm.periodType === 'date' ? 'btn-primary': 'btn-outline-secondary'"
                  @click="searchForm.periodType='date'">일별
          </button>
        </div>
        <div class="col-1">
          <button class="btn btn-block" :class="searchForm.periodType === 'period' ? 'btn-primary': 'btn-outline-secondary'"
                  @click="searchForm.periodType='period'">기간
          </button>
        </div>

        <template v-if="searchForm.periodType === 'date'">
          <div class="col-2">
            <div class="input-calendar">
              <input type="input" class="form-control" v-model="selectedDate" @click="isOpenDateCalendar = true">
              <i class="fas fa-calendar-alt" @click="isOpenDateCalendar = true"></i>
            </div>
            <calendar-monthly
                v-if="isOpenDateCalendar"
                :value-goe="this.twoMonthsBefore"
                :value-loe="this.today"
                :isBoardUse="true"
                :isNoPreSelect="true"
                :hidePrevBtn="true"
                :showBeforeMonth=2
                :hideNextBtn="true"
                :showAfterMonth=0
                calendarType="type03"
                @selectedDate="setCalendarFilter"
                @close="close"
                v-click-outside="close"
            />
          </div>
          <div class="col-3">
            <select class="form-control" v-model="startTime">
              <option v-for="time in timeOptionsStart" :key="time" :value="time">{{ time }}</option>
            </select>
          </div>
          <div class="col-3">
            <select class="form-control" v-model="endTime">
              <option v-for="time in timeOptionsEnd" :key="time" :value="time">{{ time }}</option>
            </select>
          </div>
        </template>
        <template v-else-if="this.searchForm.periodType === 'period'">
          <div class="col-4">
            <div class="input-calendar">
              <input type="input" class="form-control" v-model="startDate" @click="isOpenBeginPeriodCalendar = true">
              <i class="fas fa-calendar-alt" @click="isOpenBeginPeriodCalendar = true"></i>
            </div>
            <calendar-monthly
                v-if="isOpenBeginPeriodCalendar"
                :value-goe="this.twoMonthsBefore"
                :value-loe="this.today"
                :isBoardUse="true"
                :isNoPreSelect="true"
                :hidePrevBtn="true"
                :showBeforeMonth=2
                :hideNextBtn="true"
                :showAfterMonth=0
                calendarType="type03"
                @selectedDate="setCalendarFilter"
                @close="close"
                v-click-outside="close"
            />
          </div>
          <div class="col-4">
            <div class="input-calendar">
              <input type="input" class="form-control" v-model="endDate" @click="isOpenEndPeriodCalendar = true">
              <i class="fas fa-calendar-alt" @click="isOpenEndPeriodCalendar = true"></i>
            </div>
            <calendar-monthly
                v-if="isOpenEndPeriodCalendar"
                :value-goe="this.twoMonthsBefore"
                :value-loe="this.today"
                :isBoardUse="true"
                :isNoPreSelect="true"
                :hidePrevBtn="true"
                :showBeforeMonth=2
                :hideNextBtn="true"
                :showAfterMonth=0
                calendarType="type03"
                @selectedDate="setCalendarFilter"
                @close="close"
                v-click-outside="close"
            />
          </div>
        </template>
        <div class="col-1">
          <button class="btn btn-primary btn-block" @click="search">확인</button>
        </div>
      </div>
    </div>
    <div class="result-wrap">
      <div class="result-title">
        <div class="tit">신청 개수 <span class="text-primary">{{ totalElements }}</span></div>
        <div class="btns">
          <button class="btn btn-outline-success" @click="openExcelPopup">
            <i class="fas fa-file-excel"></i>
            엑셀 다운로드
          </button>
        </div>
      </div>
      <div class="result-list">
        <table class="table table-bordered">
          <colgroup>
            <col style="width: 50px">
            <col style="width: auto">
            <col style="width: auto">
            <col style="width: auto">
            <col style="width: 150px">
            <col style="width: 80px">
            <col style="width: auto" v-if="isGender">
            <col style="width: auto" v-if="isBirthday">
            <col style="width: 150px">
          </colgroup>
          <thead class="thead-dark">
          <tr>
            <th>NO</th>
            <th>업체명</th>
            <th>브랜드명</th>
            <th>신청자명</th>
            <th>핸드폰번호</th>
            <th>선택학년</th>
            <th v-if="isGender">성별</th>
            <th v-if="isBirthday">생년월일</th>
            <th v-if="showEntryPath">신청경로</th>
            <th>신청일시</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in data" :key="index">
            <td>{{ totalElements - (searchForm.page - 1) * searchForm.size - index }}</td>
            <td>{{ item.companyName }}</td>
            <td>{{ item.brandName }}</td>
            <td>{{ maskName(item.clientName) }}</td>
            <td>{{ maskPhoneNumber(item.phoneNumber) }}</td>
            <td>{{ item.grade }}</td>
            <td v-if="isGender">{{ formattedGenderType(item.offerwallGenderType) }}</td>
            <td v-if="isBirthday">{{ formattedDate(item.birthday) }}</td>
            <td v-if="showEntryPath">{{ isNewUser(item.entryPathType) }}</td>
            <td>{{ $moment(item.applyDate).format('YYYY.MM.DD HH:mm:ss') }}</td>
          </tr>
          <tr v-if="data.length === 0">
            <td :colspan="9" class="text-center pt-40 pb-40">데이터가 없습니다.</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <nav>
          <ul class="pagination justify-content-end">
            <!-- 첫 페이지로 이동 -->
            <li class="page-item" :class="{ disabled: searchForm.page === 1 }">
              <button class="page-link" @click="goToPage(1)">
                <i class="fas fa-angle-double-left"></i>
              </button>
            </li>

            <!-- 이전 페이지 -->
            <li class="page-item" :class="{ disabled: searchForm.page === 1 }">
              <button class="page-link" @click="goToPage(searchForm.page - 1)">
                <i class="fas fa-angle-left"></i>
              </button>
            </li>

            <!-- 페이지 번호 -->
            <li
                v-for="page in pageRange"
                :key="page"
                class="page-item"
                :class="{ active: searchForm.page === page }"
            >
              <button class="page-link" @click="goToPage(page)">{{ page }}</button>
            </li>

            <!-- 다음 페이지 -->
            <li class="page-item" :class="{ disabled: searchForm.page === totalPages }">
              <button class="page-link" @click="goToPage(searchForm.page + 1)">
                <i class="fas fa-angle-right"></i>
              </button>
            </li>

            <!-- 마지막 페이지로 이동 -->
            <li class="page-item" :class="{ disabled: searchForm.page === totalPages }">
              <button class="page-link" @click="goToPage(totalPages)">
                <i class="fas fa-angle-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    <!-- 엑셀 다운로드 모달 -->
    <div class="modal modal-excel" v-show="isPasswordPopupVisible" @click="closePasswordPopup">
      <div class="modal-dialog modal-md" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title text-center">엑셀 비밀번호를 확인해 주세요.</h4>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <input type="text" class="form-control" v-model="password" readonly>
              <div class="input-group-append">
                <button type="button" :class="buttonClass" @click="copyPassword">{{ buttonText }}</button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="img-wrap-loading" v-if="isLoading">
              <div class="icon"></div>
            </div>
            <span v-else class="btn btn-primary btn-lg" @click="downloadExcel">확인</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import CalendarMonthly from "@/components/Calendar/CalendarMonthly.vue";

export default {
  name: 'Statistics',
  components: {CalendarMonthly},
  props: {
    companyInfo: {
      type: Object,
      default: () => {}
    },
    isShow: Boolean
  },
  data() {
    return {
      isBirthday: false,
      isGender: false,
      isAddress: false,
      isQuestion: false,
      questionTitle: '',
      data: [],
      excelData: [],
      timeOptionsStart: [],
      timeOptionsEnd: [],
      searchForm: {
        periodType: 'date',
        searchFieldType: 'BRAND',
        searchKeyword: '',
        startDate: '',
        endDate: '',
        page: parseInt(process.env.VUE_APP_BASE_PAGE_START, 10),
        size: parseInt(process.env.VUE_APP_BASE_PAGE_SIZE, 10),
        sort: 'applyTimestamp,desc'
      },
      option: {
        slickOptions: {
          speed: 300,
          draggable: true,
          variableWidth: true,
          infinite: false,
          cssEase: 'linear'
        }
      },
      brands: [],
      selectedDate: this.$moment().format('YYYY-MM-DD'),
      startDate: this.$moment().format('YYYY-MM-DD'),
      endDate: this.$moment().format('YYYY-MM-DD'),
      startTime: '00:00',
      endTime: '00:00',
      totalElements: 0,
      buttonText: "복사",
      buttonClass: "btn btn-warning",
      isPasswordPopupVisible: false,
      password: '',
      isOpenDateCalendar: false,
      isOpenBeginPeriodCalendar: false,
      isOpenEndPeriodCalendar: false,
      isLoading: false,
      twoMonthsBefore: this.getTwoMonthsBefore(),
      today: new Date().getTime(),
      grades: [
        { value: "A4", label: "4세" },
        { value: "A5", label: "5세" },
        { value: "A6", label: "6세" },
        { value: "A7", label: "7세" },
        { value: "E1", label: "초1" },
        { value: "E2", label: "초2" },
        { value: "E3", label: "초3" },
        { value: "E4", label: "초4" },
        { value: "E5", label: "초5" },
        { value: "E6", label: "초6" },
        { value: "M1", label: "중1" },
        { value: "M2", label: "중2" },
        { value: "M3", label: "중3" },
        { value: "H1", label: "고1" },
        { value: "H2", label: "고2" },
        { value: "H3", label: "고3" },
        { value: "AD", label: "성인" },
      ],
    };
  },
  created() {
    this.endTime = "23:59";
    this.timeOptionsStart = this.generateTimeOptions();
    this.timeOptionsEnd = this.generateTimeOptions();
    this.timeOptionsEnd.push('23:59')
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalElements / this.searchForm.size);
    },
    pageRange() {
      const range = 5;
      const start = Math.max(1, this.searchForm.page - Math.floor(range / 2));
      const end = Math.min(this.totalPages, start + range - 1);

      return Array.from({length: end - start + 1}, (_, i) => start + i);
    },
    showEntryPath() {
      const companyName = this.companyInfo.companyName.replaceAll(' ', '');
      return companyName.includes('아이스크림에듀') ? true : false;
    }
  },
  async mounted() {
    if (localStorage.getItem("idToken") != null) {
      const response = await this.$hiClass.offerwall.readBrandList(this.companyInfo.companyId);
      this.brands = response.data._embedded.brands;
      this.search(0);
    }
  },
  methods: {
    formattedGenderType(genderType) {
      const genderTypeMap = { NONE: '선택 없음', MALE: '남', FEMALE: '여' }
      return genderTypeMap[genderType];
    },
    formattedDate(birthday) {
      if (!birthday) { return '';}
      const date = new Date(birthday);
      let year = date.getUTCFullYear();
      let month = date.getUTCMonth() + 1;
      let day = date.getUTCDate();
      return `${year}년 ${month < 10 ? '0' + month : month}월 ${day < 10 ? '0' + day : day}일`;
    },
    isNewUser(entryPathType) {
      return entryPathType === 'APP_BANNER_CLASS_B_FOR_NEW_USER' ? '신규회원' : '';
    },
    search(page) {
      const auth = this.$authentication.load();
      const uuid = auth.uuid;

      if (uuid === undefined || uuid === null) {
        return false;
      }

      if (!this.validate()) {
        return;
      }

      this.convertToTimeStamp();

      const params = {
        ...this.searchForm,
        companyId: this.companyInfo.companyId,
        page: page - 1,
        userId: uuid
      };

      this.$axios({
        method: 'get',
        url: `${this.$apiUrl}/advertiser/adstats`,
        headers: {Authorization: `Bearer ${auth.idToken}`},
        params,
      })
          .then(response => {
            this.data = response.data._embedded ? response.data._embedded.adstats : [];
            this.isBirthday = response.data._embedded ? response.data._embedded.isBirthday : false;
            this.isGender = response.data._embedded ? response.data._embedded.isGender : false;
            this.isAddress = response.data._embedded ? response.data._embedded.isAddress : false;
            this.isQuestion = response.data._embedded ? response.data._embedded.isQuestion : false;
            if(this.isQuestion) {
              this.questionTitle = response.data._embedded.adstats ? response.data._embedded.adstats[0].questionTitle : '';
            }
            // 페이지 메타데이터 저장
            const metadata = response.data.page;
            this.totalElements = metadata.totalElements;
            this.searchForm.page = metadata.number + 1;
          })
          .catch(error => {
            alert('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
          });
    },
    generateTimeOptions() {
      const options = [];
      for (let h = 0; h < 24; h++) {
        const hours = h < 10 ? '0' + h : h;
        options.push(`${hours}:00`);
      }
      return options;
    },
    convertToTimeStamp() {
      if (this.searchForm.periodType === 'date') {
        this.searchForm.startDate = this.convertDateTimeToTimeStamp(this.startTime, "start");
        this.searchForm.endDate = this.convertDateTimeToTimeStamp(this.endTime, "end");
      } else if (this.searchForm.periodType === 'period') {
        this.searchForm.startDate = this.convertDateToTimeStamp(this.startDate, "start");
        this.searchForm.endDate = this.convertDateToTimeStamp(this.endDate, "end");
      }
    },
    convertDateTimeToTimeStamp(time, type) {
      const date = this.selectedDate;
      if (!date || !time) {
        return null;
      }

      const [hours, minutes] = time.split(":").map(Number);
      const dateTime = type === 'start' ? new Date(date) : new Date(new Date(date).setMinutes(new Date(date).getMinutes() + 1));
      dateTime.setHours(hours, minutes, 0, 0);
      return dateTime.getTime();
    },
    /**
     * 2025-01-01 형태의 날짜를 timeStamp 로 변경
     * */
    convertDateToTimeStamp(date, type) {
      if (!date) {
        return null;
      }

      const dateTime = type === 'start' ? new Date(date) : new Date(new Date(date).setDate(new Date(date).getDate() + 1));
      dateTime.setHours(0, 0, 0, 0);
      return dateTime.getTime();
    },
    validate() {
      if ((this.searchForm.searchFieldType === 'APPLICANT' || this.searchForm.searchFieldType === 'PHONE') && this.searchForm.searchKeyword.trim() === '') {
        alert('키워드를 입력해주세요.');
        return false;
      }

      if (this.searchForm.searchKeyword.trim() !== '' && !this.searchForm.searchFieldType) {
        alert('검색 타입을 선택해주세요');
        return false;
      }

      if (this.searchForm.periodType === 'date') {
        const start = this.$moment(this.startTime, "HH:mm");
        const end = this.$moment(this.endTime, "HH:mm");

        if (end.isBefore(start)) {
          alert("시작 시간이 끝 시간보다 느릴 수 없습니다.")
          return false;
        }
        return true;
      }

      if (this.searchForm.periodType === 'period' && (!this.startDate && !this.endDate)) {
        alert('날짜를 선택해주세요.');
        return false;
      }

      return true;
    },
    isInputType(type) {
      return ['APPLICANT', 'PHONE'].includes(type);
    },
    goToPage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.search(page);
    },
    openExcelPopup() {
      this.isPasswordPopupVisible = true;
      this.password = this.generateRandomPassword();
    },
    generateRandomPassword() {
      return crypto.randomUUID();
    },
    // 비밀번호 복사 기능
    async copyPassword() {
      this.buttonText = "복사완료";
      this.buttonClass = "btn btn-secondary";
      await navigator.clipboard.writeText(this.password);
    },
    // 비밀번호 팝업 닫기
    closePasswordPopup() {
      this.isPasswordPopupVisible = false;
      this.buttonText = "복사";
      this.buttonClass = "btn btn-warning";
    },
    async downloadExcel() {
      const auth = this.$authentication.load();
      const uuid = auth.uuid;

      if (uuid === undefined || uuid === null) {
        return false;
      }

      if (!this.validate()) {
        return;
      }

      const params = {
        ...this.searchForm,
        companyId: this.companyInfo.companyId,
        userId: uuid
      };

      this.isLoading = true;

      await this.$axios({
        method: 'get',
        url: `${this.$apiUrl}/advertiser/adstats/excel`,
        headers: {Authorization: `Bearer ${auth.idToken}`},
        params,
      })
          .then(response => {
            this.excelData = response.data._embedded
                ? response.data._embedded.adstats
                : [];
          })
          .catch(error => {
            this.$log.error(
                this.$options.name + ' /advertiser/adstats/excel API 호출 에러 : ',
                error
            );
            alert('다운로드 중 오류가 발생했습니다. 다시 시도해주세요.');
          });

      const data = this.createExcelData();

      // 2. 워크시트 생성
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "광고 통계");

      // 3. Buffer 생성
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      const blob = await this.generatePasswordEncryptedExcelBlob({
        excelBuffer,
        password: this.password
      });

      this.isLoading = false;

      const title = this.createTitle();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = title;
      link.click();
      URL.revokeObjectURL(link.href);
      this.closePasswordPopup();

      // 엑셀 다운로드 시 로그 저장
      const logData = this.createLogData(title);
      await this.insertLogs(logData);
    },
    generatePasswordEncryptedExcelBlob({excelBuffer, password}) {
      return new Promise((resolve, reject) => {
        const worker = new Worker('/workers/excelDownloaderWorker.js');

        worker.onmessage = function (event) {
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data);
          }
        };

        worker.onerror = function (error) {
          reject(error);
        };

        worker.postMessage({excelBuffer, password});
      });
    },
    setCalendarFilter(date) {
      if (this.isOpenDateCalendar) {
        this.selectedDate = this.$moment(date).format('YYYY-MM-DD');
      }

      if (this.isOpenBeginPeriodCalendar) {
        this.startDate = this.$moment(date).format('YYYY-MM-DD');
      }

      if (this.isOpenEndPeriodCalendar) {
        this.endDate = this.$moment(date).format('YYYY-MM-DD');
      }
    },
    getTwoMonthsBefore() {
      const now = new Date();
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return twoMonthsAgo.getTime();
    },
    close() {
      if (this.isOpenDateCalendar || this.isOpenBeginPeriodCalendar || this.isOpenEndPeriodCalendar) {
        this.isOpenDateCalendar = false
        this.isOpenBeginPeriodCalendar = false
        this.isOpenEndPeriodCalendar = false
      }
    },
    maskName(name) {
      if (!name || name.length < 2) return name;
      return name[0] + '*'.repeat(name.length - 1);
    },
    maskPhoneNumber(phoneNumber) {
      return phoneNumber.slice(0, 3) + '*****' + phoneNumber.slice(8);
    },
    resetSearchKeyword() {
      this.searchForm.searchKeyword = '';
    },
    createExcelData() {
      const baseExcelData = { NO: '', 업체명: '', 브랜드명: '', 신청자명: '', 핸드폰번호: '',
      우편번호: '', 기본주소: '', 상세주소: '',
      [this.questionTitle ? this.questionTitle : '주관식']: '',
       선택학년: '', 성별: '', 생년월일: '', 
      신청경로: '', 신청일시: '',};
      if (!this.isGender) { delete baseExcelData['성별']; }
      if (!this.isBirthday) { delete baseExcelData['생년월일']; }
      if (!this.showEntryPath) { delete baseExcelData['신청경로']; }
      if (!this.isAddress) { delete baseExcelData['우편번호']; delete baseExcelData['기본주소']; delete baseExcelData['상세주소']; }
      if (!this.isQuestion) {
         delete baseExcelData[this.questionTitle ? this.questionTitle : '주관식'];
      }
      const excelData = [];
      if (this.excelData.length === 0) {
        excelData.push(baseExcelData);
      } else {
        this.excelData.forEach((item, index) => {
          const data = {};
          data.NO = index + 1;
          data.업체명 = item.companyName;
          data.브랜드명 = item.brandName;
          data.신청자명 = item.clientName;
          data.핸드폰번호 = item.phoneNumber;
          if (this.isAddress) { 
            const addressParts = item.address ? item.address.split('|') : [];
            data['우편번호'] = addressParts[0] || ''; 
            data['기본주소'] = addressParts[1] || ''; 
            data['상세주소'] = addressParts[2] || ''; 
          }
          if (this.isQuestion) { data[this.questionTitle ? this.questionTitle : '주관식'] = item.questionAnswer ? item.questionAnswer : ''; }
          data.선택학년 = item.grade;
          if (this.isGender) { data['성별'] = item.offerwallGenderType ? this.formattedGenderType(item.offerwallGenderType) : ''; }
          if (this.isBirthday) { data['생년월일'] = item.birthday ? this.formattedDate(item.birthday) : ''; }
          if (this.showEntryPath) { data['신청경로'] = item.entryPathType ? this.isNewUser(item.entryPathType) : ''; }
          data.신청일시 = this.$moment(item.applyDate).format('YYYY.MM.DD HH:mm:ss');
          excelData.push(data);
        });
      }
      return excelData;
    },
    createTitle() {
      const type = this.searchForm.periodType;
      let date;
      if (type === 'date') {
        date = this.selectedDate + "~" + this.selectedDate;
      } else {
        date = this.startDate + "~" + this.endDate;
      }

      return `${this.companyInfo.companyName}_${date}.xlsx`;
    },
    createLogData(fileName) {
      const requestContent = JSON.stringify(
          {
            searchFieldType: this.searchForm.searchFieldType,
            searchKeyword: this.searchForm.searchKeyword,
            startDate: this.searchForm.startDate,
            endDate: this.searchForm.endDate,
            size: this.searchForm.size
          }
      );

      return {
        requestType: 'DOWNLOAD',
        fileName: fileName,
        companyId: this.companyInfo.companyId,
        companyName: this.companyInfo.companyName,
        requestContent: requestContent,
      }
    },
    async insertLogs(requestParam) {
      try {
        await this.$axios.post(`${this.$apiUrl}/advertiserLog`, requestParam);
      } catch (e) {
        this.$log.warn('insert log error');
      }
    },
  }
};
</script>

<style scoped lang="scss">
.modal-excel {
  .input-group {
    width: 350px;
    margin: 0 auto;

    input {
      height: 55px;
    }

    button {
      padding: 0 25px;
      font-size: 16px;
    }
  }
}

@keyframes infinite_scroll_loading {100% {background-position:0 0;}}
</style>