<template>
  <div
      class="modal normal-modal slick-modal view-main-detail-modal ofy"
      id="whoWriteModal"
      style="display: block"
  >
    <div class="modal-cont-wrap">
        <div class="modal-cont">
            <!-- <div class="modal-cont-inner"
            v-click-outside="vcoConfig"
            @mouseover="offVco"
            @mouseleave="onVco"> -->
            <div class="modal-cont-inner">
                <div class="behavior-modal-student-class">
                    <div class="title-wrap">
                        <h2>교실 관리</h2>
                        <span class="message">
                        교실의 사용여부나 정보를 수정하고 교실 목록을 관리할 수 있습니다.
                        </span>
                    </div>
                    <div class="list">
                        <ul>
                            <draggable
                                tag="div"
                                v-model="classrooms"
                                v-bind="dragOptions"
                                handle=".bh-icon-listmove-24"
                                @start="isDrag = true"
                                @end="isDrag = false"
                                @change="changeClassroomSort"
                            >
                                <transition-group type="transition" :name="!isDrag ? 'flip-list' : null">
                                    <manage-classroom-item
                                        v-for="item of classrooms"
                                        :key="item.classroomId"
                                        :classroom="item"
                                        @changeName="updateClassroomName"
                                        @change="openConfirmModal"
                                    />
                                    <!--li 
                                        v-for="item of classrooms"
                                        :key="item.classroomId"
                                    >
                                        <i class="bh-icon-listmove-24"></i>
                                        <input type="text" maxlength="20" @focusout="updateClassroomName(item, $event)" :class="{dis: !item.isUsed}" :value="item.classroomName" />
                                        <div class="hi-selectbox" :class="{'is-opened': item.classroomId === isSelectedToggle}">
                                            <button class="selected" @click="toggleSelectBox(item.classroomId)"><span :style="item.isUsed ? 'color: #3987F8;': ''">{{ item.isUsed ? '사용' : '보관' }}</span></button>
                                            <div class="option__layer">
                                                <button class="option" :class="{'is-selected': item.isUsed}" @click="openConfirmModal('used', item)"><span style="color: #3987F8;">사용</span></button>
                                                <button class="option" :class="{'is-selected': !item.isUsed}" @click="openConfirmModal('not-used', item)"><span>보관</span></button>
                                                <button class="option" @click="openConfirmModal('delete', item)"><span style="color: #F04F59;">삭제</span></button>
                                            </div>
                                        </div>
                                    </li-->
                                </transition-group> 
                            </draggable>
                        </ul>
                        <div ref="scrollListAccesse"></div>
                        <hr style="height: 0px;visibility: hidden;"/>  
                    </div>
                    <div class="modal-close-btn" @click="closeModal"></div>

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
import draggable from 'vuedraggable'
import ManageClassroomItem from '@/apps/behavior/components/list/ManageClassroomItem.vue'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
import ToastType01 from '@/apps/behavior/components/toast/ToastType01.vue'

