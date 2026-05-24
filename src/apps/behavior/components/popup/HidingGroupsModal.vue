<template>
    <div class="hi-modal-common modal-flex" style="display: block;">
        <div class="modal__dim"></div>
        <div class="behavior-modal01">
            <div class="behavior-modal-student-hidden-list group">
                <div class="title-wrap">
                    <h2>숨긴 모둠 보기</h2>
                </div>
                <div class="list">
                    <div v-if="isNoData" class="nodata">
                        <i class="bh-icon-warning-circle-fill-52"></i>
                        <span>숨긴 모둠이 없습니다.</span>  
                    </div>
                    <ul v-else>
                        <li
                            v-for="group of hidingGroups"
                            :key="group.groupId"
                        >
                            <span class="name">{{ group.groupName }}</span>
                            <div>
                                <p @click="openConfirmModal('show', group.groupId)">
                                    <span class="refresh bh-icon-refresh-20 cursor-pointer">
                                        <em>숨김 해제</em>
                                    </span>
                                </p>
                                <p @click="openConfirmModal('delete', group.groupId)">
                                    <span class="delete bh-icon-delete-20 cursor-pointer">
                                        <em>삭제</em>
                                    </span>
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>
                <div @click="closeModal" class="modal-close-btn"></div>
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
export default {
    name: 'hiding-groups-modal',
    components: {ConfirmModal},
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
            hidingGroups: []
        }
    },
    computed: {
        isNoData: function() {
            return this.hidingGroups.length === 0
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            getClassroomGroups: 'getClassroomGroups',
            patchClassroomGroupIsHiding: 'patchClassroomGroupIsHiding',
            deleteClassroomGroup: 'deleteClassroomGroup'
        }),
        openConfirmModal: function(action, target) {
            this.confirmModal = {...this.confirmModal, action, target}
            switch(action) {
                case 'show' :
                    this.confirmModal.title = '모둠을 숨김 해제 하시겠습니까?'
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
                    action: '',
                    target: null
                }
                return
            }
            const params = {
                classroomId: this.classroomId,
                groupId: this.confirmModal.target
            }
            switch(this.confirmModal.action) {
                case 'show' :
                    await this.patchClassroomGroupIsHiding({...params, isHiding: false})
                    break;
                case 'delete' :
                    await this.deleteClassroomGroup(params)
                    break;  
            }
            this.hidingGroups = this.hidingGroups.filter(s => s.groupId !== this.confirmModal.target)
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
        this.hidingGroups = await this.getClassroomGroups({classroomId: this.classroomId, isHidden: true})
    }
}
</script>

<style>

</style>