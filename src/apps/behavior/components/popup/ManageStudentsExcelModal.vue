<template>
  <div
    class="modal normal-modal slick-modal view-main-detail-modal ofy"
    id="manageStudentsExcelModal"
    style="display: block"
  >
    <div class="modal-cont-wrap">
      <div class="modal-cont">
        <!-- <div class="modal-cont-inner"
        v-click-outside="vcoConfig"
        @mouseover="offVco"
        @mouseleave="onVco"> -->
        <div class="modal-cont-inner">
          <div class="behavior-modal-manage-students-excel">
            <div class="title-wrap">
              <h2>학생 명단 엑셀 등록</h2>
            </div>

            <div class="content-wrap">
              <div class="step first">
                <p class="title">
                  <em>1.</em>
                  <span>
                  엑셀 양식을 다운로드하여 등록할 학생 정보를 입력 후 파일을 업로드 해주세요.
                  </span>
                </p>
                <div class="content">
                  <button class="excel" @click="downloadSample"><i class="bh-icon-file-excel-20"></i>EXCEL 양식 다운로드</button>
                  <button @click="selectExcelFile"><i class="bh-icon-file-upload-20"></i>파일 업로드</button>
                  <input ref="manageStudentExcelFileUpload" type="file" @change="addExcelFile" style="display: none;" />
                </div>
              </div>

              <div class="step second">
                <p class="title">
                  <em>2.</em>
                  <span> 
                  아래 리스트에서 유효성 결과를 확인하고 수정해주세요.<br/>
                  이미 등록된 학생이 있는 경우, 기존 명단에 추가로 등록됩니다.
                  </span>
                </p>
                <div class="list" :class="{
                  empty: isEmpty
                }">
                  <table>
                    <colgroup>
                      <col width="61" />
                      <col width="80" />
                      <col width="304" />
                      <col width="106" />
                      <col width="72" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>
                          <p></p>
                        </th>
                        <th>
                          <p>반번호<span class="star">*</span></p>
                        </th>
                        <th>
                          <p>이름<span class="star">*</span></p>
                        </th>
                        <th>
                          <p>생일</p>
                        </th>
                        <th>
                          <p>성별</p>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-if="!isEmpty">
                        <tr v-for="item of list" 
                          :key="`student-list-${item.studentKeyId}`"
                        >
                          <td>
                            <div>
                              <i class="bh-icon-close-black" @click="deleteStudent(item)"></i>
                            </div>
                          </td>
                          <td>
                            <div>
                              <p class="wraning-message" v-if="!isValidateNo(item)">
                                번호를 입력하세요.
                              </p>
                              <input type="text" 
                                :class="{
                                  wraning: !isValidateNo(item)
                                }"
                                @input="[inputOnlyNumber($event), inputNo($event, item)]"
                                @keydown="[inputOnlyNumber($event), inputNo($event, item)]"
                                @keyup="[inputOnlyNumber($event), inputNo($event, item)]"
                                :value="item.studentNo" 
                                maxlength="4"
                                />
                            </div>
                          </td>
                          <td>
                            <div>
                              <p class="wraning-message" v-if="!isValidateName(item)">
                                <template v-if="isValidateNameEmpty(item)">
                                  이름을 입력하세요.
                                </template>

                                <template v-else>
                                  이름은 완성형 한글, 영문 대/소문자 20자 이내로 입력해주세요.
                                </template>
                              </p>
                              <input type="text" 
                                :class="{
                                  wraning: !isValidateName(item)
                                }"
                                @input="[inputNameStyle($event), inputName($event, item)]"
                                @keydown="[inputNameStyle($event), inputName($event, item)]"
                                @keyup="[inputNameStyle($event), inputName($event, item)]"
                                :value="item.studentName" />
                            </div>
                          </td>
                          <td>
                            <div>
                              <p class="wraning-message" v-if="!isValidateBirth(item)">생년월일을 8자리 숫자로 입력해주세요.</p>
                              <input type="text"
                                :class="{
                                  wraning: !isValidateBirth(item)
                                }"
                                @input="[removeWhitespace($event), inputOnlyNumber($event), inputBirth($event, item)]"
                                @keydown="[removeWhitespace($event), inputOnlyNumber($event), inputBirth($event, item)]"
                                @keyup="[removeWhitespace($event), inputOnlyNumber($event), inputBirth($event, item)]"
                                :value="item.studentBirthDay" />
                            </div>
                          </td>
                          <td>
                            <div>
                              <p class="wraning-message" v-if="!isValidateSex(item)">남/여 중 입력해주세요.</p>
                              <input type="text" 
                                :class="{
                                  wraning: !isValidateSex(item)
                                }"
                                @input="[removeWhitespace($event), inputSex($event, item)]"
                                @keydown="[removeWhitespace($event), inputSex($event, item)]"
                                @keyup="[removeWhitespace($event), inputSex($event, item)]"
                                :value="item.studentGender" 
                                maxlength="1"
                                />
                            </div>
                          </td>
                        </tr>
                      </template>

                      <template v-else>
                        <tr>
                          <td colspan="5">
                            <div>
                              <p class="info">
                                <i class="bh-icon-warning-circle-fill-52"></i>
                                <span>등록된 학생 명단이 없습니다. 명단을 추가해주세요.</span>
                              </p>
                            </div>
                          </td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="btn-wrap">
              <button class="esc" @click="close">취소</button>
              <button 
                :class="{
                  dis: !isSubmit
                }"
                :disabled="!isSubmit"
                @click="submit"
              >등록</button>
            </div>

            <div class="modal-close-btn" @click="close"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapState} from 'vuex'
