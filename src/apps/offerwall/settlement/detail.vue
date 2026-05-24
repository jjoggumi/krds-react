<!--
@File(Method): detail.vue
@Author: -
@Date Created: - 2025-01-13
@Description: #70893 오퍼월 업체 관리자 > 정산서 > 정산서 탭
-->
<template>
  <div class="result-wrap mt-3">
    <div class="result-title">
      <div class="tit">정산서</div>
      <div class="btns">
        <button class="btn btn-outline-danger btn-down pl-4 pr-4" @click="openPdfPopup">
          <i class="fas fa-file-pdf"></i> PDF다운로드
        </button>
      </div>
    </div>
    <div class="result-list" ref="resultList">
      <table class="table table-bordered mt-3">
        <thead class="thead-dark">
          <tr>
            <th>광고상품</th>
            <th>브랜드명</th>
            <th>타깃</th>
            <th>기간</th>
            <th>신청건수</th>
            <th>공시단가<br><small>(A)</small></th>
            <th>가감액<br><small>(a)</small></th>
            <th>공급가액<br><small>(B)=(A)+(a)</small></th>
            <th>세액<br><small>(C)=(B)*10%</small></th>
            <th>총금액<br><small>(B)+(C)</small></th>
          </tr>
        </thead>
        <tbody class="text-center">
          <tr v-for="(item, index) in settlement" :key="'row-' + index">
            <td>{{ formattedAdType(item.adProductType) }}</td>
            <td>{{ item.brandName }}</td>
            <td>{{ formattedAdTarget(item.adTargets) }}</td>
            <td>{{ convertToPeriod(item.postingTimestampStart, item.postingTimestampEnd) }}</td>
            <td>{{ item.applicantsCount.toLocaleString() }}</td>
            <td>{{ item.preTaxAmount.toLocaleString() }}</td>
            <td>{{ item.adjustmentAmount.toLocaleString() }}</td>
            <td>{{ (item.preTaxAmount + item.adjustmentAmount).toLocaleString() }}</td>
            <td>{{ ((item.preTaxAmount + item.adjustmentAmount) * 0.1).toLocaleString() }}</td>
            <td>{{ item.netAmount.toLocaleString() }}</td>
          </tr>
          <tr v-for="(item, index) in settlement" :key="'detail-' + index">
            <td class="infobox text-left" colspan="10">
              <div class="detail-wrap">
                <div><strong class="mr-3">비고</strong></div>
                <div class="detail">{{ item.details }}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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

    <div class="pdf-wrap">
      <div class="pdf" ref="pdfContent">
        <div class="header">
          <div class="logo"><img src="@/assets/img/logo/iscream.png" /></div>
          <div class="title">정산서</div>
        </div>
        <div class="content">
          <div class="row info-wrap">
            <div class="col-6">
              <ul class="info-list" v-for="(item, index) in settlement" :key="'info-' + index">
                <li>
                  <span>업체명</span>
                  {{ item.companyName }}
                </li>
                <li>
                  <span>브랜드명</span>
                  {{ item.brandName }}
                </li>
                <li>
                  <span>작성일시</span>
                  {{ formatDate(item.updatedTimestamp) }}
                </li>
                <li>
                  <span>내용</span>
                  하이클래스 앱 광고 정산 건
                </li>
              </ul>
            </div>
            <div class="col-6">   
              <div class="info-box">
                <div class="info-title">공급자</div>
                <ul class="info-list">
                  <li>
                    <span>상호</span>
                    (주)아이스크림미디어
                  </li>
                  <li>
                    <span>대표자</span>
                    허주환, 현준우
                  </li>
                  <li>
                    <span>사업자 등록번호</span>
                    120-86-33565
                  </li>
                  <li>
                    <span>주소</span>
                    경기도 성남시 분당구 판교역로 225-20
                  </li>
                  <li>
                    <span>전화번호</span>
                    1811-0910
                  </li>
                </ul>        
              </div> 
            </div>
          </div>
          <div class="result-list"></div>
        </div>    
      </div>
    </div>
  </div>
</template>
  
<script>
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default {
  name: 'Settlement',
  props: {
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
      adTypeMap: {
        "DB_COLLECT": "고객수집형광고"
      },
      adTargetMap: {
        "PARENTS": "학부모"
      },
      isPasswordPopupVisible: false,
      password: ''
    };
  },
  methods: {
    convertToPeriod(start, end) { return `${this.formatDate(start)} ~ ${this.formatDate(end)}` },
    formattedAdType(str) { return this.adTypeMap[str]; },
    formattedAdTarget(str) { return this.adTargetMap[str] },
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    },
    generateRandomPassword() { return crypto.randomUUID(); },
    async copyPassword() {
      this.buttonText = "복사완료";
      this.buttonClass = "btn btn-secondary";
      await navigator.clipboard.writeText(this.password);
    },
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

        const title = `${settlement.companyName}(${settlement.brandName})_정산서_${Math.floor(settlement.settlementYearMonth / 100)}.${settlement.settlementYearMonth % 100}.pdf`;
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
  }
}
</script>

<style lang="scss" scoped>
.pdf-wrap{
  height: 0px;
  overflow: hidden;
}

table.table {
  table-layout: fixed;
  width: 100%;
}

.detail-wrap {
  display: flex;
}

.detail {
  white-space: pre-line;
  word-break: break-all;
}

</style>