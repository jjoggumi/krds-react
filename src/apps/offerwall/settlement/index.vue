<!--
@File(Method): index.vue
@Author: -
@Date Created: - 2025-01-13
@Description: #70893 오퍼월 업체 관리자 > 정산서
-->
<template>
  <div class="container" v-if="isShow">
    <div class="title-wrap">
        <h2>정산서</h2>
    </div>
    <div class="form-area">
      <div class="form-group row">
        <div class="col-3">
          <div class="input-calendar input-group">
            <div class="input-group-prepend">
              <button dtype="button" class="btn btn-secondary"  @click="decreaseMonth">
                <i class="fas fa-chevron-left"></i>
              </button>
            </div>
            <button class="month form-control" @click="isOpenCalendar = true">
              <i class="fas fa-calendar-alt mr-2"></i>
              <span>{{selected.year}} - {{selected.month}}</span>
            </button>             
            <div class="input-group-append">
              <button dtype="button" class="btn btn-secondary" :disabled="isDisabled" @click="increaseMonth">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>          
          <main-body-calendar-picker-month
            style="display:block;"
            v-if="isOpenCalendar"
            :year="selected.year"
            :month="selected.month"
            :total="false"
            :change="true"
            :isRecord="true"
            @changeCalendar="changeCalendar"
            @choiceMonth="setMonthFilter"
            v-click-outside="close"
          />
        </div>
        <label class="col-sm-1 col-form-label pl-3">업체선택</label>
        <div class="col-3">
          <select class="form-control">
            <option>{{ companyInfo.companyName }}</option>
          </select>
        </div>
        <label class="col-sm-1 col-form-label pl-3">브랜드</label>
        <div class="col-3">
          <select class="form-control" v-model="selectedBrand">
            <option :value="{}" selected>브랜드선택</option>
            <option v-for="brand in brands" :key="brand.brandId" :value="brand">{{ brand.brandName }}</option>
          </select>
        </div>
        <div class="col-md-1">
          <button class="btn btn-primary btn-block" @click="getSettlement">검색</button>
        </div>
      </div>
    </div>    
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <a class="nav-link" @click="selectTab('result')" :class="{active: isSelected('result')}">광고집행결과서</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" @click="selectTab('settlement')" :class="{active: isSelected('settlement')}">정산서</a>
      </li>
    </ul>
    <settlement-chart ref="settlementChart" v-if="selectedTab === 'result'" :chartData="chartData" :settlement="settlement" :insertLogs="insertLogs" :createLogData="createLogData"></settlement-chart>
    <settlement-detail v-if="selectedTab === 'settlement'" :settlement="settlement" :insertLogs="insertLogs" :createLogData="createLogData"></settlement-detail>
  </div>
</template>

<script>
import SettlementChart from './chart.vue';
import SettlementDetail from './detail.vue';
import MainBodyCalendarPickerMonth from "@/apps/main/clazzes/MainBodyCalendarPickerMonth";