import * as XLSX from "xlsx";

export default {
  name: 'manage-students-excel-modal',
  components: {
  },
  data() {
    return {
      list: [],
    }
  },
  computed: {
    ...mapState('storeBehavior', {
      curClassroom: 'curClassroom',
    }),
    classroomId: function() {
      return this.curClassroom.classroomId
    },
    isEmpty: function() {
      return this.list.length > 0 ? false : true
    },
    isSubmit: function() {
      if(!(this.list.length > 0)) return false

      const index = this.list.findIndex(v => 
        v.validateNo === false || v.validateName === false || v.validateBirth === false || v.validateSex === false 
      )

      return index > -1 ? false : true
    }
  },
  watch: {
  },
  methods: {
    ...mapActions('storeBehavior', {
      addClassroomStudentNews: 'addClassroomStudentNews'
    }),
    isValidateNo(student) {
      if(student.studentNo) {
        const regex = /^[0-9]+$/
        if(regex.test(student.studentNo) && student.studentNo.length <= 4) {
          student.validateNo = true
          return true
        } else {
          student.validateNo = false
          return false
        }
      } else {
        student.validateNo = false
        return false
      }
    },
    inputNo(e, student) {
      student.studentNo = e.target.value
    },
    isValidateName(student) {
      if(student.studentName) {
        const regex = /^[A-Za-z0-9가-힣]+$/
        if(regex.test(student.studentName) && student.studentName.length <= 20) {
          student.validateName = true
          return true
        } else {
          student.validateName = false
          return false
        }

        // return regex.test(student.studentName)
      } else {
        student.validateName = false
        return false
      }
    },
    isValidateNameEmpty(student) {
      if(student.studentName) {
        return false
      } else {
        return true
      }
    },
    inputName(e, student) {
      student.studentName = e.target.value
    },
    isValidateBirth(student) {
      if(student.studentBirthDay) {
        const regex = /^(19[0-9][0-9]|20\d{2})(0[1-9]|[1-9]|1[0-2])([1-9]|0[1-9]|[1-2][0-9]|3[0-1])$/
        if(regex.test(student.studentBirthDay)) {
          student.validateBirth = true
        } else {
          student.validateBirth = false
        }

        return regex.test(student.studentBirthDay);
      } else {
        student.validateBirth = true
        return true
      }
    },
    inputBirth(e, student) {
      student.studentBirthDay = e.target.value
    },
    isValidateSex(student) {
      if(student.studentGender) {
        const regex = /^(남|여)$/
        if(regex.test(student.studentGender)) {
          student.validateSex = true
        } else {
          student.validateSex = false
        }

        return regex.test(student.studentGender);
      } else {
        student.validateSex = true
        return true
      }
    },
    inputSex(e, student) {
      student.studentGender = e.target.value
    },
    selectExcelFile(e) {
      e.stopPropagation()
      this.$refs.manageStudentExcelFileUpload.click()
    },
    deleteStudent(student) {
      this.list = this.list.filter(v => v !== student)
    },
    async submit() {
      const students = this.list.map(item => {
        const birthDay = item.studentBirthDay ? `${item.studentBirthDay.toString().substr(0,4)}-${item.studentBirthDay.toString().substr(4,2)}-${item.studentBirthDay.toString().substr(6,2)}` : null
        return {
          studentNo: parseInt(item.studentNo),
          studentName: item.studentName,
          studentBirthDay: birthDay,
          studentGender: item.studentGender ? item.studentGender === "남" ? "MALE" : "FEMALE" : null
        }
      })

      await this.addClassroomStudentNews({
        classroomId: this.classroomId,
        students: students
      })
      
      this.$emit("submit")
    },
    addExcelFile(e) {
      const files = e.target.files

      if(files[0].name.indexOf("xlsx") > -1 || files[0].name.indexOf("xls") > -1) {
        this.uploadExcelFile(files[0])
      } else {
        this.$hiClass.alert("엑셀파일을 등록해주세요.", 'error')
      }

      this.$refs.manageStudentExcelFileUpload.value = ""
    },
    downloadSample() {
      const samplePath = 'https://download.hiclass.net/static/document/behavior_student_manage_sample.xlsx'
      this.$comn.download(samplePath,'학생명단엑셀등록양식.xlsx')
    },
    async uploadExcelFile(file) {
      let reader = new FileReader()
      let vueInstance = this
      
      reader.onload = function () {
          let data = reader.result
          let workBook = XLSX.read(data, { type: 'binary' })
          const firstSheetName = workBook.SheetNames[0]
          const worksheet = workBook.Sheets[firstSheetName]
          const rows = XLSX.utils.sheet_to_json(worksheet)
          const list = _.cloneDeep(rows)

          vueInstance.list = list.map(item => {
            const valueInArray = Object.entries(item)
            const obj = {
              studentKeyId: `${Math.floor((Math.random() * 10) + 1)}${vueInstance.generateRandomString(10)}`,
              studentNo: null,
              studentName: null,
              studentBirthDay: null,
              studentGender: null,
              validateNo: true, 
              validateName: true,
              validateBirth: true,
              validateSex: true
            }
            for(const [key, value] of valueInArray) {
              if(key === '번호*') {
                obj.studentNo = value.toString().replace(/\s/g, '').substr(0, 4)
              } else if(key === '이름*') {
                obj.studentName = value.toString().replace(/\s/g, '').substr(0, 20)
              } else if(key === '생일') {
                obj.studentBirthDay = value.toString().replace(/\s/g, '').substr(0, 10)
              } else if(key === '성별') {
                obj.studentGender = value.toString().replace(/\s/g, '').substr(0, 1)
              }
            }

            return obj
          })
      };
      reader.readAsBinaryString(file);
    },
    generateRandomString(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    },
    removeWhitespace(e) {
      e.target.value = e.target.value.replace(/\s/g, '')
    },
    inputNameStyle: function(e) {
      if (e.key === "Enter") {
          e.preventDefault();
      }
      e.target.value = e.target.value.replace(/[^A-Za-z0-9ㄱ-힣\s]/gi, '').trim()
      e.target.value = e.target.value.substr(0, 20)
    },
    inputOnlyNumber: function(e){
      e.target.value = e.target.value.replace(/^0+/, '')
      e.target.value = e.target.value.replace(/[^0-9]/g, '')
    },
    close() {
      this.$emit("close")
    }
  },
  mounted() {
  }
}
</script>

<style scoped>
.modal.ofy.slick-modal .modal-close-btn {
  right: 16px;
}
</style>