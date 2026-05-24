<template>
  <div class="class__wrap">
    <div class="class__content">
      <!-- 자리배치도 컨텐츠 영역  -->

      <div class="seating-plan-add">
          <button class="btn-add" @click="openSeatAdd">
              <i></i>
              <span>자리배치도 만들기</span>
          </button>
      </div>
    </div>

    <seat-add-modal 
      v-if="isOpenSeatAddModal"
        :updateItem="updateItem"
        :isReBatchChangeSutdent="isReBatchChangeSutdent"
        @submit="seatAddSubmit"
        @close="closeSeatAdd"
    />

    <confirm-modal
        v-if="confirmModal.isOpen"
        :title="confirmModal.title"
        :description="confirmModal.description"
        :confirmButtonText="confirmModal.confirmButtonText"
        :confirmButtonColor="confirmModal.confirmButtonColor"
        :cancelButtonText="confirmModal.cancelButtonText"
        :isAlert="confirmModal.isAlert"
        @closeConfirmDialog="closeConfirmModal"
    />
  </div>
</template>


<script>
import {mapActions, mapState, mapMutations} from 'vuex'
import SeatAddModal from '@/apps/behavior/components/popup/SeatAddModal.vue'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'

export default {
    name: 'seat',
    props: {
    },
    components: {
      SeatAddModal,
      ConfirmModal
    },
    data() {
        return {
          isOpenSeatAddModal: false,
          updateItem: {},
          isReBatchChangeSutdent: false,
          confirmModal: {
            isOpen: false,
            title: '',
            description: '',
            confirmButtonText: '',
            confirmButtonColor: '',
            cancelButtonText: '',
            action: '',
            isAlert: false
          },
        }
    },
    computed: {
      ...mapState('storeBehavior', {
        curClassroom: 'curClassroom',
        seatPlans: 'seatPlans',
        seatPlanMode: 'seatPlanMode'
      }),
      classroomId: function() {
        return this.curClassroom.classroomId
      },
      isEmpty: function() {
        return this.seatPlans.length > 0 ? false : true
      },
      isMode: function() {
        return this.seatPlanMode ? true : false
      }
    },
    methods: {
      ...mapActions('storeBehavior', ['getClassroomStudents', 'waitForSeatPlansOfValidLength']),
      ...mapMutations('storeBehavior', ['setSeatPlans']),
      async openSeatAdd() {
        const params = {classroomId: this.classroomId, isHidden: false, isIncludePoint: true}
        const students = await this.getClassroomStudents(params)

        if(students.length > 0) {
          this.$hiClass.toggleBodyClass('add', 'hidden')
          this.isOpenSeatAddModal = true
        } else {  // 없을때 처리
          this.openConfirmModal("studentNone")
        }
      },
      closeSeatAdd() {
        this.$hiClass.toggleBodyClass('remove', 'hidden')
        this.isOpenSeatAddModal = false
      },
      async seatAddSubmit(data) {
        const list = [data]
        await this.waitForSeatPlansOfValidLength({
          classroomId: this.classroomId,
          validLength: 1
        })
        this.setSeatPlans(list)
        this.closeSeatAdd()
      },
      openConfirmModal: function(action) {
        this.confirmModal = {...this.confirmModal, action}

        switch(action) {
            case 'studentNone' :
                this.confirmModal.title = '등록된 학생 명단이 없습니다.<br/>명단을 추가해주세요.'
                this.confirmModal.confirmButtonText = '확인'
                this.confirmModal.confirmButtonColor = '#ff8737'
                this.confirmModal.isAlert = true
            break;
        }
        this.confirmModal = {...this.confirmModal, isOpen: true}
      },
      closeConfirmModal: async function(isConfirm) {
        this.isSubmitClick = false
        if(!isConfirm) {
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

        switch(this.confirmModal.action) {
            case 'studentNone' :
                this.actionstudentNone()
            break;
        }

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
      actionstudentNone() {
        this.$router.push(`/behavior-records/${this.classroomId}/classrooms/manageStudents`)
      },
    },
    created() {
    },
    mounted() {
    }
}
</script>