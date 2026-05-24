<template>
  <div
      class="modal normal-modal slick-modal view-main-detail-modal ofy"
      id="attendanceNeisMarkModal"
      style="display: block"
  >
    <div class="modal-cont-wrap" ref="scrollArea">
      <div class="modal-cont">
        <div class="modal-cont-inner">
          <div class="attendance-neis-modal-container">
            <div class="attendance-mark">
              <div class="title-wrap">
                  <h2>출결지표</h2>
                  <span class="info-message">나이스 출결 지표와 동일하게 적용됩니다.</span>
              </div>

              <div class="attendance-tbl-contatiner">
                <table class="tbl-col neis-attendance-mark">
                  <colgroup>
                      <col width="85" />
                      <col width="110" />
                      <col width="110" />
                      <col width="110" />
                      <col width="110" />
                  </colgroup>

                  <tbody>
                    <tr>
                      <td class="title">결석</td>
                      <td>질병♡</td>
                      <td>미인정♥</td>
                      <td>기타▲</td>
                      <td>출석인정△</td>
                    </tr>
                    <tr>
                      <td class="title">조퇴</td>
                      <td>질병＠</td>
                      <td>미인정◎</td>
                      <td>기타∽</td>
                      <td>출석인정▷</td>
                    </tr>
                    <tr>
                      <td class="title">지각</td>
                      <td>질병＃</td>
                      <td>미인정X</td>
                      <td>기타≠</td>
                      <td>출석인정◁</td>
                    </tr>
                    <tr>
                      <td class="title">외출</td>
                      <td>질병☆</td>
                      <td>미인정◇</td>
                      <td>기타＝</td>
                      <td>출석인정▽</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="modal-close-btn" @click="close"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "attendance-neis-mark-modal", 
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.attendance-neis-modal-container .attendance-mark .modal-close-btn {
  right: 20px;
}
</style>