export default {
    name: 'manage-classroom-modal',
    components: {ConfirmModal, ManageClassroomItem, draggable, ToastType01},
    props: {
        selected: String
    },
    data() {
        return {
            isDrag: false,
            isSelectedDeleted: false,
            dragOptions: {
                animation: 200,
                disabled: false,
                forceFallback: true
            },
            confirmModal: {
                isOpen: false,
                title: '',
                description: '',
                confirmButtonText: '',
                confirmButtonColor: '',
                action: '',
                target: null
            },
            isConfirmModalOpen: false,
            isSelectedToggle: '',
            classrooms: [],
            page: {},
            obsRef: null,
            observer: null,
            toastMessageModal: {
                open: false,
                message: null,
                top: null,
                bottom: 10,
                left: null,
                right: null,
                width: null, // null = 420px 숫자만
                height: null, // null = 66px 숫자만
                align: "center" // 텍스트정렬 - 가운데:center, 좌측:left , 우측:right 
            }
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            getClassrooms: 'getClassrooms',
            patchClassroomName: 'patchClassroomName',
            patchClassroomIsUsed: 'patchClassroomIsUsed',
            patchClassroomSort: 'patchClassroomSort',
            deleteClassroom: 'deleteClassroom'
        }),
        openConfirmModal: function(action, target) {
            this.confirmModal = {...this.confirmModal, action, target}
            switch(action) {
                case 'used' :
                    this.confirmModal.title = '교실을 다시 사용하시겠습니까?'
                    this.confirmModal.confirmButtonText = '사용'
                    break;
                case 'not-used' :
                    this.confirmModal.title = '교실을 보관하시겠습니까?'
                    this.confirmModal.description = '보관된 교실은 다시 사용 가능합니다.'
                    this.confirmModal.confirmButtonText = '보관'
                    break;
                case 'delete' :
                    this.confirmModal.title = '교실을 삭제하시겠습니까?'
                    this.confirmModal.description = '삭제된 교실은 복원이 불가합니다.'
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
            this.toastMessageModal.open = false
            switch(this.confirmModal.action) {
                case 'used' :
                    this.toastMessageModal.message = '사용 상태로 변경되었습니다.'
                    await this.patchUsedClassroom(this.confirmModal.target.classroomId, true)
                    break;
                case 'not-used' :
                    this.toastMessageModal.message = '교실을 보관했습니다.'
                    await this.patchUsedClassroom(this.confirmModal.target.classroomId, false)
                    break;
                case 'delete' :
                    this.toastMessageModal.message = '교실을 삭제했습니다.'
                    await this.removeClassroom(this.confirmModal.target.classroomId)
                    break;  
            }
            this.confirmModal = {
                isOpen: false,
                title: '',
                description: '',
                confirmButtonText: '',
                confirmButtonColor: '',
                action: '',
                target: null
            }
            this.toastMessageModal.open = true
        },
        patchUsedClassroom: async function(classroomId, isUsed) {
            const params = {
                classroomId,
                isUsed
            }
            await this.patchClassroomIsUsed(params)
            const updateIndex = this.classrooms.findIndex(o => o.classroomId === classroomId)
            const updateObject = {...this.classrooms[updateIndex]}
            updateObject.isUsed = isUsed
            this.rowUpdate(updateObject, updateIndex)
            this.isSelectedToggle = ''
        },
        updateClassroomName: async function(classroom) {
            //if(e.target.value && e.target.value.trim()) {
                await this.patchClassroomName({classroomId: classroom.classroomId, classroomName: classroom.classroomName.trim()})
                const updateIndex = this.classrooms.findIndex(o => o.classroomId === classroom.classroomId)
                const updateObject = {...this.classrooms[updateIndex]}
                updateObject.classroomName = classroom.classroomName.trim()
                this.rowUpdate(updateObject, updateIndex)
            //} else {
            //    e.target.value = this.classrooms.find(o => o.classroomId === classroom.classroomId).classroomName
            //}
        },
        rowUpdate: function(updateData, updateIndex) {
            const copy = [...this.classrooms]
            copy[updateIndex] = updateData
            this.classrooms = [...copy]
        },
        removeClassroom: async function(classroomId) {
            await this.deleteClassroom(classroomId)
            this.classrooms = this.classrooms.filter(o => o.classroomId !== classroomId)
            this.page.totalElements = this.page.totalElements -1
            this.isSelectedDeleted = this.selected === classroomId
            if(this.page.totalElements === 0) {
                this.closeModal()
            }
        },
        toggleSelectBox: function(classroomId) {
            if(classroomId && this.isSelectedToggle !== classroomId) {
                this.isSelectedToggle = classroomId
            } else {
                this.isSelectedToggle = ''
            }
        },
        changeClassroomSort: async function() {
            await this.patchClassroomSort(this.classrooms.map(o => o.classroomId))
        },
        closeModal: function() {
            this.$emit('close', this.isSelectedDeleted)
        },
        setClassrooms: function(response) {
            const {_embedded, page} = response
            this.page = page
            
            if(page.totalElements < 1) {
                this.classrooms = []
            } else {
                const orgids = this.classrooms.map(c => c.classroomId)
                this.classrooms = page.number === 0 ? _embedded.classrooms : [...this.classrooms, ..._embedded.classrooms.filter(n => !orgids.includes(n.classroomId))]
            }
        },
        classroomsPageSearch: async function(page) {
            if(this.page.totalPages > page) {
                this.setClassrooms(await this.getClassrooms({page}))
            }
        },
        scrollObserver: function() {
            this.$nextTick(function() {
                const option = {
                    root: null,
                    rootMargin: '0px',
                    threshold: 1
                }

                const callback = async([entry]) => {
                    if (entry.isIntersecting) {
                        this.classroomsPageSearch(this.page.number + 1)
                    }
                };

                this.observer = new IntersectionObserver(callback, option);
                this.observer.observe(this.obsRef)
            })
        }
    },
    mounted() {
        this.obsRef = this.$refs.scrollListAccesse
    },
    async created() {
        this.setClassrooms(await this.getClassrooms()) 
        this.scrollObserver()
    }
}
</script>

<style scoped>
.modal.ofy.slick-modal .modal-close-btn {
    right: 16px;
}
</style>