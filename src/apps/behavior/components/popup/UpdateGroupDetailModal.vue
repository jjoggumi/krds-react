<template>
    <div class="hi-modal-common modal-flex" style="display: block;">
        <div class="modal__dim"></div>
        <div class="behavior-modal01">
            <div class="behavior-modal-student-detail">
                <div class="profile">
                    <div class="info">
                        <p class="photo">
                            <img src="https://download.hiclass.net/7e70/8970/a570/c370/bdd23d26-c249-405b-be91-50c63b0b6026.gif" />
                        </p>

                        <span v-if="isEditName" class="name-text">
                            <p ref="groupName" contenteditable="true" @keydown="checkNameLenth" @focusout="changeGroupName">{{ group.groupName }}</p>
                        </span>
                        <span v-else class="name" @click="changeNameEditMode">{{ group.groupName }}</span>
                        
                        <button>상세 리포트보기</button>
                    </div>
                    <div class="btn">
                        <span @click="openConfirmModal('hiding')">모둠 숨김</span>
                        <span @click="openConfirmModal('delete')" class="delete">모둠 삭제</span>
                    </div>
                </div>

                <div class="select">
                    <div class="top">
                        <div class="menu">
                            <span :class="{on: selectedTab === 'badge'}">뱃지</span>
                            <span :class="{on: selectedTab === 'students'}">구성원</span>
                        </div>
                    </div>
                
                    <group-students 
                        v-if="selectedTab === 'students'"
                        :classroomId="classroomId"
                        :groupId="group.groupId"
                        :groupStudents="groupStudents"
                        @changeGroup="updateGroup"
                    />
                </div>
        
                <div class="modal-close-btn" @click="closeModal(true)"></div>
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
import GroupStudents from '@/apps/behavior/components/popup/tab/GroupStudents.vue'
export default {
    name: 'update-group-detail-modal',
    components: {GroupStudents, ConfirmModal},
    props: {
        classroomId: String,
        groupId: String
    },
    data() {
        return {
            selectedTab: 'students',
            isEditName: false,
            confirmModal: {
                isOpen: false,
                title: '',
                description: '',
                confirmButtonText: '',
                confirmButtonColor: '',
                action: ''
            },
            group: {},
            groupStudents: []
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            getClassroomGroupDetail: 'getClassroomGroupDetail',
            patchClassroomGroupName: 'patchClassroomGroupName',
            patchClassroomGroupIsHiding: 'patchClassroomGroupIsHiding',
            deleteClassroomGroup: 'deleteClassroomGroup'
        }),
        closeModal: function(isReload) {
            this.$emit('close', isReload)
        },
        openConfirmModal: function(action) {
            this.confirmModal = {...this.confirmModal, action}
            switch(action) {
                case 'hiding' :
                    this.confirmModal.title = '모둠을 숨기시겠습니까?'
                    this.confirmModal.description = '숨김처리된 모둠은\n교실에서 더 이상 노출되지 않습니다.'
                    break;
                case 'delete' :
                    this.confirmModal.title = '모둠을 삭제하시겠습니까?'
                    this.confirmModal.description = '삭제된 모둠은 복원이 불가합니다.'
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
                    action: ''
                }
                return
            }
            const params = {
                classroomId: this.classroomId,
                groupId: this.group.groupId
            }
            switch(this.confirmModal.action) {
                case 'hiding' :
                    await this.patchClassroomGroupIsHiding({...params, isHiding: true})
                    break;
                case 'delete' :
                    await this.deleteClassroomGroup(params)
                    break;  
            }
            this.confirmModal = {
                isOpen: false,
                title: '',
                description: '',
                confirmButtonText: '',
                confirmButtonColor: '',
                action: ''
            }
            this.closeModal(true)
        },
        changeNameEditMode: function() {
            this.isEditName = !this.isEditName
            if(this.isEditName) {
                this.$nextTick(() => {
                    this.$refs.groupName.focus()
                    this.setEndOfContenteditable(this.$refs.groupName)
                })
            }
        },
        setEndOfContenteditable: function(contentEditableElement) {
            let range, selection
            if (document.createRange) {
                range = document.createRange()
                range.selectNodeContents(contentEditableElement)
                range.collapse(false)
                selection = window.getSelection()
                selection.removeAllRanges()
                selection.addRange(range)
            } else if (document.selection) {
                range = document.body.createTextRange()
                range.moveToElementText(contentEditableElement)
                range.collapse(false)
                range.select()
            }
        },
        checkNameLenth: function(e) {
            const keys = {
                backspace: 8,
                shift: 16,
                ctrl: 17,
                alt: 18,
                delete: 46,
                leftArrow: 37,
                upArrow: 38,
                rightArrow: 39,
                downArrow: 40,
            }
            const utils = {
                special: {},
                navigational: {},
                isSpecial(e) {
                    return typeof this.special[e.keyCode] !== 'undefined'
                },
                isNavigational(e) {
                    return typeof this.navigational[e.keyCode] !== 'undefined'
                }
            }
            utils.special[keys['backspace']] = true
            utils.special[keys['shift']] = true
            utils.special[keys['ctrl']] = true
            utils.special[keys['alt']] = true
            utils.special[keys['delete']] = true
            utils.navigational[keys['upArrow']] = true
            utils.navigational[keys['downArrow']] = true
            utils.navigational[keys['leftArrow']] = true
            utils.navigational[keys['rightArrow']] = true

            let hasSelection = false
            const selection = window.getSelection()
            const isSpecial = utils.isSpecial(event)
            const isNavigational = utils.isNavigational(event)
      
            if (selection) {
                hasSelection = !!selection.toString()
            }
            
            if (isSpecial || isNavigational) {
                return true
            }

            let len = this.$refs.groupName.innerText.length
            if (len >= 20 && !hasSelection) {
                e.preventDefault()
                return false
            }
        },
        changeGroupName: async function() {
            const params = {
                classroomId: this.classroomId,
                groupId: this.group.groupId,
                groupName: this.$refs.groupName.innerText
            }
            if(this.$refs.groupName.innerText.trim()) {
                await this.patchClassroomGroupName(params)
                this.group = {...this.group, groupName: this.$refs.groupName.innerText}
            }
            
            this.changeNameEditMode()
        },
        updateGroup: function(group) {
            this.group = {...group}
            this.groupStudents = this.group.students || []
        }
    },
    async created() {
        this.group = await this.getClassroomGroupDetail({
            classroomId: this.classroomId,
            groupId: this.groupId
        })
        this.groupStudents = this.group.students || []
    }
}
</script>

<style>

</style>