<template>
    <div
        class="modal normal-modal slick-modal view-main-detail-modal ofy"
        id="hidingStudentsModal"
        style="display: block"
    >
        <div class="modal-cont-wrap">
            <div class="modal-cont">
            <!-- <div class="modal-cont-inner"
            v-click-outside="vcoConfig"
            @mouseover="offVco"
            @mouseleave="onVco"> -->
                <div class="modal-cont-inner">
                    <div class="behavior-modal-student-hidden-list">
                        <div class="title-wrap">
                            <h2>숨긴 학생 보기</h2>
                        </div>
                        <div class="list">
                            <div v-if="isNoData" class="nodata">
                                <i class="bh-icon-warning-circle-fill-52"></i>
                                <span>숨긴 학생이 없습니다.</span>  
                            </div>
                            <ul v-else>
                                <li
                                    v-for="student of hidingStudents"
                                    :key="student.studentId"
                                >
                                    <span class="num">{{ student.studentNo }}</span>
                                    <span class="name">{{ student.studentName }}</span>
                                    <div>
                                        <p @click="openConfirmModal('show', student.studentId)">
                                            <span class="refresh bh-icon-refresh-20 cursor-pointer">
                                                <em>숨김 해제</em>
                                            </span>
                                        </p>
                                        <p @click="openConfirmModal('delete', student.studentId)">
                                            <span class="delete bh-icon-delete-20 cursor-pointer">
                                                <em>삭제</em>
                                            </span>
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div @click="closeModal" class="modal-close-btn"></div>
                        <toast-type01 
                            v-if="toastMessageModal.open === true"
                            :item="toastMessageModal"
                        />
                    </div>
                </div>
            </div>
        </div>
        <confirm-modal
            v-if="confirmModal.isOpen"
            :title="confirmModal.title"
            :description="confirmModal.description"
            :confirmButtonText="confirmModal.confirmButtonText"
            :confirmButtonColor="confirmModal.confirmButtonColor"
            @closeConfirmDialog="closeConfirmModal"
        />
    </div>
</template>

<script>
import {mapActions} from 'vuex'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
import ToastType01 from '@/apps/behavior/components/toast/ToastType01.vue'
export default {
    name: 'hiding-students-modal',
    components: {ConfirmModal, ToastType01},
    props: {
        classroomId: String
    },
    data() {
        return {
            confirmModal: {
                isOpen: false,
                title: '',
                description: '',
                confirmButtonText: '',
                confirmButtonColor: '',
                action: '',
                target: null
            },
            toastMessageModal: {
                open: false,
                message: '숨김 해제되었습니다.',
                top: null,
                bottom: -100,
                left: null,
                right: null,
                width: null, // null = 420px 
                height: null, // null = 66px
                align: "center" // 텍스트정렬 - 가운데:center, 좌측:left , 우측:right 
            },
            hidingStudents: []
        }
    },
    computed: {
        isNoData: function() {
            return this.hidingStudents.length === 0
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            getClassroomStudents: 'getClassroomStudents',
            patchClassroomStudentIsHiding: 'patchClassroomStudentIsHiding',
            deleteClassroomStudent: 'deleteClassroomStudent'
        }),
        openConfirmModal: function(action, target) {
            this.confirmModal = {...this.confirmModal, action, target}
            switch(action) {
                case 'show' :
                    this.confirmModal.title = '학생을 숨김 해제 하시겠습니까?'
                    break;
                case 'delete' :
                    this.confirmModal.title = '학생을 삭제하시겠습니까?'
                    this.confirmModal.description = '삭제된 학생은 복원이 불가합니다.'
                    this.confirmModal.confirmButtonText = '삭제'
                    this.confirmModal.confirmButtonColor = '#F04F59'
                    break;         
            }
            this.confirmModal = {...this.confirmModal, isOpen: true}
        },
        closeConfirmModal: async function(isConfirm) {
            if(!isConfirm) {
                this.confirmModal = {
                    isOpen: false,
                    title: '',
                    description: '',
                    confirmButtonText: '',
                    confirmButtonColor: '',
                    action: '',
                    target: null
                }
                return
            }
            const params = {
                classroomId: this.classroomId,
                studentId: this.confirmModal.target
            }
            switch(this.confirmModal.action) {
                case 'show' :
                    this.toastMessageModal.open = false
                    await this.patchClassroomStudentIsHiding({...params, isHiding: false})
                    this.toastMessageModal.open = true
                    break;
                case 'delete' :
                    await this.deleteClassroomStudent(params)
                    break;  
            }
            this.hidingStudents = this.hidingStudents.filter(s => s.studentId !== this.confirmModal.target)
            this.confirmModal = {
                isOpen: false,
                title: '',
                description: '',
                confirmButtonText: '',
                confirmButtonColor: '',
                action: '',
                target: null
            }
        },
        closeModal: function() {
            this.$emit('close')
        }
    },
    async created() {
        this.hidingStudents = await this.getClassroomStudents({classroomId: this.classroomId, isHidden: true})
    }
}
</script>

<style scoped>
.modal.ofy.slick-modal .modal-close-btn {
    right: 16px;
}
</style>