export default {
  components: {
    SettlementChart,
    SettlementDetail,
    MainBodyCalendarPickerMonth, 
  },
  props: {
    companyInfo: {
      type: Object,
      default: () => {}
    },
    isShow: Boolean
  },
  name: 'Settlement',
  computed: {
    isDisabled() {
      const currentYear = Number(this.$moment().format('YYYY'));
      const currentMonth = Number(this.$moment().format('M')) -1;
      if (this.selected.year > currentYear) { return true;}
      else if (this.selected.year === currentYear && this.selected.month >= currentMonth) { return true; }
      return false;
    }
  },
  data() {
    return {
      selectedBrand: {},
      brands: [],
      settlement: [],
      chartData: {},
      selectedTab: 'result',      
      isOpenCalendar: false,
      selected: {
        year: Number(this.$moment().format('YYYY')),
        month: Number(this.$moment().format('M')) - 1,
      }
    };
  },
  methods: {
    async getSettlement() {
      if (!this.selectedBrand.hasOwnProperty('brandId')) {
        this.$hiClass.alert('브랜드를 선택해주세요.')
        return false;
      }
      const yearMonth = `${this.selected.year}${String(this.selected.month).padStart(2, '0')}`
      const requestParams =  {
            settlementYearMonth: parseInt(yearMonth),
            brandId: this.selectedBrand.brandId
          }
      const res = await this.$hiClass.offerwall.readSettlement(requestParams)
      this.settlement = res.data._embedded.settlements
      if (this.settlement.length === 0) {
        this.$hiClass.alert('검색 결과가 없습니다.')
        return false;
      }
      if (this.selectedTab === 'result') {
        this.chartData = this.convertToChartData()
        this.$nextTick(() => this.$refs.settlementChart.createChart())
      }
      return true;
    },
    convertToChartData() {
      if (this.settlement.length === 0) { return }
      
      const readCount = this.settlement[0].readCount;
      const applicationRate = ((this.settlement[0].applicantsCount / this.settlement[0].readCount) * 100).toFixed(3);
      
      return {
        labels: [''],
        datasets: [
          {
            type: 'bar',
            label: '조회수',
            data: [ readCount ],
            backgroundColor: 'rgba(195, 215, 255, 1)',
            barThickness: 90,
            fill: true,
            yAxisID: "barAxis",
            order: 2
          },
          {
            type: 'line',
            label: '조회수 대비 신청율',
            data: [ applicationRate ],
            borderColor: 'rgba(255, 119, 119, 1)',
            backgroundColor: 'rgba(255, 119, 119, 1)',
            borderWidth: 2,
            fill: true,
            usePointStyle: true,
            pointStyle: 'circle',
            pointRadius: 4,
            pointBackgroundColor: 'rgba(255, 119, 119, 1)',
            yAxisID: "lineAxis",
            order: 1 
          }
        ]
      };
    },
    selectTab(tab) {
      this.selectedTab = tab;
      if (this.selectedTab === 'result') {
        this.chartData = this.convertToChartData()
        this.$nextTick(() => this.$refs.settlementChart.updateChart())
      }
    },
    isSelected(tab) {
      return this.selectedTab === tab;
    },    
    decreaseMonth() {
      if (this.selected.month === 1) {
        this.selected.month = 12;
        this.selected.year -= 1;
      } else {
        this.selected.month -= 1;
      }
    },
    increaseMonth() {
      if (this.selected.month === 12) {
        this.selected.month = 1;
        this.selected.year += 1;
      } else {
        this.selected.month += 1;
      }
    },
    setMonthFilter(date) {
      this.selected.year = date.year;
      this.selected.month = date.month;
      this.isOpenCalendar = false
    },
    changeCalendar() {
      this.isOpenCalendar = true
    },
    close() {
      if(this.isOpenCalendar) {
        this.isOpenCalendar = false
      }
    },
    async readBrandList() {
      const res = await this.$hiClass.offerwall.readBrandList(this.companyInfo.companyId);
      this.brands = res.data._embedded.brands;
    },
    createLogData(fileName, date) {
      const requestContent = JSON.stringify(
          {
            selectedDate: date,
            brandId: this.selectedBrand.brandId,
            companyId: this.companyInfo.companyId,
          }
      );

      return {
        requestType: 'DOWNLOAD',
        requestContent: requestContent,
        fileName: fileName,
        companyId: this.companyInfo.companyId,
        companyName: this.companyInfo.companyName,
      }
    },
    async insertLogs(requestParam) {
      try {
        await this.$axios.post(`${this.$apiUrl}/advertiserLog`, requestParam);
      } catch (e) {
        this.$log.warn('insert log error');
      }
    },
  },
  async mounted() {
    if (localStorage.getItem("idToken") != null) {
      await this.readBrandList();
    }
  }
}
</script>

<style>
</style>