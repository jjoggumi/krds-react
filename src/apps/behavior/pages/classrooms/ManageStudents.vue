<template>
  <div class="class__wrap">
    <div class="manage__students">
      <div class="manage__students__top">
        <span class="title">
          <h2>학생 명단 관리</h2>
        </span>
        <p class="action">
          <button v-if="showButton" class="add_by_iscream" @click="openIscreamClassConfirmModal">아이스크림 학생 명단 불러오기</button>
          <button class="excel" @click="openManageStudentsExcelModal"><i class="bh-icon-file-excel-20"></i>학생 명단 엑셀 등록</button>
          <button class="add" @click="clickAddStudent"><i class="bh-icon-plus-white-18"></i>학생추가</button>
        </p>
      </div>
      <div class="manage__students__content">
        <div class="list">
          <table :class="{
            empty: isEmpty
          }">
            <colgroup>
              <col width="6%" />
              <col width="12%" />
              <col width="36%" />
              <col width="18%" />
              <col width="20%" />
              <col width="8%" />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <p>캐릭터</p>
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
                <th>
                  <p>숨김/삭제</p>
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-if="!isEmpty">
                <tr v-for="item of list" :key="`student-list-${item.studentId}`"
                  :class="{
                    hidden : item.isHidden
                  }"
                >
                  <td>
                    <div class="character">
                      <p :class="{
                          'is-photo' : isPhoto(item)
                        }"
                        @click="openChangeCharacterModal(item)"
                      >
                        <student-photo :student="item" kind="img" />
                      </p>
                    </div>
                  </td>
                  <td>
                    <div class="input">
                      <input type="text" :value="item.studentNo" @focusout="focusOutStudentNo($event, item)" @input="inputOnlyNumber" maxlength="4" :disabled="item.isHidden" />
                    </div>
                  </td>
                  <td>
                    <div class="input">
                      <input type="text" class="txt-left" :value="item.studentName"  @input="inputNameStyle" @keydown="inputNameStyle" @keyup="inputNameStyle" @focusout="focusOutStudentName($event, item)" maxlength="20" :disabled="item.isHidden" />
                    </div>
                  </td>
                  <td>
                    <div class="input">
                      <input type="text" :value="getBirth(item)" @focus="focusBirth($event)" @focusout="focusOutBirth($event, item)" @input="inputOnlyNumber" @keydown="inputOnlyNumber" @keyup="inputOnlyNumber" maxlength="8" :disabled="item.isHidden" />
                    </div>
                  </td>
                  <td>
                    <div class="check">
                      <p>
                        <input type="radio" :name="`sex-chk-${item.studentId}`" :id="`sex-chk-${item.studentId}-01`" 
                          :disabled="item.isHidden"
                          v-model="item.studentGender"
                          :value="sexChecks[0]"
                          @click="clickSex($event, item)"
                        >
                        <label :for="`sex-chk-${item.studentId}-01`">
                          <span>선택안함</span>
                        </label>
                      </p>
            
                      <p>
                        <input type="radio" :name="`sex-chk-${item.studentId}`" :id="`sex-chk-${item.studentId}-02`" 
                          :disabled="item.isHidden"
                          v-model="item.studentGender"
                          :value="sexChecks[1]"
                          @click="clickSex($event, item)"
                        />
                        <label :for="`sex-chk-${item.studentId}-02`">
                          <span>남</span>
                        </label>
                      </p>
            
                      <p>
                        <input type="radio" :name="`sex-chk-${item.studentId}`" :id="`sex-chk-${item.studentId}-03`"  
                          :disabled="item.isHidden"
                          v-model="item.studentGender"
                          :value="sexChecks[2]"
                          @click="clickSex($event, item)"
                        />
                        <label :for="`sex-chk-${item.studentId}-03`">
                          <span>여</span>
                        </label>
                      </p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <button @click="clickHidden(item)">
                        <template v-if="item.isHidden">
                          숨김해제
                        </template>

                        <template v-else>
                          숨김
                        </template>
                      </button>
                      <button @click="clickDelete(item)">삭제</button>
                    </div>
                  </td>
                </tr>
              </template>

              <template v-else>
                <tr>
                  <td colspan="6">
                    <div>
                      <p class="info">
                        <i class="bh-icon-warning-circle-fill-52"></i>
                        <span>등록된 학생 명단이 없습니다. 명단을 추가해주세요.</span>
                      </p>
                      <p class="action">
                        <button class="excel" @click="openManageStudentsExcelModal"><i class="bh-icon-file-excel-20"></i>학생 명단 엑셀 등록</button>
                        <button class="add" @click="clickAddStudent"><i class="bh-icon-plus-white-18"></i>학생추가</button>
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

    <confirm-modal
      v-if="confirmModal.isOpen"
      :title="confirmModal.title"
      :description="confirmModal.description"
      :confirmButtonText="confirmModal.confirmButtonText"
      :confirmButtonColor="confirmModal.confirmButtonColor"
      :isAlert="confirmModal.isAlert"
      @closeConfirmDialog="closeConfirmModal"
    />

    <change-student-character-modal
      v-if="isOpenCharacterModal"
      :current="studentCharater"
      @close="closeChangeCharacterModal"
    />

    <add-student-modal 
      v-if="isOpenStudentModal" 
      :curClassroomId="classroomId" 
      @close="closeAddStudentModal" 
    />

    <manage-students-excel-modal 
      v-if="isOpenManageStudentsExcel"
      @submit="excelSubmit"
      @close="closeManageStudentsExcelModal"
    />

    <consent-confirm-modal
        v-if="consentConfirmModal.isOpen"
        :title="consentConfirmModal.title"
        :isAlert="consentConfirmModal.isAlert"
        :description="consentConfirmModal.description"
        :cancelButtonText="consentConfirmModal.cancelButtonText"
        :confirmButtonText="consentConfirmModal.confirmButtonText"
        @closeConfirmDialog="closeConsentConfirmModal"
    />

    <iscream-class-confirm-modal
        v-if="iscreamClassConfirmModal.isOpen"
        :classes="classes"
        :title="iscreamClassConfirmModal.title"
        :isAlert="iscreamClassConfirmModal.isAlert"
        :description="iscreamClassConfirmModal.description"
        :cancelButtonText="iscreamClassConfirmModal.cancelButtonText"
        :confirmButtonText="iscreamClassConfirmModal.confirmButtonText"
        @closeConfirmDialog="closeIscreamClassConfirmModal"
    />
  </div>
