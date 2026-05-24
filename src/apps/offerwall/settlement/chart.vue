<!--
@File(Method): chart.vue
@Author: -
@Date Created: - 2025-01-13
@Description: #70893 오퍼월 업체 관리자 > 정산서 > 광고집행결과서 탭
-->
<template>
  <div class="result-wrap mt-3">
    <div class="result-title">
      <div class="tit">광고집행결과서</div>
      <div class="btns">
        <button class="btn btn-outline-danger btn-down pl-4 pr-4" @click="openPdfPopup">
          <i class="fas fa-file-pdf"></i> PDF다운로드
        </button>
      </div>
    </div>
    <div class="result-list" ref="resultList">
      <div class="chart-area">
        <canvas ref="chart"></canvas>
      </div>
      <table class="table table-bordered mt-3">
        <thead class="thead-dark">
          <tr>
            <th v-for="(name, idx) in colNames" :key="idx">{{ name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in settlement" :key="index" class="text-center">
            <td>{{ item.brandName }}</td>
            <td>{{ formattedDate(item.settlementYearMonth) }}</td>
            <td>{{ item.readCount.toLocaleString() }}</td>
            <td>{{ item.applicantsCount.toLocaleString() }}</td>
            <td>{{ ((item.applicantsCount / item.readCount) * 100).toFixed(2) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pdf-wrap">
      <div class="pdf" ref="pdfContent">
        <div class="header">
          <div class="logo hiclass"><img src="@/assets/img/logo/logo_2x.png" /></div>
          <div class="title">하이클래스 광고 집행 결과서</div>        
        </div>
        <div class="content">
          <div class="info-wrap">
            <ul class="info-list" v-for="(item, index) in settlement" :key="'info-' + index">
              <li>
                <span>수신</span>
                {{ item.companyName }}
              </li>
              <li>
                <span>브랜드명</span>
                {{ item.brandName }}
              </li>
              <li>
                <span>상품</span>
                {{ formattedAdType(item.adProductType) }}
              </li>
              <li>
                <span>타깃</span>
                {{ formattedAdTarget(item.adTargets) }}
              </li>
              <li>
                <span>정산기간</span>
                {{ convertYearMonthToPeriod(item.settlementYearMonth) }}
              </li>
              <li>
                <span>광고기간</span>
                {{ convertToPeriod(item.postingTimestampStart, item.postingTimestampEnd) }}
              </li>
            </ul>        
          </div>
          <div class="result-list"></div>
        </div>    
      </div>
    </div>
    <div class="modal modal-pdf" v-if="isPasswordPopupVisible" @click="closePasswordPopup">
      <div class="modal-dialog modal-md" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title text-center">PDF 비밀번호를 확인해 주세요.</h4>
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
            <span v-else class="btn btn-primary btn-lg" @click="downloadPDF">확인</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import {Chart, registerables } from 'chart.js'
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
Chart.register(...registerables)

export default {
  name: 'SettlementChart',
  props: {
    chartData: {
      type: Object,
      default: () => {}
    },
    settlement: {
      type: Array,
      default: () => []
    },
    companyInfo: {
      type: Object,
      default: () => {}
    },
    insertLogs: Function,
    createLogData: Function
  },
  data() {
    return {
      buttonText: "복사",
      buttonClass: "btn btn-warning",
      isLoading: false,
      chartInstance: null,
      adTypeMap: {
          "DB_COLLECT": "고객수집형광고"
      },
      adTargetMap: {
        "PARENTS": "학부모"
      },
      isPasswordPopupVisible: false,
      password: '',
      colNames: ['브랜드명', '광고집행월', '조회수', 'DB 신청건수', '신청율']
    }
  },
  methods: {
    formattedAdType(str) { return this.adTypeMap[str]; },
    formattedAdTarget(str) { return this.adTargetMap[str]; },
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    },
    convertToPeriod(start, end) { return `${this.formatDate(start)} ~ ${this.formatDate(end)}`; },
    convertYearMonthToPeriod(yearMonth) {
      const year = Math.floor(yearMonth / 100);
      const month = yearMonth % 100 - 1;
      const startDateOnSettlement = this.formatDate(new Date(year, month, 1).getTime());
      const endDateOnSettlement = this.formatDate(new Date(year, month + 1, 0).getTime());
      return this.convertToPeriod(startDateOnSettlement, endDateOnSettlement);
    },
    formattedDate(num) { return `${Math.floor(num / 100)}-${num % 100}`; },
    async openPdfPopup() {
      const hasResponse = await this.$parent.getSettlement();
      if (!hasResponse) return;
      this.isPasswordPopupVisible = true;
      this.password = this.generateRandomPassword();
    },
    closePasswordPopup() {
      this.isPasswordPopupVisible = false;
      this.buttonText = "복사";
      this.buttonClass = "btn btn-warning";
    },
    generateRandomPassword() { return crypto.randomUUID(); },
    async copyPassword() {
      this.buttonText = "복사완료";
      this.buttonClass = "btn btn-secondary";
      await navigator.clipboard.writeText(this.password);
    },
    async downloadPDF() {
      try {
        this.isLoading = true;
        const canvas = await html2canvas(this.$refs.resultList, {
          useCORS: true,
          scale: 2
        });
        const resultImage = canvas.toDataURL("image/png");

        const pdfContent = this.$refs.pdfContent;
        pdfContent.querySelector(".result-list").innerHTML = `
          <div class="content-area"><img src="${resultImage}" alt="Result List" style="width: 100%; height: auto;" /></div>
        `;

        await this.$nextTick();

        const pdfCanvas = await html2canvas(pdfContent, {
          useCORS: true,
          scale: 2,
          backgroundColor: "#fff",
        });

        const pdf = new jsPDF({
          orientation: "p",
          unit: "mm",
          format: "a4",
          encryption: {
            userPermissions: ["print"],
            userPassword: this.password,
          },
        });

        const pdfWidth = 210;
        const aspectRatio = pdfCanvas.height / pdfCanvas.width;
        const pdfHeight = pdfWidth * aspectRatio;

        const pdfImage = pdfCanvas.toDataURL("image/png");
        pdf.addImage(pdfImage, "PNG", 0, 0, pdfWidth, pdfHeight);

        const settlement = this.settlement[0];

        const title = `광고집행결과서_${settlement.companyName}(${settlement.brandName})_${Math.floor(settlement.settlementYearMonth / 100)}.${settlement.settlementYearMonth % 100}.pdf`;
        const date = `${Math.floor(settlement.settlementYearMonth / 100)}-${settlement.settlementYearMonth % 100}`;
        pdf.save(title);
        this.isLoading = false;
        this.closePasswordPopup();

        const logData = this.createLogData(title, date);
        await this.insertLogs(logData);
      } catch (error) {
        console.error("PDF 생성 중 에러:", error);
      }
    },
    async createChart() {
      if (this.chartInstance) { this.chartInstance.destroy(); }
      if (!this.chartData.datasets) { return; }

      let criteriaForBar = this.chartData.datasets[0].data[0];
      let unitForBar = Math.pow(10, criteriaForBar.toString().length - 1);

      let criteriaForLine = parseFloat(this.chartData.datasets[1].data[0]);

      this.chartInstance = await new Chart(this.$refs.chart, {
        data: this.chartData,
        options: {
          plugins: { legend: { position: "bottom" } },
          responsive: true,
          scales: { 
            barAxis: {
              type: "linear",
              display: true,
              position: "left",
              grid: { drawOnChartArea: false },
              min: 0,
              max: (parseInt(criteriaForBar.toString().charAt(0)) + 1) * unitForBar,
              ticks: {
                beginAtZero: true,
                stepSize: (parseInt(criteriaForBar.toString().charAt(0)) + 1) * unitForBar / 10
              }
            },
            lineAxis: {
              type: "linear",
              display: true,
              position: "right",
              grid: { drawOnChartArea: false },
              min: 0,
              max: (parseInt(criteriaForBar.toString().charAt(0)) + 1) * unitForBar * criteriaForLine / (criteriaForBar * 0.9),
              ticks: {
                stepSize: ((parseInt(criteriaForBar.toString().charAt(0)) + 1) * unitForBar * criteriaForLine / (criteriaForBar * 0.9) + 1) / 10,
                callback: function(value) { return `${value.toFixed(3)}%`; }
              }
            }
          }
        }
      });
    },
    async updateChart() { if (this.chartInstance !== null) this.chartInstance.update(); }
  },
  async mounted() {
    await this.createChart()
  }
}
</script>

<style lang="scss" scoped>
.chart-area{
  padding:30px;
  background-color: #f8f9fa;
  width: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}
.pdf-wrap{
  height: 0px;
  overflow: hidden;
}

</style>