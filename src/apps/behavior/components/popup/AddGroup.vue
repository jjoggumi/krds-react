<template>
    <div class="hi-modal-common modal-flex" style="display: block;">
        <div class="modal__dim"></div>
        <div class="behavior-modal01">
            <div class="behavior-modal-class-group-add">
                <div class="title-wrap">
                    <h2>새 모둠 만들기</h2>
                </div>

                <div class="content-wrap">
                    <div class="add">
                        <label>모둠명</label>
                        <input v-model="groupName" maxlength="20" type="text" />
                    </div>

                    <div class="list-wrap">
                        <span class="title">모둠 구성원 선택</span>
                        <div class="list" :class="{nodata: !isClassStudents}">
                            <template v-if="isClassStudents">
                                <div 
                                    v-for="student of students"
                                    :key="student.studentId"
                                    class="card"
                                    @click="clickStudent(student.studentId)"
                                >
                                    <p class="photo" :class="{select: getSelected(student.studentId)}">
                                        <img src="https://download.hiclass.net/7e70/8970/a570/c370/bdd23d26-c249-405b-be91-50c63b0b6026.gif" />
                                    </p>
                                    <p class="name"><strong>{{ student.studentNo }}</strong> {{student.studentName}}</p>
                                </div>
                            </template>
                            <template v-else>
                                <div class="nodata">
                                    <i class="bh-icon-warning-circle-fill-52"></i>
                                    <span>선택 가능한 구성원이 없습니다.<br/>
                                    학생 명단을 먼저 등록해주세요.</span>  
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <div class="btn-wrap">
                    <button @click="closeModal(false)">취소</button>
                    <button @click="regGroup" :disabled="!isSubmitActive" :class="{on: isSubmitActive}">만들기</button>
                </div>
            </div>
        </div>
    </div>    
</template>

<script>
import {mapActions, mapState} from 'vuex'
export default {
    name: 'add-group',
    data() {
        return {
            groupName: '',
            seletcedStudents: []
        }
    },
    computed: {
        ...mapState('storeBehavior', {
            curClassroom: 'curClassroom',
            students: 'students'
        }),
        classroomId: function() {
            return this.curClassroom.classroomId
        },
        isClassStudents: function() {
            return this.students.length > 0
        },
        isSubmitActive: function() {
            return this.seletcedStudents.length > 0 && this.groupName.trim()
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            getClassroomStudents: 'getClassroomStudents',
            addClassroomGroup: 'addClassroomGroup'
        }),
        getSelected: function(id) {
            return this.seletcedStudents.includes(id)
        },
        clickStudent: function(id) {
            if(this.getSelected(id)) {
                this.seletcedStudents = this.seletcedStudents.filter(o => o !== id)
            } else {
                this.seletcedStudents.push(id)
            }
        },
        closeModal: function(isReload) {
            this.$emit('close', isReload)
        },
        regGroup: async function() {
            if(this.isSubmitActive) {
                await this.addClassroomGroup({
                    classroomId: this.classroomId,
                    groupName: this.groupName,
                    studentIds: this.seletcedStudents
                })
                this.closeModal(true)
            }
        }
    },
    async created() {
        await this.getClassroomStudents({classroomId: this.classroomId, isHidden: false})
    }
}
</script>

<style>

</style>