</template>

<script>
import {mapActions, mapState, mapMutations, mapGetters} from 'vuex'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
import StudentPhoto from '@/apps/behavior/components/common/StudentPhoto.vue'
import ChangeStudentCharacterModal from '@/apps/behavior/components/popup/ChangeStudentCharacterModal.vue'
import AddStudentModal from '@/apps/behavior/components/popup/AddStudentModal.vue'
import ManageStudentsExcelModal from '@/apps/behavior/components/popup/ManageStudentsExcelModal.vue'
import ConsentConfirmModal from "@/apps/behavior/components/popup/ConsentConfirmModal.vue"
import IscreamClassConfirmModal from "@/apps/behavior/components/popup/IscreamClassConfirmModal.vue"

    
export default {
  name: 'manage-students',
  components: {
    ConfirmModal,
    StudentPhoto,
    ChangeStudentCharacterModal,
    AddStudentModal,
    ManageStudentsExcelModal,
    ConsentConfirmModal,
    IscreamClassConfirmModal
  },
  computed: {
    ...mapGetters('storeBehavior', {
      isUsageConsentExisted: 'isUsageConsentExisted'
    }),
    ...mapState('storeBehavior', {
      curClassroom: 'curClassroom',
      students: 'students',
    }),
    classroomId: function() {
      return this.curClassroom.classroomId
    },
    isEmpty: function() {
      return this.list.length > 0 ? false : true
    }
  },
  watch: {
    async curClassroom() {
      this.list = []
      await this.getList()
    },
    async '$route.query.openIscreamClassConfirmModal'(newVal) {
      if (newVal === 'open') {
        await this.openIscreamClassConfirmModal()
      }
    },
    '$route.query.openConsentConfirmModal'(newVal) {
      if (newVal === 'open') {
        this.openConsentConfirmModal()
      }
    }
  },
  data() {
    return {
      showButton: false,
      list: [],
      sexChecks: [null, 'MALE', 'FEMALE'],
      confirmModal: {
        isOpen: false,
        title: '',
        description: '',
        confirmButtonText: '',
        confirmButtonColor: '',
        action: '',
        isAlert: false
      },
      targetStudent: null,
      isOpenCharacterModal: false,
      studentCharater: {},
      isOpenStudentModal: false,
      isOpenManageStudentsExcel: false,
      consentConfirmModal: {
        isOpen: false,
        title: '아이스크림S에 등록된 학생 정보가 있어요',
        description: '학생 정보를 불러오기 위해 동의가 필요합니다.\n학생의 이름, 반 번호, 성별 정보를 불러올 수 있도록\n동의해 주시겠어요?',
        cancelButtonText: '동의 하지 않음',
        confirmButtonText: '동의 하기',
        action: 'alert',
        isAlert: false
      },
      iscreamClassConfirmModal: {
        isOpen: false,
        title: '학생명단을 불러올까요?',
        description: '아이스크림S에 등록한 학생이 있습니다.\n학생을 불러올 클래스를 선택해주세요',
        cancelButtonText: '직접등록',
        confirmButtonText: '불러오기',
        action: 'alert',
        isAlert: false
      },
      classes: []
    }
  },
  methods: {
    ...mapActions('storeBehavior', {
      getClassroomStudents: 'getClassroomStudents',
      patchClassroomStudentBirth: 'patchClassroomStudentBirth',
      patchClassroomStudentNumber: 'patchClassroomStudentNumber',
      patchClassroomStudentName: 'patchClassroomStudentName',
      patchClassroomStudentGender: 'patchClassroomStudentGender',
      patchClassroomStudentIsHiding: 'patchClassroomStudentIsHiding',
      deleteClassroomStudent: 'deleteClassroomStudent',
      getCharacters: 'getCharacters',
      patchClassroomStudentCharacter: 'patchClassroomStudentCharacter',
      addIscreamConsent: 'addIscreamConsent',
      getIscreamConsent: 'getIscreamConsent',
      getIscreamClasses: 'getIscreamClasses',
      addIscreamStudents: 'addIscreamStudents'
    }),
    async getList() {
      const res = await this.getClassroomStudents({classroomId: this.classroomId, isIncludePoint: false})
      this.list = _.cloneDeep(res)
    },
    sortList(mode) {
      if(mode === "hiding" || mode === "show" || mode === "no" || mode === "name") {
        const newList = this.list.filter(v => !v.isHidden)
        newList.sort(this.sortStudentAct)

        const newHiddenList = this.list.filter(v => v.isHidden)
        newHiddenList.sort(this.sortStudentAct)

        this.list = [
          ...newList,
          ...newHiddenList
        ]
      } else if(mode === "delete") {
        this.list = this.list.filter(v => v.studentId !== this.targetStudent.studentId)
      } else {}
    },
    sortStudentAct(a, b) {
      if (a.studentNo !== b.studentNo) {
        return a.studentNo - b.studentNo
      }

      const isNumeric = (char) => /^[0-9]/.test(char);
      const isEnglish = (char) => /^[a-zA-Z]/.test(char);
      const isKorean = (char) => /^[ㄱ-ㅎ가-힣]/.test(char);

      const firstCharA = a.studentName
      const firstCharB = b.studentName

      if (isNumeric(firstCharA) && !isNumeric(firstCharB)) {
        return -1; // a가 숫자이고 b가 숫자가 아니면 a를 앞에
      } else if (!isNumeric(firstCharA) && isNumeric(firstCharB)) {
        return 1; // b가 숫자이고 a가 숫자가 아니면 b를 앞에
      } else if (isEnglish(firstCharA) && !isEnglish(firstCharB)) {
        return -1; // a가 영문자이고 b가 영문자가 아니면 a를 앞에
      } else if (!isEnglish(firstCharA) && isEnglish(firstCharB)) {
        return 1; // b가 영문자이고 a가 영문자가 아니면 b를 앞에
      } else if (isKorean(firstCharA) && !isKorean(firstCharB)) {
        return -1; // a가 한글이고 b가 한글이 아니면 a를 앞에
      } else if (!isKorean(firstCharA) && isKorean(firstCharB)) {
        return 1; // b가 한글이고 a가 한글이 아니면 b를 앞에
      } else {
        return a.studentName.localeCompare(b.studentName); // 모두 같은 유형일 경우 사전순으로 정렬
      }  
    },
    isPhoto(student) {
      return student.studentPhoto !== null
    },
    getBirth(student) {
      return student.studentBirthday ? student.studentBirthday.replace(/-/g, ".") : null
    },
    async focusOutStudentNo(e, student) {
      if(!e.target.value) {
        e.target.value = student.studentNo
      } else {
        const no = e.target.value

        if(no !== student.studentNo) {
          try {
            const params = {
              classroomId: this.classroomId,
              studentId: student.studentId,
              studentNo: no
            }
            await this.patchClassroomStudentNumber(params)
            student.studentNo = parseInt(no)

            this.sortList("no")
          } catch (err) {
            this.$log.debug('managestudents focusOutStudentNo PATCH() error => ', err)
          }
        }
      }
    },
    async focusOutStudentName(e, student) {
      if(!e.target.value) {
        e.target.value = student.studentName
      } else {
        const name = e.target.value
        const regexp = /^[a-zA-Z0-9가-힣]+$/
        if(!regexp.test(name)) {
          e.target.value = student.studentName
        } else {
          if(name !== student.studentName) {
            try {
              const params = {
                classroomId: this.classroomId,
                studentId: student.studentId,
                studentName: name
              }
              await this.patchClassroomStudentName(params)
              student.studentName = name

              this.sortList("name")
            } catch (err) {
              this.$log.debug('managestudents focusOutStudentName PATCH() error => ', err)
            }
          }
        }
      }
    },
    focusBirth(e) {
      if(e.target.value) {
        e.target.value = e.target.value.replace(/\./g, "")
      }
    },
    async focusOutBirth(e, student) {
      const birth =  e.target.value
      const format = /^(19[0-9][0-9]|20\d{2})(0[1-9]|[1-9]|1[0-2])([1-9]|0[1-9]|[1-2][0-9]|3[0-1])$/
      if (!format.test(birth)){
        e.target.value = ""
      } else {
        e.target.value = `${birth.substr(0,4)}.${birth.substr(4,2)}.${birth.substr(6,2)}`
        const date = `${birth.substr(0,4)}-${birth.substr(4,2)}-${birth.substr(6,2)}`
        if(date !== student.studentBirthday) {
          try {
            const params = {
              classroomId: this.classroomId,
              studentId: student.studentId,
              studentBirthday: date
            }
            await this.patchClassroomStudentBirth(params)
            student.studentBirthday = date
          } catch (err) {
            this.$log.debug('managestudents focusOutBirth PATCH() error => ', err)
          }
        }
      }
    },
    async clickSex(e, student) {
      try {
        const params = {
          classroomId: this.classroomId,
          studentId: student.studentId,
          studentGender: e.target.value ? e.target.value : null
        }
        await this.patchClassroomStudentGender(params)
      } catch (err) {
        this.$log.debug('managestudents clickSex PATCH() error => ', err)
      }
    },
    clickHidden(student) {
      let mode = "hiding"
      this.targetStudent = student

      if(student.isHidden) mode = "show"
      this.openConfirmModal(mode)
    },
    clickDelete(student) {
      this.targetStudent = student
      this.openConfirmModal('delete')
    },
    clickAddStudent() {
      this.$hiClass.toggleBodyClass('add', 'hidden')
      this.isOpenStudentModal = true
    },
    closeAddStudentModal(isReload) {
      this.$hiClass.toggleBodyClass('remove', 'hidden')
      this.isOpenStudentModal = false

      if(isReload){
        this.getList()
      }
    },
    openManageStudentsExcelModal() {
      this.$hiClass.toggleBodyClass('add', 'hidden')
      this.isOpenManageStudentsExcel = true
    }, 
    closeManageStudentsExcelModal() {
      this.$hiClass.toggleBodyClass('remove', 'hidden')
      this.isOpenManageStudentsExcel = false
    },
    excelSubmit() {
      this.closeManageStudentsExcelModal()
      this.getList()
    },
    openConfirmModal: function(action) {
      this.confirmModal = {...this.confirmModal, action}
      switch(action) {
        case 'hiding' :
          this.confirmModal.title = `${this.targetStudent.studentName} 학생을 숨기시겠습니까?`
          this.confirmModal.description = '숨김처리된 학생은\n교실에서 더 이상 노출되지 않습니다.'
          break;
        case 'show' :
          this.confirmModal.title = `학생을 숨김 해제 하시겠습니까?`
          break;
        case 'delete' :
          this.confirmModal.title = `${this.targetStudent.studentName} 학생을 삭제하시겠습니까?`
          this.confirmModal.description = '삭제된 학생은 복원이 불가합니다.'
          this.confirmModal.confirmButtonText = '삭제'
          this.confirmModal.confirmButtonColor = '#F04F59'
          break;
        case 'successOnLoadIscreamStudent' :
          this.confirmModal.title = '학생 명단을 성공적으로 불러왔습니다.'
          this.confirmModal.description = '이 명단은 아이스크림 클래스와\n자동으로 동기화되지 않습니다.'
          this.confirmModal.confirmButtonText = '확인'
          this.confirmModal.isAlert = true
          break;
        case 'StudentCountExceeded' : 
          this.confirmModal.title = '학생은 500명까지 등록 가능합니다.'
          this.confirmModal.confirmButtonText = '확인'
          this.confirmModal.isAlert = true
        break;
        case 'failOnLoadIscreamStudent' :
          this.confirmModal.title = '학생 명단을 불러올 수 없습니다.'
          this.confirmModal.description = '학생을 다시 추가해주세요'
          this.confirmModal.confirmButtonText = '확인'
          this.confirmModal.isAlert = true
          break;
      }
      this.confirmModal = {...this.confirmModal, isOpen: true}
    },
    openChangeCharacterModal: function(student) {
      this.$hiClass.toggleBodyClass('add', 'hidden')
      this.studentCharater = {
        studentId: student.studentId,
        code: student.studentCharacter,
        url: `https://download.hiclass.net/static/classroom/student/${student.studentCharacter}_head.png`,
        photo: student.studentPhoto
      }
      this.isOpenCharacterModal = true
      this.getCharacters()
    },
    closeChangeCharacterModal: async function(character) {
      this.$hiClass.toggleBodyClass('remove', 'hidden')
      if(character) {
          const params = {
              classroomId: this.classroomId,
              studentId: this.studentCharater.studentId,
              studentCharacter: character.code,
              studentPhoto: character.photo
          }
          const res = await this.patchClassroomStudentCharacter(params)
          if(res.status === 200) {
            // this.student = {...this.student, studentCharacter: character.code, studentPhoto: character.photo}
            const obj = this.list.find(v => v.studentId === this.studentCharater.studentId)
            obj.studentCharacter = character.code
            obj.studentPhoto = character.photo
          }
      }
      this.studentCharater = {}
      this.isOpenCharacterModal = false
    },
    closeConfirmModal: async function(isConfirm) {
      if(
        !isConfirm ||
        this.confirmModal.action === 'successOnLoadIscreamStudent' || 
        this.confirmModal.action === 'failOnLoadIscreamStudent' ||
        this.confirmModal.action === 'StudentCountExceeded'
      ) {
        this.confirmModal = {
          isOpen: false,
          title: '',
          description: '',
          confirmButtonText: '',
          confirmButtonColor: '',
          action: '',
          isAlert: false
        }
        return
      }

      const params = {
        classroomId: this.classroomId,
        studentId: this.targetStudent.studentId
      }
      switch(this.confirmModal.action) {
        case 'hiding' :
          this.targetStudent.isHidden = true
          await this.patchClassroomStudentIsHiding({...params, isHiding: true})
          break;
        case 'show' :
          this.targetStudent.isHidden = false
          await this.patchClassroomStudentIsHiding({...params, isHiding: false})
          break;
        case 'delete' :
          await this.deleteClassroomStudent(params)
          break;
      }

      this.sortList(this.confirmModal.action)

      this.confirmModal = {
        isOpen: false,
        title: '',
        description: '',
        confirmButtonText: '',
        confirmButtonColor: '',
        action: '',
        isAlert: false
      }
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
    openConsentConfirmModal: function() {
      this.consentConfirmModal.isOpen = true
    },
    closeConsentConfirmModal: async function(isConfirm) {
      this.consentConfirmModal.isOpen = false

      if(isConfirm) { 
        await this.addIscreamConsent({ classroomId: this.classroomId, userId: localStorage.getItem('uuid') });
        if (this.isUsageConsentExisted) { await this.openIscreamClassConfirmModal(); }
      }
    },
    openIscreamClassConfirmModal: async function() {
      this.classes = [];
      const response = await this.getIscreamClasses({ classroomId: this.classroomId, userId: localStorage.getItem('uuid') });
      if (response.classes.length > 0) {
        this.classes = response.classes;
        this.showButton = true;
        this.iscreamClassConfirmModal.isOpen = true;
      }
    },
    closeIscreamClassConfirmModal: async function(resultMap) {
      this.iscreamClassConfirmModal.isOpen = false

      if(resultMap.result) { 
        const res = await this.addIscreamStudents({ classroomId: this.classroomId, classSeq: resultMap.selectedClassSeq, userId: localStorage.getItem('uuid') });
        if (res.status === 200 && res.data.students) {
          this.list = this.list.concat(res.data.students)
          this.openConfirmModal('successOnLoadIscreamStudent')
        } else if (res.status === 428 && res.data.error === 'StudentCountExceeded') {
          this.openConfirmModal('StudentCountExceeded')
        } else {
          const consent = await this.getIscreamConsent({classroomId: this.classroomId, userId: localStorage.getItem('uuid')});
          this.showButton = consent.enableStudentListLoad && consent.isConsentExisted ? true : false
          this.openConfirmModal('failOnLoadIscreamStudent')
        }
      }
    },
  },
  created() {
    if(this.classroomId) {
      this.getList()
    }
  },
  async mounted() {
    const param = document.location.search.slice(1).split('=');
    if (param[0] === 'openIscreamClassConfirmModal' && param[1] === 'open') {
      this.showButton = true;
      this.openIscreamClassConfirmModal();
    } else if (param[0] === 'openConsentConfirmModal' && param[1] === 'open') {
      this.openConsentConfirmModal();
    } else {
      const consent = await this.getIscreamConsent({classroomId: this.classroomId, userId: localStorage.getItem('uuid')});
      if (consent.enableStudentListLoad && consent.isConsentExisted) { this.showButton = true; }
    }
  }
}
</script>